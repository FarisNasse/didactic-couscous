import { useSyncExternalStore } from "react";
import * as Crypto from "expo-crypto";
import { openRepository } from "../data/storage";
import type { Repository } from "../data/repository";
import {
  applyOperations,
  defaultProfile,
  emptyData,
  validateOperations,
  type Data,
  type Operation,
  type Profile,
} from "../domain/model";
import { starterFoods } from "../data/foods";

export const uid = (): string => Crypto.randomUUID();
let data = emptyData();
let repository: Repository | null = null;
let initial: Promise<void> | null = null;
let chain: Promise<void> = Promise.resolve();
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());
export const getData = (): Data => data;
export const getProfile = (): Profile => data.profiles[0] ?? defaultProfile();
export function useData(): Data {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    getData,
    getData,
  );
}
export async function initialize(): Promise<void> {
  if (!initial)
    initial = (async () => {
      repository = await openRepository();
      data = await repository.load();
      const ops: Operation[] = [];
      if (!data.profiles.length)
        ops.push({
          collection: "profiles",
          id: "profile",
          value: defaultProfile(),
        });
      if (!data.foods.length)
        for (const f of starterFoods)
          ops.push({ collection: "foods", id: f.id, value: f });
      if (ops.length) {
        await repository.commit(ops);
        data = applyOperations(data, ops);
      }
      emit();
    })().catch((e) => {
      initial = null;
      throw e;
    });
  return initial;
}
/** Serialize mutations and derive them from the most recent committed snapshot. */
export function commit(
  change: Operation[] | ((current: Data) => Operation[]),
): Promise<void> {
  const operation = chain.then(async () => {
    if (!repository) await initialize();
    const ops = typeof change === "function" ? change(data) : change;
    validateOperations(ops);
    await repository!.commit(ops);
    data = applyOperations(data, ops);
    emit();
  });
  chain = operation.catch(() => undefined);
  return operation;
}
export const updateProfile = (patch: Partial<Profile>): Promise<void> =>
  commit((current) => [
    {
      collection: "profiles",
      id: "profile",
      value: { ...(current.profiles[0] ?? defaultProfile()), ...patch },
    },
  ]);
export async function deleteCollection(
  collection: Exclude<keyof Data, "profiles">,
): Promise<void> {
  await commit((current) =>
    current[collection].map(
      (row) => ({ collection, id: row.id, value: null }) as Operation,
    ),
  );
}
export async function deleteEverything(): Promise<void> {
  await commit((current) => [
    ...(Object.keys(current) as Array<keyof Data>).flatMap((collection) =>
      current[collection].map(
        (row) => ({ collection, id: row.id, value: null }) as Operation,
      ),
    ),
    { collection: "profiles", id: "profile", value: defaultProfile() },
    ...starterFoods.map((f) => ({
      collection: "foods" as const,
      id: f.id,
      value: f,
    })),
  ]);
}
