import {
  emptyData,
  schemas,
  validateOperations,
  type Collection,
  type Operation,
} from "../domain/model";
import type { Repository } from "./repository";
export interface SqlDatabase {
  execAsync(sql: string): Promise<void>;
  getFirstAsync<T>(sql: string): Promise<T | null>;
  getAllAsync<T>(sql: string): Promise<T[]>;
  runAsync(sql: string, ...params: string[]): Promise<unknown>;
  withTransactionAsync(action: () => Promise<void>): Promise<void>;
  closeAsync(): Promise<void>;
}
export async function createSqlRepository(
  db: SqlDatabase,
): Promise<Repository> {
  const version = await db.getFirstAsync<{ user_version: number }>(
    "PRAGMA user_version;",
  );
  if ((version?.user_version ?? 0) > 1)
    throw new Error("This database needs a newer version of FORM.");
  await db.withTransactionAsync(async () => {
    await db.execAsync(`CREATE TABLE IF NOT EXISTS records(collection TEXT NOT NULL,id TEXT NOT NULL,body TEXT NOT NULL CHECK(json_valid(body)),PRIMARY KEY(collection,id));
      CREATE INDEX IF NOT EXISTS metric_history ON records(collection,json_extract(body,'$.metric'),json_extract(body,'$.recordedAt'));
      CREATE INDEX IF NOT EXISTS source_records ON records(collection,json_extract(body,'$.dataType'),json_extract(body,'$.sourceRecordId'));
      CREATE INDEX IF NOT EXISTS meal_dates ON records(collection,json_extract(body,'$.date'));
      PRAGMA user_version=1;`);
  });
  let chain: Promise<void> = Promise.resolve();
  return {
    async load() {
      const data = emptyData();
      for (const row of await db.getAllAsync<{
        collection: Collection;
        body: string;
      }>("SELECT collection,body FROM records")) {
        if (!schemas[row.collection])
          throw new Error("Unknown database collection.");
        const value = schemas[row.collection].parse(JSON.parse(row.body));
        (data[row.collection] as { id: string }[]).push(value);
      }
      return data;
    },
    commit(ops: Operation[]) {
      validateOperations(ops);
      const task = chain.then(() =>
        db.withTransactionAsync(async () => {
          for (const op of ops) {
            if (op.value === null)
              await db.runAsync(
                "DELETE FROM records WHERE collection=? AND id=?",
                op.collection,
                op.id,
              );
            else
              await db.runAsync(
                "INSERT INTO records(collection,id,body) VALUES(?,?,?) ON CONFLICT(collection,id) DO UPDATE SET body=excluded.body",
                op.collection,
                op.id,
                JSON.stringify(op.value),
              );
          }
        }),
      );
      chain = task.catch(() => undefined);
      return task;
    },
    async close() {
      await chain;
      await db.closeAsync();
    },
  };
}
