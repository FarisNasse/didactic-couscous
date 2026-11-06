import {
  applyOperations,
  emptyData,
  schemas,
  validateOperations,
  type Collection,
  type Data,
  type Operation,
} from "./model";
export function serializeBackup(data: Data): string {
  validateOperations(
    (Object.keys(data) as Collection[]).flatMap((collection) =>
      data[collection].map(
        (value) => ({ collection, id: value.id, value }) as Operation,
      ),
    ),
  );
  return JSON.stringify(
    {
      format: "FORM",
      schemaVersion: 1,
      exportedAt: new Date().toISOString(),
      data: {
        ...data,
        sync: data.sync.map((s) => ({
          ...s,
          token: null,
          enabled: false,
          granted: false,
        })),
        profiles: data.profiles.map((p) => ({ ...p, biometricLock: false })),
      },
    },
    null,
    2,
  );
}
export function parseBackup(text: string): Operation[] {
  if (text.length > 30_000_000)
    throw new Error("This export exceeds the 30 MB import limit.");
  const raw = JSON.parse(text) as {
    format: string;
    schemaVersion: number;
    data: Record<string, unknown>;
  };
  if (raw.format !== "FORM" || raw.schemaVersion !== 1 || !raw.data)
    throw new Error("Choose a FORM version 1 JSON export.");
  const ops: Operation[] = [];
  for (const name of Object.keys(schemas) as Collection[]) {
    const list = raw.data[name];
    if (!Array.isArray(list)) throw new Error(`Missing collection: ${name}`);
    if (list.length > 100000)
      throw new Error("Too many records in this export.");
    const ids = new Set<string>();
    for (const item of list) {
      const value = schemas[name].parse(item);
      if (ids.has(value.id))
        throw new Error("Duplicate record identifiers in export.");
      ids.add(value.id);
      ops.push({ collection: name, id: value.id, value } as Operation);
    }
  }
  const staged = applyOperations(emptyData(), ops);
  if (staged.profiles.length !== 1 || staged.profiles[0]?.id !== "profile")
    throw new Error("An export must contain one profile.");
  // Reconnect locally; permission grants and changes tokens are device-specific.
  for (const s of staged.sync) {
    s.token = null;
    s.enabled = false;
    s.granted = false;
  }
  staged.profiles[0].biometricLock = false;
  return (Object.keys(staged) as Collection[]).flatMap((collection) =>
    staged[collection].map(
      (value) => ({ collection, id: value.id, value }) as Operation,
    ),
  );
}
export function measurementCsv(data: Data): string {
  const cell = (v: unknown) => {
    const text = String(v ?? "");
    const safe =
      typeof v === "string" && /^[\s]*[=+\-@]/.test(text) ? `'${text}` : text;
    return `"${safe.replace(/"/g, '""')}"`;
  };
  return [
    [
      "id",
      "metric",
      "value",
      "secondary",
      "unit",
      "recorded_at",
      "end_at",
      "timezone",
      "source",
      "notes",
    ],
    ...data.measurements.map((m) => [
      m.id,
      m.metric,
      m.value,
      m.secondary,
      m.unit,
      m.recordedAt,
      m.endAt,
      m.timezone,
      m.source,
      m.notes,
    ]),
  ]
    .map((row) => row.map(cell).join(","))
    .join("\r\n");
}
