import assert from "node:assert/strict";
import test from "node:test";
import {
  applyOperations,
  defaultProfile,
  emptyData,
  validateOperations,
} from "../src/domain/model";
import {
  measurementCsv,
  parseBackup,
  serializeBackup,
} from "../src/domain/backup";
import { escapeHtml, reportHtml } from "../src/domain/report";
import { newSyncState } from "../src/integrations/sync-engine";
const data = () => {
  const d = emptyData();
  d.profiles = [{ ...defaultProfile(), onboarded: true }];
  return d;
};
test("JSON export round trips all domain records with explicit versioning", () => {
  const d = data();
  const ops = parseBackup(serializeBackup(d));
  const restored = applyOperations(emptyData(), ops);
  assert.deepEqual(restored, d);
});
test("exports strip device-specific change tokens, grants and app locking", () => {
  const d = data();
  d.sync = [
    {
      ...newSyncState("Steps"),
      token: "secret-token",
      enabled: true,
      granted: true,
    },
  ];
  d.profiles[0]!.biometricLock = true;
  const text = serializeBackup(d);
  assert.ok(!text.includes("secret-token"));
  const restored = applyOperations(emptyData(), parseBackup(text));
  assert.equal(restored.sync[0]?.enabled, false);
  assert.equal(restored.profiles[0]?.biometricLock, false);
});
test("wrong formats, unsupported schema versions and incomplete collections are rejected", () => {
  assert.throws(() => parseBackup("{}"));
  const raw = JSON.parse(serializeBackup(data()));
  raw.schemaVersion = 2;
  assert.throws(() => parseBackup(JSON.stringify(raw)));
  raw.schemaVersion = 1;
  delete raw.data.meals;
  assert.throws(() => parseBackup(JSON.stringify(raw)));
});
test("invalid numeric values and duplicate identifiers cannot reach persistence", () => {
  const d = data();
  d.profiles[0]!.age = NaN;
  assert.throws(() => parseBackup(serializeBackup(d)));
  const raw = JSON.parse(serializeBackup(data()));
  raw.data.profiles.push(raw.data.profiles[0]);
  assert.throws(() => parseBackup(JSON.stringify(raw)));
});
test("imports enforce a single profile and record identity", () => {
  const d = data();
  d.profiles = [];
  assert.throws(() => parseBackup(serializeBackup(d)));
  assert.throws(() =>
    validateOperations([
      { collection: "profiles", id: "wrong", value: defaultProfile() },
    ]),
  );
});
test("CSV quotes commas, embedded quotes and line breaks", () => {
  const d = data();
  d.measurements = [
    {
      id: "m",
      metric: "weight",
      value: 60,
      unit: "kg",
      recordedAt: "2026-11-05T00:00:00Z",
      timezone: "UTC",
      source: "Scale, home",
      notes: 'a "quote"\nline',
      updatedAt: "2026-11-05T00:00:00Z",
    },
  ];
  const csv = measurementCsv(d);
  assert.ok(csv.includes('"Scale, home"'));
  assert.ok(csv.includes('"a ""quote""\nline"'));
});
test("reports escape user input and describe missing values instead of fabricated totals", () => {
  const d = data();
  d.profiles[0]!.name = '<script>alert("x")</script>';
  const html = reportHtml(d, d.profiles[0]!, "2026-11-05");
  assert.ok(!html.includes("<script>"));
  assert.ok(html.includes("&lt;script&gt;"));
  assert.ok(html.includes("Not recorded"));
});
test("report findings and clinical notes cannot inject HTML", () => {
  assert.equal(
    escapeHtml('<img src=x onerror="x">'),
    "&lt;img src=x onerror=&quot;x&quot;&gt;",
  );
});
test("CSV neutralizes spreadsheet formulas in user-entered text", () => {
  const d = data();
  d.measurements = [
    {
      id: "m",
      metric: "weight",
      value: 60,
      unit: "kg",
      recordedAt: "2026-11-05T00:00:00Z",
      timezone: "UTC",
      source: "=1+1",
      notes: "@SUM(1)",
      updatedAt: "2026-11-05T00:00:00Z",
    },
  ];
  const csv = measurementCsv(d);
  assert.ok(csv.includes('"\'=1+1"'));
  assert.ok(csv.includes('"\'@SUM(1)"'));
});
