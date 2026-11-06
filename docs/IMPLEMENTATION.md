# Implementation notes

## Organization

- `app/`: Expo Router routes and six bottom tabs.
- `src/components/`: accessible UI primitives, chart, plan editor and native reminder controls.
- `src/domain/`: validation, units, date grouping, nutrition, training, insights and report calculations.
- `src/data/`: repositories, schema migration, USDA seed data and explicitly fictional samples.
- `src/integrations/`: Health Connect adapter, testable sync engine, background task and user-controlled files.
- `src/state/`: subscribed store with serialized durable mutations.
- `tests/`: deterministic domain, backup, SQLite and integration tests.

## Persistence and encryption

The native app opens `form-v1.db` using Expo SQLite configured with SQLCipher. A random 256-bit key is stored using SecureStore with `WHEN_UNLOCKED_THIS_DEVICE_ONLY`. Every collection, including original provider payloads and changes tokens, is encrypted in that database. The app verifies `cipher_version` and fails closed if an Expo Go/plain-SQLite build is used. App content can be concealed behind native authentication on launch/resume.

Transactions intentionally use the already-keyed connection. Expo SQLite's exclusive transaction helper opens another connection, which would need its own SQLCipher key; it is not used. Repository and application mutations are serialized. IndexedDB is a separate, explicitly unencrypted browser-development adapter.

Each row has a collection, stable ID and validated JSON document. SQLite primary keys implement idempotent upserts. JSON-expression indexes cover measurement history, external IDs and diary dates. Schema version 1 is created transactionally; unknown newer schemas fail without resetting user data. This release loads local documents into a subscribed memory snapshot. Large multi-year sample-level datasets will require query-backed pagination; heart-rate imports currently store one interval mean and preserve the original samples in the encrypted payload.

Android backups are disabled in the generated application. Native database records remain encrypted at rest, but browser data and exported files do not. Secure erasure from flash, OS snapshots, third-party export destinations and device backups outside the app's control are not promised. The device-bound key can be lost on uninstall or device migration; export before moving devices. iOS backup policy and restore behavior require the device validation listed separately.

## Synchronization

Each selected Health Connect type has independent enabled/granted state, changes token, attempt/success timestamps and a redacted error. Snapshot import obtains a token first, reads all pages, then commits records and checkpoint together. Each incremental page applies upserts/deletions with the next token in one transaction. Expired tokens trigger a new controlled 30-day reconciliation, removing missing copies within that authorized window. Older retained records outside the readable window cannot be authoritatively reconciled after token expiry.

Steps always use Health Connect aggregate APIs, never a sum of phone/watch raw records. A 30-day daily aggregate window is refreshed to capture corrections and deletions. Dates use the selected profile zone with calendar-day boundaries. Raw source metadata is retained for other records; source preference prevents combining totals from competing providers. Sleep sessions from a selected source are unioned to avoid overlapping-interval double counting.

`HeartRate` is an interval sample mean; it is never relabeled as resting heart rate. `RestingHeartRate` uses that specific provider record. Imported sleep is labeled time in bed/session duration, including possible awake periods. Exercise-session duration does not imply moderate-intensity minutes. These limitations appear in entry notes and UI.

Foreground lifecycle events attempt imports; optional Expo BackgroundTask uses Android WorkManager. There is no JavaScript background timer. Android/provider restrictions, denied background permission and device key accessibility can delay work. The app does not promise continuous monitoring or clinical alerts.

## Nutrition and inference

Meal entries snapshot the selected food's nutrient composition at the time of logging. Updating the catalog does not retroactively rewrite a diary. Amounts are normalized per 100 g; recipes use finished weight, including cooking-related water changes. Unknown ingredient composition propagates to an unknown recipe nutrient. Duplicate ingredient rows are intentionally summed as actual ingredient quantities.

Coverage is the fraction of logged food entries with a known nutrient value, not proof that the person recorded all intake. A zero is accepted only as an explicit source value. Pattern rules require days marked complete and at least 90% composition coverage, across at least four days. Such patterns are observations of recorded intake, not diagnoses of deficiency.

U.S. DRI reference comparisons intentionally support only nonpregnant/nonlactating adult groups 19–50 in this release. Other groups retain logging without fabricated comparisons. No automatic calorie deficit, weight target, body-fat target, supplement prescription or medication adjustment is generated. Energy, protein, drinking water and activity targets are optional user inputs.

## Export and import

JSON exports include a format/version envelope. Imports validate every collection, reject duplicate IDs and oversized files, preview the count and merge atomically, replacing matching IDs. Device-specific tokens, grants and app locking are cleared. JSON export preserves source provenance and unknown nutrient values. CSV safely quotes text and prefixes potentially executable spreadsheet formulas. Report HTML escapes user text before native PDF/print rendering.

Exports contain readable sensitive records and require an explicit in-app action. Temporary native files are removed when the share sheet completes. External copies remain under the user's control. Full erasure stops imports, removes the daily reminder and deletes journal records, retaining only the bundled public food catalog and a fresh default profile.

## Intentionally outside this release

Encrypted photos, encrypted export archives, cloud synchronization, iOS HealthKit, remote food services, direct Samsung SDK and conversational coaching have no pretend integration. Native configuration generation and JavaScript export are not a substitute for Android/iOS compilation and physical-device acceptance testing.

The custom Android config plugin supplies a native Health Connect privacy activity and permission-usage alias, disables backup/device transfer of application data, and removes legacy storage/audio permissions. It replaces only the library's manifest config plugin; the Health Connect native bridge and Expo permission delegate still register through ordinary autolinking. The web barcode scanner uses a browser detector, when supported, with no third-party script downloads.

Dependency installation applies a narrowly scoped CommonJS adapter in query-string 7 so the patched ESM-only decode-uri-component can be consumed safely. The script also adapts Metro's filename-based image reads to the patched buffer API. It is idempotent and refuses unknown source layouts. Security overrides also update image-size and PostCSS and the modern glob/minimatch branches, while preserving legacy glob 7 consumers. A remaining low-severity deepmerge advisory concerns build/configuration merges; do not feed untrusted objects into the build configuration.
