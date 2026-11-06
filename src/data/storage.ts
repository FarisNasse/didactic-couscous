import * as SQLite from "expo-sqlite";
import * as SecureStore from "expo-secure-store";
import * as Crypto from "expo-crypto";
import type { Repository } from "./repository";
import { createSqlRepository } from "./sql-repository";

/** A single SQLCipher database; failed migrations never silently reset user records. */
export async function openRepository(): Promise<Repository> {
  let key = await SecureStore.getItemAsync("form.database-key.v1");
  if (!key) {
    key = Array.from(await Crypto.getRandomBytesAsync(32), (b) =>
      b.toString(16).padStart(2, "0"),
    ).join("");
    await SecureStore.setItemAsync("form.database-key.v1", key, {
      keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
    });
  }
  if (!/^[a-f0-9]{64}$/.test(key))
    throw new Error("The database key is invalid. Restore from a FORM export.");
  const db = await SQLite.openDatabaseAsync("form-v1.db");
  await db.execAsync(`PRAGMA key = "x'${key}'";`);
  const cipher = await db.getFirstAsync<Record<string, string>>(
    "PRAGMA cipher_version;",
  );
  if (!cipher) {
    await db.closeAsync();
    throw new Error(
      "This build does not include encrypted storage. Use the native development build described in README.md.",
    );
  }
  await db.execAsync(
    "PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000;",
  );
  // Keep this keyed connection. Expo's exclusive transaction helper opens a
  // fresh connection without the SQLCipher key; this repository serializes writes.
  return createSqlRepository(db);
}
