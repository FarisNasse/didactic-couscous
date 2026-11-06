# FORM

An Android-first, local-first physique and wellness journal built from the attached FORM product plan. React Native, TypeScript, Expo SDK 54, Expo Router, SQLCipher and Health Connect. No account, backend or paid API is required.

This patch creates a standalone project in an empty directory. It is a working first release, not a claim that every long-term feature in the product vision has shipped.

## Apply the patch

Download `FORM.patch`, then run:

```bash
mkdir form
cd form
git init
git apply --check ../FORM.patch
git apply ../FORM.patch
npm ci
```

Use Node 22.13 or newer. The patch includes its dependency lockfile. If applying inside an existing repository, choose an empty subdirectory with `git apply --directory=path/to/form ../FORM.patch` instead.

## Run on Android

Install Android Studio, Android SDK 36 and JDK 17; configure an emulator or connect an Android phone with USB debugging. Then:

```bash
npm run android
```

This generates the native project and builds a development client. For subsequent sessions:

```bash
npm start
```

**Use a development build, not Expo Go.** SQLCipher and Health Connect require native modules. Plain SQLite is deliberately rejected instead of silently saving health data without encryption.

An internal APK can also be built using EAS after configuring your own Expo account/project:

```bash
npx eas-cli build --platform android --profile preview
```

No EAS credentials or project IDs are embedded. Health Connect needs a supported Android device/provider, screen lock and appropriate permissions. Availability of a record type does not guarantee Samsung Health exports that category.

## Browser and iOS

```bash
npm run web
```

The responsive browser preview uses **unencrypted IndexedDB**, clearly labeled in Settings. It is intended for development with fictional data, not private health records. Manual logging and analysis work on the web; Health Connect, biometric locking and native reminders require the native build. Camera support depends on browser permissions and secure context. PDF export uses the browser print dialog.

On macOS with Xcode, `npm run ios` builds the manual-tracking app. HealthKit is not implemented; the iOS build has not been verified on a device here.

## What works

| Area                | Implemented behavior                                                                                                                                                                            |
| ------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Setup               | Optional profile fields, physique preference, focus, equipment, available time, dietary notes and movement limitations                                                                          |
| Today               | Modular activity, nutrition, recovery and physique cards; quick water entry; evidence-based briefing                                                                                            |
| Measurements        | 25 metric types, manual entry/corrections, unit conversion, timestamps, source attribution, history and preferred sources                                                                       |
| Nutrition           | Twelve real USDA foods offline, custom label entries, favorites, catalog barcode matching, portions, recipes and editable diaries                                                               |
| Nutrient analysis   | 44 tracked nutrients, all 13 essential vitamins, unknown-versus-zero handling, entry coverage and scoped upper-limit comparisons                                                                |
| References          | Versioned U.S. DRI planning values for nonpregnant/nonlactating adults 19–50; optional personal energy/protein/water/activity targets                                                           |
| Training            | Searchable exercise library, equipment-based starter routine, lighter option, saved custom plans with weekly schedules, resumable sessions, sets/reps/load/duration/distance/effort and history |
| Physique            | Self-selected appearance goals, circumference/body-composition history, optional hidden weight and personal-care routines                                                                       |
| Health              | Blood-pressure context and source, heart-rate history, sleep, hydration, optional lab/vital observations and recovery check-ins                                                                 |
| Insights            | Recorded-day rolling means, conservative nutrition patterns, matched-day correlations, evidence explanations, save/dismiss controls                                                             |
| Reports             | Weekly/monthly/quarterly printable reviews, native PDF sharing, full JSON export/import and measurement CSV                                                                                     |
| Privacy             | Native SQLCipher, device-bound SecureStore key, optional device authentication, selective/full deletion, no telemetry                                                                           |
| Reminders           | Opt-in daily local reminder with generic lock-screen text                                                                                                                                       |
| Android integration | Selected read permissions, foreground import, per-type change tokens, paginated updates/deletions, 30-day reconciliation, source metadata and aggregate steps                                   |
| Background import   | Optional Expo BackgroundTask/Android WorkManager scheduling after background-read permission; Android controls execution                                                                        |

Use Settings → **Explore with fictional sample data** to inspect a populated journal. Sample data is never loaded automatically. The app labels it and offers removal; the option is limited to an empty journal.

## Connect Samsung Health

1. Use the Android development build on a supported phone.
2. Enable Samsung Health → Health Connect sharing in Samsung Health settings.
3. In FORM Settings, select the categories you want and tap **Connect selected data**.
4. Grant the requested permissions. Review each category's grant status, record count, date range and last successful import.
5. Optionally enable background import. Permission and actual data availability are separate states.

FORM only reads. Disconnect stops FORM imports immediately; Android permissions can also be changed in Health Connect settings. Deleting a local copy never deletes the Samsung/Health Connect original. A later reconciliation may restore an external record deleted only from FORM.

## Verification

```bash
npm run check
npx expo install --check
npm run build:web
npx expo export --platform android --output-dir dist-android
npx expo prebuild --platform android --no-install
```

Tests cover unit conversions, day grouping, missing nutrient values, serving/recipe calculations, reference selection, nutrient-form mapping, source precedence, report escaping, import/export validation, SQLite rollback and concurrency, and permission/change-token synchronization scenarios.

An optional browser smoke test exercises onboarding, retained measurements, food portions, custom workout plans, session resume, routines, check-ins, insights, theme/weight preferences, exports/imports and journal erasure:

```bash
npx playwright install chromium
npm run build:web
npm run test:browser
```

The Android native project can be generated here, but the end-to-end Samsung Watch → Samsung Health → Health Connect path, SQLCipher on-device restart, biometric prompts and background timing still need testing on real hardware. See [device checks](docs/DEVICE-TESTING.md).

## Scope and design

The storage layer uses typed JSON documents in indexed SQLite rows rather than one SQL table per product entity. Writes and sync checkpoints commit atomically. UI state is a subscribed in-memory snapshot; mutations are serialized and only published after durable storage succeeds. The web adapter provides the same transaction semantics through IndexedDB. This keeps the application independent from health providers and leaves room for schema migrations.

Read [implementation notes](docs/IMPLEMENTATION.md), [scientific references](docs/REFERENCES.md) and the [original product vision](docs/PRODUCT-SPEC.md) before extending the application.

Deferred: encrypted progress-photo storage, HealthKit, extended-history permission, live remote USDA/barcode search, a larger bundled catalog, encrypted backup files, remote sync, a conversational assistant, direct Samsung SDK and wearable companions. The app does not expose nonfunctional controls for these features. Custom food entry and USDA JSON import work offline without an API key.

Build dependencies include scoped security overrides for the URI decoder, PostCSS, image-size, modern glob and minimatch. The install script adapts the patched ESM URI decoder and buffer-based image reader to their older Expo consumers; do not skip install scripts. The final production dependency audit has no high or critical advisories. A low-severity deepmerge advisory remains in Expo build/configuration tooling; migrating SDKs and reviewing dependencies is still required before public release.
