import test from "node:test";
import assert from "node:assert/strict";
import { createRequire } from "node:module";
import path from "node:path";
const require = createRequire(import.meta.url);
test("patched query parsing retains the CommonJS URL-decoding contract", () => {
  const query = require("query-string") as {
    parse: (query: string) => Record<string, string>;
  };
  assert.equal(
    query.parse("metric=sleep&label=hello%20world").label,
    "hello world",
  );
  assert.equal(query.parse("metric=sleep").metric, "sleep");
  assert.doesNotThrow(() => query.parse("input=" + "%E0%A4".repeat(4000)));
});
test("patched Metro can measure file assets with the current image reader", async () => {
  const entry = path.join(
    path.dirname(require.resolve("metro/package.json")),
    "src/Assets.js",
  );
  const { getAssetData } = require(entry) as {
    getAssetData: (
      file: string,
      relative: string,
      plugins: unknown[],
      platform: string,
      publicPath: string,
    ) => Promise<{ width: number; height: number }>;
  };
  const file = require.resolve("expo-router/assets/error.png");
  const asset = await getAssetData(
    file,
    path.relative(process.cwd(), file),
    [],
    "web",
    "/assets",
  );
  assert.equal(asset.width, 48);
  assert.equal(asset.height, 48);
});
