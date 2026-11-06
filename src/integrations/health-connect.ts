import { Platform } from "react-native";
import type { HealthConnectRecordResult } from "react-native-health-connect";
import type { Measurement, Operation } from "../domain/model";
import {
  zonedMidnight,
  daysBetween,
  localDay,
  addDays,
  metrics,
  mean,
} from "../domain/metrics";
import { commit, getData, getProfile, initialize } from "../state/store";
import {
  healthTypes,
  newSyncState,
  synchronize,
  type HealthDriver,
  type HealthType,
} from "./sync-engine";

const native = async () => {
  if (Platform.OS !== "android")
    throw new Error(
      "Health Connect is available in the Android development build. iOS and web support manual logging.",
    );
  return import("react-native-health-connect");
};
export async function healthAvailability(): Promise<string> {
  if (Platform.OS !== "android") return "Android development build required";
  try {
    const hc = await native();
    const status = await hc.getSdkStatus();
    return status === hc.SdkAvailabilityStatus.SDK_AVAILABLE
      ? "Available on this phone"
      : "Install or update Health Connect in Android settings";
  } catch {
    return "Health Connect native module unavailable. Rebuild the Android app.";
  }
}
export async function connectHealth(types: HealthType[]): Promise<void> {
  const hc = await native();
  if (!(await hc.initialize()))
    throw new Error(
      "Health Connect is unavailable. Install or update it and try again.",
    );
  const grants = await hc.requestPermission(
    types.map((recordType) => ({ recordType, accessType: "read" as const })),
  );
  await commit((current) =>
    healthTypes.map((type) => {
      const old = current.sync.find((s) => s.id === type) ?? newSyncState(type);
      return {
        collection: "sync" as const,
        id: type,
        value: {
          ...old,
          enabled: types.includes(type),
          granted: grants.some(
            (p) => p.recordType === type && p.accessType === "read",
          ),
          token: types.includes(type) ? old.token : null,
        },
      };
    }),
  );
  await syncHealth();
}
export async function openHealthSettings(): Promise<void> {
  (await native()).openHealthConnectSettings();
}
/** Disconnect is enforced in FORM immediately; Android permission revocation remains explicit. */
export async function disconnectHealth(): Promise<void> {
  await commit((d) =>
    d.sync.map((s) => ({
      collection: "sync" as const,
      id: s.id,
      value: { ...s, enabled: false, granted: false, token: null },
    })),
  );
}

function mapRecord(
  r: HealthConnectRecordResult,
  timezone: string,
): Measurement[] {
  if (!r.metadata?.id) return [];
  const now = new Date().toISOString();
  const time = "time" in r ? r.time : "startTime" in r ? r.startTime : now;
  const base = {
    id: `hc:${r.recordType}:${r.metadata.id}`,
    recordedAt: time,
    timezone,
    source: r.metadata.dataOrigin || "Health Connect",
    sourceRecordId: r.metadata.id,
    dataType: r.recordType,
    original: r,
    notes: "Imported from Health Connect",
    updatedAt: r.metadata.lastModifiedTime || now,
  };
  const make = (
    metric: Measurement["metric"],
    value: number,
    extra: Partial<Measurement> = {},
  ): Measurement[] =>
    Number.isFinite(value)
      ? [{ ...base, metric, value, unit: metrics[metric].unit, ...extra }]
      : [];
  switch (r.recordType) {
    case "Weight":
      return make("weight", r.weight.inKilograms);
    case "BodyFat":
      return make("bodyFat", r.percentage);
    case "RestingHeartRate":
      return make("restingHeartRate", r.beatsPerMinute);
    case "HeartRate": {
      const avg = mean(r.samples.map((s) => s.beatsPerMinute));
      return avg == null
        ? []
        : make("heartRate", avg, {
            endAt: r.endTime,
            notes:
              "Mean of recorded heart-rate samples in this interval; not resting heart rate.",
          });
    }
    case "BloodPressure":
      return make("bloodPressure", r.systolic.inMillimetersOfMercury, {
        secondary: r.diastolic.inMillimetersOfMercury,
      });
    case "Hydration":
      return make("water", r.volume.inMilliliters);
    case "OxygenSaturation":
      return make("oxygen", r.percentage);
    case "SleepSession":
      return make(
        "sleep",
        (Date.parse(r.endTime) - Date.parse(r.startTime)) / 3600000,
        {
          endAt: r.endTime,
          notes:
            "Wearable session duration (time in bed), not a precise measure of time asleep. Awake periods may be included.",
        },
      );
    case "ExerciseSession":
      return make(
        "activeMinutes",
        (Date.parse(r.endTime) - Date.parse(r.startTime)) / 60000,
        {
          endAt: r.endTime,
          notes: `Imported exercise session · ${r.title || r.exerciseType}. Duration does not determine exercise intensity.`,
        },
      );
    default:
      return [];
  }
}
let running: Promise<void> | null = null;
export async function syncHealth(): Promise<void> {
  if (running) return running;
  running = (async () => {
    await initialize();
    if (Platform.OS !== "android" || !getData().sync.some((s) => s.enabled))
      return;
    const hc = await native();
    if (!(await hc.initialize())) return;
    const timezone = getProfile().timezone;
    const driver: HealthDriver = {
      async granted() {
        return (await hc.getGrantedPermissions())
          .filter((p) => p.accessType === "read")
          .map((p) => p.recordType);
      },
      async token(type) {
        return (await hc.getChanges({ recordTypes: [type] })).nextChangesToken;
      },
      async snapshot(type, start, end) {
        if (type === "Steps") return [];
        const rows: Measurement[] = [];
        let pageToken: string | undefined;
        do {
          const page = await hc.readRecords(type, {
            timeRangeFilter: {
              operator: "between",
              startTime: start,
              endTime: end,
            },
            pageToken,
            pageSize: 1000,
          });
          rows.push(
            ...page.records.flatMap((r) =>
              mapRecord(r as HealthConnectRecordResult, timezone),
            ),
          );
          pageToken = page.pageToken;
        } while (pageToken);
        return rows;
      },
      async changes(type, token) {
        const page = await hc.getChanges({ changesToken: token });
        return {
          measurements: page.upsertionChanges.flatMap((c) =>
            mapRecord(c.record, timezone),
          ),
          deletedIds: page.deletionChanges.map((c) => c.recordId),
          nextToken: page.nextChangesToken,
          hasMore: page.hasMore,
          expired: page.changesTokenExpired,
        };
      },
      async stepTotals(start, end, zone) {
        const rows: Measurement[] = [];
        for (const date of daysBetween(
          localDay(start, zone),
          localDay(end, zone),
        )) {
          const from = zonedMidnight(date, zone).toISOString(),
            to = new Date(
              Math.min(
                zonedMidnight(addDays(date, 1), zone).getTime(),
                Date.parse(end),
              ),
            ).toISOString();
          if (from >= to) continue;
          const total = await hc.aggregateRecord({
            recordType: "Steps",
            timeRangeFilter: {
              operator: "between",
              startTime: from,
              endTime: to,
            },
          });
          if (total.COUNT_TOTAL != null && total.dataOrigins?.length)
            rows.push({
              id: `hc:steps:${zone}:${date}`,
              metric: "steps",
              value: total.COUNT_TOTAL,
              unit: "steps",
              recordedAt: from,
              endAt: to,
              timezone: zone,
              source: "Health Connect · aggregate",
              dataType: "Steps",
              notes: `Health Connect priority-aware aggregate; sources: ${total.dataOrigins.join(", ")}`,
              original: total,
              updatedAt: end,
            });
        }
        return rows;
      },
    };
    const end = new Date().toISOString();
    const start = zonedMidnight(
      addDays(localDay(end, timezone), -29),
      timezone,
    ).toISOString();
    await synchronize(
      driver,
      {
        get: getData,
        // Recheck inside the serialized mutation. A queued disconnect must win
        // over a late native read or changes response.
        commit: (ops) =>
          commit((current) =>
            ops.filter((op) => {
              if (op.collection === "sync")
                return current.sync.some((s) => s.id === op.id && s.enabled);
              if (op.collection === "measurements") {
                const type =
                  op.value?.dataType ??
                  current.measurements.find((m) => m.id === op.id)?.dataType;
                return current.sync.some((s) => s.id === type && s.enabled);
              }
              return false;
            }),
          ),
      },
      start,
      end,
      timezone,
    );
  })().finally(() => {
    running = null;
  });
  return running;
}
export async function enableBackground(): Promise<void> {
  const hc = await native();
  const permissions = await hc.requestPermission([
    { accessType: "read", recordType: "BackgroundAccessPermission" },
  ]);
  if (!permissions.some((p) => p.recordType === "BackgroundAccessPermission"))
    throw new Error(
      "Background read permission was not granted or is unsupported on this phone.",
    );
  const BackgroundTask = await import("expo-background-task");
  await BackgroundTask.registerTaskAsync("form-health-import", {
    minimumInterval: 60,
  });
}
