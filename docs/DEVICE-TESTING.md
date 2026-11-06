# Native acceptance checks

These checks remain to be run on physical hardware. Source tests and bundle generation do not establish medical validity or guarantee provider availability.

## Android

1. Build/install with SDK 36 and a supported Android phone. Open without internet, finish onboarding and log a measurement, meal, recipe, workout set and routine. Force-stop and reopen; confirm all records remain.
2. Confirm SQLCipher `cipher_version` succeeds in a development build. Inspect the database file without its key to verify it is unreadable. Confirm Expo Go/plain-SQLite builds fail closed. Test storage-full/write failure without a silent reset.
3. Set up a Galaxy Watch measurement and Samsung Health's Health Connect sharing. Select only Steps, SleepSession and Weight in FORM. Confirm only the requested permission prompt and available imports. Compare timestamps, counts and source attribution.
4. Deny one category, grant a category with no records, revoke a granted category in Android settings, and disconnect during import. Distinguish denied, granted/no-data and stopped states. Check that late callbacks do not restore disabled imports.
5. Refresh twice, change an external weight entry and delete it in Health Connect. Confirm one local copy, an update and a deletion. Test interrupted imports and changes-token expiry. Confirm older data outside the readable reconciliation window is understood as retained history.
6. Record overlapping phone/watch steps. Compare FORM with Health Connect's aggregate, not a sum of source apps. Verify day boundaries across daylight-saving transitions and midnight in the configured timezone.
7. Check sleep-session time-in-bed wording, heart-rate interval mean versus actual resting-heart-rate records, and imported exercise-duration wording. Verify no category claims unsupported precision.
8. Enable background read and periodic import. Check after app backgrounding, device reboot and battery-saving mode. Timing must be described as system-controlled. Also deny/revoke background access and verify foreground logging still works.
9. Enable app locking. Test cancel, biometric failure, passcode fallback, cold launch, app switching, the permission sheet and export share sheet. Ensure private screens remain concealed until successful authentication.
10. Schedule, update and remove a daily reminder; deny notification access; erase the journal and confirm no reminder remains. Reminder text must contain no health readings.
11. Export JSON, CSV and PDF; cancel sharing; verify temporary export cleanup. Import a valid export and reject corrupt/oversized files. Check source preservation and device-token reset. Test restored data against new sources without duplicating imports.
12. Test text enlargement, TalkBack, keyboard entry, dark mode, small displays and permission/error states. Charts must have accessible descriptions and readable record history.
13. Check full deletion with an active connection/import and app lock. Confirm the original Samsung/Health Connect records remain intact. Exported copies outside FORM are not deleted.

## iOS

Build on macOS and verify SQLCipher persistence, Keychain behavior, biometric locking, native sharing/printing, camera barcode scanning and local reminders. Check encrypted database backup/restore and lost-key behavior. HealthKit is not implemented and must not appear connected. Cloud sync and encrypted photo storage must not be claimed.

## Distribution

Before public distribution, replace development identifiers and complete the platform privacy policy, Health Connect declarations, Play health-app review and production signing. Review dependencies and exercise/clinical wording. Run hardware acceptance checks with representative Samsung devices. A source patch is not an app-store approval or signed APK.
