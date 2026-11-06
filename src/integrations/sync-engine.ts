import type { Data, Measurement, Operation, SyncState } from "../domain/model";
export type HealthType =
  | "Steps"
  | "Weight"
  | "SleepSession"
  | "HeartRate"
  | "RestingHeartRate"
  | "BloodPressure"
  | "BodyFat"
  | "Hydration"
  | "OxygenSaturation"
  | "ExerciseSession";
export const healthTypes: HealthType[] = [
  "Steps",
  "Weight",
  "SleepSession",
  "HeartRate",
  "RestingHeartRate",
  "BloodPressure",
  "BodyFat",
  "Hydration",
  "OxygenSaturation",
  "ExerciseSession",
];
export interface HealthPage {
  measurements: Measurement[];
  deletedIds: string[];
  nextToken: string;
  hasMore: boolean;
  expired: boolean;
}
export interface HealthDriver {
  granted(): Promise<string[]>;
  token(type: HealthType): Promise<string>;
  snapshot(
    type: HealthType,
    start: string,
    end: string,
  ): Promise<Measurement[]>;
  changes(type: HealthType, token: string): Promise<HealthPage>;
  stepTotals(
    start: string,
    end: string,
    timezone: string,
  ): Promise<Measurement[]>;
}
export interface SyncRepository {
  get(): Data;
  commit(ops: Operation[]): Promise<void>;
}
/** Network-independent sync. Data and its checkpoint are committed in the same transaction. */
export async function synchronize(
  driver: HealthDriver,
  repo: SyncRepository,
  start: string,
  end: string,
  timezone: string,
): Promise<void> {
  const grants = await driver.granted();
  for (const type of healthTypes) {
    let state = repo.get().sync.find((s) => s.id === type);
    if (!state?.enabled) continue;
    const granted = grants.includes(type);
    state = { ...state, granted, lastAttempt: end, error: null };
    await repo.commit([{ collection: "sync", id: type, value: state }]);
    if (!granted) {
      await repo.commit([
        {
          collection: "sync",
          id: type,
          value: {
            ...state,
            token: null,
            error: "Permission not granted. Imports are paused.",
          },
        },
      ]);
      continue;
    }
    try {
      if (state.token) {
        let pages = 0;
        let token = state.token;
        while (true) {
          if (++pages > 1000)
            throw new Error("Import page limit reached. Retry to continue.");
          const page = await driver.changes(type, token);
          if (page.expired) {
            state = { ...state, token: null };
            break;
          }
          if (!repo.get().sync.find((s) => s.id === type)?.enabled) break;
          const ops: Operation[] = repo
            .get()
            .measurements.filter(
              (m) =>
                m.dataType === type &&
                m.sourceRecordId &&
                page.deletedIds.includes(m.sourceRecordId),
            )
            .map((m) => ({
              collection: "measurements",
              id: m.id,
              value: null,
            }));
          for (const m of page.measurements)
            ops.push({ collection: "measurements", id: m.id, value: m });
          token = page.nextToken;
          state = { ...state, token };
          ops.push({ collection: "sync", id: type, value: state });
          await repo.commit(ops);
          if (!page.hasMore) break;
        }
      }
      if (!state.token) {
        const token = await driver.token(type);
        const rows = await driver.snapshot(type, start, end);
        if (!repo.get().sync.find((s) => s.id === type)?.enabled) continue;
        const found = new Set(rows.map((r) => r.id));
        const removals: Operation[] = repo
          .get()
          .measurements.filter(
            (m) =>
              m.dataType === type &&
              m.recordedAt >= start &&
              m.recordedAt <= end &&
              !found.has(m.id),
          )
          .map((m) => ({ collection: "measurements", id: m.id, value: null }));
        state = { ...state, token };
        await repo.commit([
          ...removals,
          ...rows.map((m) => ({
            collection: "measurements" as const,
            id: m.id,
            value: m,
          })),
          { collection: "sync", id: type, value: state },
        ]);
      }
      if (!repo.get().sync.find((s) => s.id === type)?.enabled) continue;
      if (type === "Steps") {
        const rows = await driver.stepTotals(start, end, timezone);
        const found = new Set(rows.map((m) => m.id));
        if (!repo.get().sync.find((s) => s.id === type)?.enabled) continue;
        const remove: Operation[] = repo
          .get()
          .measurements.filter(
            (m) =>
              m.dataType === "Steps" &&
              m.recordedAt >= start &&
              m.recordedAt <= end &&
              !found.has(m.id),
          )
          .map((m) => ({ collection: "measurements", id: m.id, value: null }));
        await repo.commit([
          ...remove,
          ...rows.map((m) => ({
            collection: "measurements" as const,
            id: m.id,
            value: m,
          })),
        ]);
      }
      if (repo.get().sync.find((s) => s.id === type)?.enabled)
        await repo.commit([
          {
            collection: "sync",
            id: type,
            value: { ...state, lastSuccess: end, error: null },
          },
        ]);
    } catch {
      // Do not persist native exception strings: they may include sensitive records.
      const latest = repo.get().sync.find((s) => s.id === type) ?? state;
      await repo.commit([
        {
          collection: "sync",
          id: type,
          value: {
            ...latest,
            error:
              "Import interrupted. Reopen FORM or refresh to retry from the last committed checkpoint.",
          },
        },
      ]);
    }
  }
}
export const newSyncState = (id: string): SyncState => ({
  id,
  enabled: false,
  granted: false,
  token: null,
  lastSuccess: null,
  lastAttempt: null,
  error: null,
});
