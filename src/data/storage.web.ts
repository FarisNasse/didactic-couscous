import {
  emptyData,
  schemas,
  validateOperations,
  type Collection,
  type Data,
  type Operation,
} from "../domain/model";
import type { Repository } from "./repository";
/** Browser development preview. IndexedDB is intentionally separate from the encrypted native store. */
export async function openRepository(): Promise<Repository> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const r = indexedDB.open("form-preview-v1", 1);
    r.onupgradeneeded = () =>
      r.result.createObjectStore("records", { keyPath: "key" });
    r.onsuccess = () => resolve(r.result);
    r.onerror = () => reject(r.error);
    r.onblocked = () =>
      reject(new Error("Close other FORM preview tabs and retry."));
  });
  return {
    async load() {
      return new Promise<Data>((resolve, reject) => {
        const tx = db.transaction("records", "readonly");
        const request = tx.objectStore("records").getAll();
        request.onsuccess = () => {
          try {
            const d = emptyData();
            for (const row of request.result as {
              collection: Collection;
              value: unknown;
            }[]) {
              const parsed = schemas[row.collection].parse(row.value);
              (d[row.collection] as { id: string }[]).push(parsed);
            }
            resolve(d);
          } catch (e) {
            reject(e);
          }
        };
        request.onerror = () => reject(request.error);
      });
    },
    async commit(ops: Operation[]) {
      validateOperations(ops);
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction("records", "readwrite");
        const store = tx.objectStore("records");
        for (const op of ops) {
          const key = `${op.collection}:${op.id}`;
          if (op.value === null) store.delete(key);
          else store.put({ key, collection: op.collection, value: op.value });
        }
        tx.oncomplete = () => resolve();
        tx.onabort = () => reject(tx.error);
        tx.onerror = () => reject(tx.error);
      });
    },
    async close() {
      db.close();
    },
  };
}
