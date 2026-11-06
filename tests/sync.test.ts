import assert from "node:assert/strict";
import test from "node:test";
import {
  applyOperations,
  emptyData,
  validateOperations,
  type Measurement,
  type Operation,
} from "../src/domain/model";
import {
  newSyncState,
  synchronize,
  type HealthDriver,
  type HealthPage,
  type HealthType,
  type SyncRepository,
} from "../src/integrations/sync-engine";
const start = "2026-10-07T00:00:00Z",
  end = "2026-11-05T23:00:00Z";
const m = (id: string, value = 65, type = "Weight"): Measurement => ({
  id,
  metric: type === "Steps" ? "steps" : "weight",
  value,
  unit: type === "Steps" ? "steps" : "kg",
  recordedAt: "2026-11-01T12:00:00Z",
  source: "Test health origin",
  sourceRecordId: id,
  dataType: type,
  timezone: "UTC",
  notes: "",
  updatedAt: end,
});
function setup(type: HealthType = "Weight") {
  let data = emptyData();
  data.sync = [{ ...newSyncState(type), enabled: true }];
  const commits: Operation[][] = [];
  const repo: SyncRepository = {
    get: () => data,
    async commit(ops) {
      validateOperations(ops);
      data = applyOperations(data, ops);
      commits.push(ops);
    },
  };
  const page: HealthPage = {
    measurements: [],
    deletedIds: [],
    nextToken: "next",
    hasMore: false,
    expired: false,
  };
  const driver: HealthDriver = {
    async granted() {
      return [type];
    },
    async token() {
      return "baseline";
    },
    async snapshot() {
      return [m("external")];
    },
    async changes() {
      return page;
    },
    async stepTotals() {
      return [m("day-1", 5000, "Steps")];
    },
  };
  return { repo, driver, page, commits };
}
test("initial import persists source identifiers and a checkpoint", async () => {
  const { repo, driver } = setup();
  await synchronize(driver, repo, start, end, "UTC");
  assert.equal(repo.get().measurements[0]?.sourceRecordId, "external");
  assert.equal(repo.get().sync[0]?.token, "baseline");
  assert.equal(repo.get().sync[0]?.lastSuccess, end);
});
test("repeated snapshots and incremental upserts are idempotent", async () => {
  const { repo, driver, page } = setup();
  await synchronize(driver, repo, start, end, "UTC");
  page.measurements = [m("external", 66)];
  await synchronize(driver, repo, start, end, "UTC");
  await synchronize(driver, repo, start, end, "UTC");
  assert.equal(repo.get().measurements.length, 1);
  assert.equal(repo.get().measurements[0]?.value, 66);
});
test("source deletions remove only matching imported records", async () => {
  const { repo, driver, page } = setup();
  await synchronize(driver, repo, start, end, "UTC");
  await repo.commit([
    {
      collection: "measurements",
      id: "manual",
      value: {
        ...m("manual"),
        source: "Manual",
        dataType: undefined,
        sourceRecordId: undefined,
      },
    },
  ]);
  page.deletedIds = ["external"];
  await synchronize(driver, repo, start, end, "UTC");
  assert.deepEqual(
    repo.get().measurements.map((m) => m.id),
    ["manual"],
  );
});
test("expired tokens reconcile the authorized window and remove missing rows", async () => {
  const { repo, driver, page } = setup();
  await synchronize(driver, repo, start, end, "UTC");
  page.expired = true;
  driver.snapshot = async () => [m("replacement")];
  await synchronize(driver, repo, start, end, "UTC");
  assert.deepEqual(
    repo.get().measurements.map((m) => m.id),
    ["replacement"],
  );
  assert.equal(repo.get().sync[0]?.token, "baseline");
});
test("failed reads retain the previous checkpoint and expose a non-sensitive error", async () => {
  const { repo, driver } = setup();
  await synchronize(driver, repo, start, end, "UTC");
  driver.changes = async () => {
    throw new Error("Sensitive native payload");
  };
  await synchronize(driver, repo, start, end, "UTC");
  assert.equal(repo.get().sync[0]?.token, "baseline");
  assert.match(repo.get().sync[0]?.error ?? "", /interrupted/);
  assert.ok(!repo.get().sync[0]?.error?.includes("Sensitive"));
});
test("data and replacement token are committed atomically for each page", async () => {
  const { repo, driver, page, commits } = setup();
  await synchronize(driver, repo, start, end, "UTC");
  page.measurements = [m("updated")];
  await synchronize(driver, repo, start, end, "UTC");
  const batch = commits.find((ops) => ops.some((op) => op.id === "updated"));
  assert.ok(
    batch?.some((op) => op.collection === "sync" && op.value?.token === "next"),
  );
});
test("permission revocation pauses reads and discards the obsolete token", async () => {
  const { repo, driver } = setup();
  await synchronize(driver, repo, start, end, "UTC");
  driver.granted = async () => [];
  driver.changes = async () => {
    throw new Error("Must not be called");
  };
  await synchronize(driver, repo, start, end, "UTC");
  assert.equal(repo.get().sync[0]?.granted, false);
  assert.equal(repo.get().sync[0]?.token, null);
  assert.match(repo.get().sync[0]?.error ?? "", /Permission/);
});
test("categories checkpoint independently and a failed category does not block another", async () => {
  const { repo, driver } = setup();
  await repo.commit([
    {
      collection: "sync",
      id: "BodyFat",
      value: { ...newSyncState("BodyFat"), enabled: true },
    },
  ]);
  driver.granted = async () => ["Weight", "BodyFat"];
  driver.snapshot = async (type) => {
    if (type === "Weight") throw new Error("Unreadable");
    return [{ ...m("fat", 20, "BodyFat"), metric: "bodyFat", unit: "%" }];
  };
  await synchronize(driver, repo, start, end, "UTC");
  assert.ok(repo.get().sync.find((s) => s.id === "Weight")?.error);
  assert.equal(
    repo.get().sync.find((s) => s.id === "BodyFat")?.lastSuccess,
    end,
  );
});
test("paginated changes advance checkpoints without skipping deletions or updates", async () => {
  const { repo, driver } = setup();
  await synchronize(driver, repo, start, end, "UTC");
  let calls = 0;
  driver.changes = async () => {
    calls++;
    return {
      measurements: [m(`page-${calls}`)],
      deletedIds: calls === 1 ? ["external"] : [],
      nextToken: `page-token-${calls}`,
      expired: false,
      hasMore: calls === 1,
    };
  };
  await synchronize(driver, repo, start, end, "UTC");
  assert.equal(calls, 2);
  assert.equal(repo.get().measurements.length, 2);
  assert.equal(repo.get().sync[0]?.token, "page-token-2");
});
test("step aggregates replace previous daily totals rather than accumulating them", async () => {
  const { repo, driver } = setup("Steps");
  driver.snapshot = async () => [];
  await synchronize(driver, repo, start, end, "UTC");
  driver.stepTotals = async () => [m("day-1", 5500, "Steps")];
  await synchronize(driver, repo, start, end, "UTC");
  assert.equal(repo.get().measurements.length, 1);
  assert.equal(repo.get().measurements[0]?.value, 5500);
});
test("disconnect during a pending snapshot prevents late imported writes", async () => {
  const { repo, driver } = setup();
  driver.snapshot = async () => {
    await repo.commit([
      {
        collection: "sync",
        id: "Weight",
        value: { ...newSyncState("Weight"), enabled: false },
      },
    ]);
    return [m("late")];
  };
  await synchronize(driver, repo, start, end, "UTC");
  assert.equal(repo.get().measurements.length, 0);
  assert.equal(repo.get().sync[0]?.enabled, false);
});
test("disconnect during a step aggregate prevents late imported writes", async () => {
  const { repo, driver } = setup("Steps");
  driver.snapshot = async () => [];
  driver.stepTotals = async () => {
    await repo.commit([
      {
        collection: "sync",
        id: "Steps",
        value: { ...newSyncState("Steps"), enabled: false },
      },
    ]);
    return [m("late", 4000, "Steps")];
  };
  await synchronize(driver, repo, start, end, "UTC");
  assert.equal(repo.get().measurements.length, 0);
  assert.equal(repo.get().sync[0]?.enabled, false);
});
