import assert from "node:assert/strict";
import test from "node:test";
import { DatabaseSync } from "node:sqlite";
import {
  createSqlRepository,
  type SqlDatabase,
} from "../src/data/sql-repository";
import { defaultProfile, type Operation } from "../src/domain/model";
function database() {
  const sql = new DatabaseSync(":memory:");
  const adapter: SqlDatabase = {
    async execAsync(text) {
      sql.exec(text);
    },
    async getFirstAsync<T>(text: string) {
      return (sql.prepare(text).get() as T | undefined) ?? null;
    },
    async getAllAsync<T>(text: string) {
      return sql.prepare(text).all() as T[];
    },
    async runAsync(text, ...params) {
      return sql.prepare(text).run(...params);
    },
    async withTransactionAsync(fn) {
      sql.exec("BEGIN");
      try {
        await fn();
        sql.exec("COMMIT");
      } catch (e) {
        sql.exec("ROLLBACK");
        throw e;
      }
    },
    async closeAsync() {
      sql.close();
    },
  };
  return { sql, adapter };
}
test("SQLite migrations retain records and establish indexed primary-key storage", async () => {
  const { adapter, sql } = database();
  const repo = await createSqlRepository(adapter);
  await repo.commit([
    { collection: "profiles", id: "profile", value: defaultProfile() },
  ]);
  assert.equal((await repo.load()).profiles.length, 1);
  assert.equal(
    (sql.prepare("PRAGMA user_version").get() as { user_version: number })
      .user_version,
    1,
  );
  const again = await createSqlRepository(adapter);
  assert.equal((await again.load()).profiles.length, 1);
  await repo.close();
});
test("SQLite upserts retain a single row per identity and support deletion", async () => {
  const { adapter } = database();
  const repo = await createSqlRepository(adapter);
  await repo.commit([
    { collection: "profiles", id: "profile", value: defaultProfile() },
  ]);
  await repo.commit([
    {
      collection: "profiles",
      id: "profile",
      value: { ...defaultProfile(), name: "Changed" },
    },
  ]);
  assert.equal((await repo.load()).profiles.length, 1);
  assert.equal((await repo.load()).profiles[0]?.name, "Changed");
  await repo.commit([{ collection: "profiles", id: "profile", value: null }]);
  assert.equal((await repo.load()).profiles.length, 0);
  await repo.close();
});
test("a failed SQL write rolls back its entire batch and later writes recover", async () => {
  const { adapter, sql } = database();
  const repo = await createSqlRepository(adapter);
  sql.exec(
    "CREATE TRIGGER reject_blocked BEFORE INSERT ON records WHEN NEW.id='blocked' BEGIN SELECT RAISE(ABORT,'test failure'); END;",
  );
  const ops: Operation[] = [
    { collection: "profiles", id: "profile", value: defaultProfile() },
    {
      collection: "routines",
      id: "blocked",
      value: {
        id: "blocked",
        title: "Test",
        time: "Morning",
        completedDates: [],
        notes: "",
      },
    },
  ];
  await assert.rejects(repo.commit(ops));
  assert.equal((await repo.load()).profiles.length, 0);
  await repo.commit([
    { collection: "profiles", id: "profile", value: defaultProfile() },
  ]);
  assert.equal((await repo.load()).profiles.length, 1);
  await repo.close();
});
test("concurrent repository commits are serialized without nested transactions", async () => {
  const { adapter } = database();
  const repo = await createSqlRepository(adapter);
  await Promise.all(
    Array.from({ length: 12 }, (_, i) =>
      repo.commit([
        {
          collection: "routines",
          id: `r${i}`,
          value: {
            id: `r${i}`,
            title: "Routine",
            time: "Morning",
            completedDates: [],
            notes: "",
          },
        },
      ]),
    ),
  );
  assert.equal((await repo.load()).routines.length, 12);
  await repo.close();
});
test("databases from an unknown future schema fail without resetting data", async () => {
  const { adapter, sql } = database();
  sql.exec("PRAGMA user_version=999;");
  await assert.rejects(createSqlRepository(adapter), /newer version/);
  assert.equal(
    (sql.prepare("PRAGMA user_version").get() as { user_version: number })
      .user_version,
    999,
  );
  sql.close();
});
