// SDK 54's query-string 7 consumer expects a CommonJS callable. The patched
// decoder publishes an ESM default. Preserve that API without retaining the
// vulnerable decoder or copying third-party implementation code into FORM.
const fs = require("node:fs");
const target = require.resolve("query-string");
const before = "const decodeComponent = require('decode-uri-component');";
const after =
  "const decodeModule = require('decode-uri-component');\nconst decodeComponent = decodeModule.default || decodeModule;";
const source = fs.readFileSync(target, "utf8");
if (!source.includes(after)) {
  if (!source.includes(before))
    throw new Error(
      "The query-string decoder adapter needs review for the installed dependency version.",
    );
  fs.writeFileSync(target, source.replace(before, after));
}

// image-size 2 keeps the synchronous buffer API, but moved filename reads to a
// separate entry point. Metro 0.83 passes a filename in this one asset path.
const metroTarget = require("node:path").join(
  require("node:path").dirname(require.resolve("metro/package.json")),
  "src/Assets.js",
);
const metroBefore = "(0, _imageSize.default)(isImageInput)";
const metroAfter =
  "(0, _imageSize.default)(typeof isImageInput === 'string' ? _fs.default.readFileSync(isImageInput) : isImageInput)";
const metroSource = fs.readFileSync(metroTarget, "utf8");
if (!metroSource.includes(metroAfter)) {
  if (!metroSource.includes(metroBefore))
    throw new Error(
      "The Metro image-size adapter needs review for the installed dependency version.",
    );
  fs.writeFileSync(metroTarget, metroSource.replace(metroBefore, metroAfter));
}
