import type { Measurement, Metric, Profile, UnitSystem } from "./model";

export const metrics: Record<
  Metric,
  {
    label: string;
    unit: string;
    kind: "body" | "activity" | "recovery" | "vital";
    inputMax: number;
  }
> = {
  weight: { label: "Body weight", unit: "kg", kind: "body", inputMax: 500 },
  waist: { label: "Waist", unit: "cm", kind: "body", inputMax: 300 },
  hips: { label: "Hips", unit: "cm", kind: "body", inputMax: 300 },
  chest: { label: "Chest", unit: "cm", kind: "body", inputMax: 300 },
  shoulders: { label: "Shoulders", unit: "cm", kind: "body", inputMax: 300 },
  arm: { label: "Upper arm", unit: "cm", kind: "body", inputMax: 150 },
  thigh: { label: "Thigh", unit: "cm", kind: "body", inputMax: 150 },
  calf: { label: "Calf", unit: "cm", kind: "body", inputMax: 150 },
  neck: { label: "Neck", unit: "cm", kind: "body", inputMax: 150 },
  bodyFat: {
    label: "Body fat estimate",
    unit: "%",
    kind: "body",
    inputMax: 100,
  },
  muscleMass: {
    label: "Muscle mass estimate",
    unit: "kg",
    kind: "body",
    inputMax: 300,
  },
  steps: {
    label: "Daily steps",
    unit: "steps",
    kind: "activity",
    inputMax: 200000,
  },
  distance: {
    label: "Walking distance",
    unit: "km",
    kind: "activity",
    inputMax: 500,
  },
  activeMinutes: {
    label: "Activity / exercise duration",
    unit: "min",
    kind: "activity",
    inputMax: 1440,
  },
  sleep: { label: "Sleep", unit: "h", kind: "recovery", inputMax: 24 },
  restingHeartRate: {
    label: "Resting heart rate",
    unit: "bpm",
    kind: "vital",
    inputMax: 300,
  },
  heartRate: { label: "Heart rate", unit: "bpm", kind: "vital", inputMax: 300 },
  hrv: { label: "HRV estimate", unit: "ms", kind: "recovery", inputMax: 1000 },
  bloodPressure: {
    label: "Blood pressure",
    unit: "mmHg",
    kind: "vital",
    inputMax: 300,
  },
  water: { label: "Water", unit: "ml", kind: "activity", inputMax: 10000 },
  oxygen: {
    label: "Oxygen saturation",
    unit: "%",
    kind: "vital",
    inputMax: 100,
  },
  glucose: {
    label: "Blood glucose",
    unit: "mg/dL",
    kind: "vital",
    inputMax: 1000,
  },
  temperature: {
    label: "Body temperature",
    unit: "°C",
    kind: "vital",
    inputMax: 50,
  },
  cholesterol: {
    label: "Total cholesterol",
    unit: "mg/dL",
    kind: "vital",
    inputMax: 1500,
  },
  hba1c: { label: "HbA1c", unit: "%", kind: "vital", inputMax: 30 },
};
export function displayUnit(metric: Metric, system: UnitSystem): string {
  const unit = metrics[metric].unit;
  if (system === "metric") return unit;
  return (
    (
      { kg: "lb", cm: "in", km: "mi", ml: "fl oz", "°C": "°F" } as Record<
        string,
        string
      >
    )[unit] || unit
  );
}
export function fromCanonical(
  value: number,
  metric: Metric,
  system: UnitSystem,
): number {
  if (system === "metric") return value;
  switch (metrics[metric].unit) {
    case "kg":
      return value / 0.45359237;
    case "cm":
      return value / 2.54;
    case "km":
      return value / 1.609344;
    case "ml":
      return value / 29.5735295625;
    case "°C":
      return value * 1.8 + 32;
    default:
      return value;
  }
}
export function toCanonical(
  value: number,
  metric: Metric,
  system: UnitSystem,
): number {
  if (system === "metric") return value;
  switch (metrics[metric].unit) {
    case "kg":
      return value * 0.45359237;
    case "cm":
      return value * 2.54;
    case "km":
      return value * 1.609344;
    case "ml":
      return value * 29.5735295625;
    case "°C":
      return (value - 32) / 1.8;
    default:
      return value;
  }
}
export const localDay = (
  value: string | Date = new Date(),
  timezone?: string,
): string => {
  const d = new Date(value);
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
};
export const addDays = (day: string, n: number): string => {
  const d = new Date(`${day}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};
export const daysBetween = (start: string, end: string): string[] => {
  const dates: string[] = [];
  for (let d = start; d <= end && dates.length < 3700; d = addDays(d, 1))
    dates.push(d);
  return dates;
};
export const mean = (values: number[]): number | null =>
  values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
export function latest(
  rows: Measurement[],
  metric: Metric,
  preferred?: string,
): Measurement | undefined {
  const candidates = rows.filter((r) => r.metric === metric);
  const preferredRows = preferred
    ? candidates.filter((r) => r.source === preferred)
    : [];
  return [...(preferredRows.length ? preferredRows : candidates)].sort((a, b) =>
    b.recordedAt.localeCompare(a.recordedAt),
  )[0];
}
/** Select one source per day; cumulative daily totals from overlapping sources are never added. */
export function dailyValues(
  rows: Measurement[],
  metric: Metric,
  profile: Profile,
): Array<{ date: string; value: number; source: string }> {
  const grouped = new Map<string, Measurement[]>();
  for (const row of rows.filter((r) => r.metric === metric)) {
    const day = localDay(
      metric === "sleep" && row.endAt ? row.endAt : row.recordedAt,
      profile.timezone,
    );
    grouped.set(day, [...(grouped.get(day) || []), row]);
  }
  return [...grouped]
    .map(([date, entries]) => {
      const preferred = profile.preferredSources[metric];
      const source = entries.some((e) => e.source === preferred)
        ? preferred!
        : entries.some((e) => e.source === "Health Connect · aggregate")
          ? "Health Connect · aggregate"
          : latest(entries, metric)!.source;
      const selected = entries.filter((e) => e.source === source);
      let value = latest(selected, metric)!.value;
      if (metric === "water" || metric === "activeMinutes")
        value = selected.reduce((sum, r) => sum + r.value, 0);
      if (metric === "sleep" && selected.every((r) => r.endAt)) {
        const intervals = selected
          .map(
            (r) =>
              [Date.parse(r.recordedAt), Date.parse(r.endAt!)] as [
                number,
                number,
              ],
          )
          .sort((a, b) => a[0] - b[0]);
        let duration = 0,
          end = 0;
        for (const [start, stop] of intervals) {
          duration += Math.max(0, stop - Math.max(start, end));
          end = Math.max(end, stop);
        }
        value = duration / 3600000;
      }
      return { date, value, source };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}
export function rollingAverage(
  points: Array<{ date: string; value: number }>,
  day: string,
  window = 7,
): number | null {
  return mean(
    points
      .filter((p) => p.date >= addDays(day, 1 - window) && p.date <= day)
      .map((p) => p.value),
  );
}
export function bloodPressureMessage(
  systolic: number,
  diastolic: number,
): { level: "urgent" | "review" | "info"; text: string } {
  if (systolic >= 180 || diastolic >= 120)
    return {
      level: "urgent",
      text: "If you have chest pain, shortness of breath, weakness, vision changes or difficulty speaking, call 911 now. Otherwise wait at least one minute and repeat. If it remains this high, contact a healthcare professional promptly. Do not change medication in FORM.",
    };
  if (systolic >= 130 || diastolic >= 80)
    return {
      level: "review",
      text: "This reading is above the usual adult reference. One reading does not diagnose hypertension. Repeat using a validated upper-arm cuff and discuss a pattern of elevated readings with your clinician.",
    };
  return {
    level: "info",
    text: "A single reading is a snapshot. Compare readings taken under similar conditions. FORM does not diagnose medical conditions.",
  };
}

/** Midnight in an IANA zone, preserving 23/25-hour daylight-saving days. */
export function zonedMidnight(day: string, zone: string): Date {
  const [y, m, d] = day.split("-").map(Number);
  const target = Date.UTC(y!, m! - 1, d!);
  let value = target;
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  });
  for (let i = 0; i < 4; i++) {
    const p = fmt.formatToParts(new Date(value));
    const n = (t: string) => Number(p.find((x) => x.type === t)?.value);
    const represented = Date.UTC(
      n("year"),
      n("month") - 1,
      n("day"),
      n("hour"),
      n("minute"),
      n("second"),
    );
    const delta = target - represented;
    if (!delta) break;
    value += delta;
  }
  return new Date(value);
}
