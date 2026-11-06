import React from "react";
import { Card, Screen, Txt } from "../src/components/ui";
export default function Privacy() {
  return (
    <Screen
      title="Your data belongs to you."
      eyebrow="FORM · Privacy guide"
      back
    >
      <Card>
        <Txt variant="heading">What stays on this device</Txt>
        <Txt>
          Your profile, goals, manual observations, meals, workouts, routines
          and imported health records stay in local storage. Native builds use
          SQLCipher encryption with a device-bound key stored through
          SecureStore. No accounts, ads, health analytics or cloud services are
          used.
        </Txt>
        <Txt variant="heading">Health Connect access</Txt>
        <Txt>
          FORM reads only categories you select. Android permission settings
          control access; FORM also stops importing immediately when you
          disconnect in the app. Imported copies are stored locally. FORM never
          writes or deletes records in Samsung Health or Health Connect.
        </Txt>
        <Txt variant="heading">Camera and foods</Txt>
        <Txt>
          The camera is used only when you choose to scan a barcode. Photos are
          not uploaded or saved. Barcode matches use the local food catalog.
          USDA food files can be imported by you; the app contains no API key.
        </Txt>
        <Txt variant="heading">Exports and deletion</Txt>
        <Txt>
          JSON, CSV and PDF exports contain readable personal data. Sharing is
          your choice. Temporary native export files are removed when sharing
          completes. Importing an export merges records, with matching IDs
          replaced. Settings provides selective deletion and full journal
          erasure. Copies you exported must be deleted separately.
        </Txt>
        <Txt variant="heading">Limits of this version</Txt>
        <Txt>
          The browser preview uses unencrypted IndexedDB for development.
          Progress photographs, encrypted backup files, remote synchronization,
          iOS HealthKit and direct Samsung SDK integration are not implemented.
          App locking conceals the native interface; it does not encrypt an
          exported file.
        </Txt>
        <Txt variant="heading">Scientific transparency</Txt>
        <Txt>
          Food composition comes from identified USDA records or your entries.
          DRI references cover nonpregnant, nonlactating adults ages 19–50 with
          the selected reference table. Missing nutrient composition is never
          treated as zero. Rules provide informational patterns, not diagnoses
          or treatment. See docs/REFERENCES.md in the source for formulas and
          source details.
        </Txt>
      </Card>
    </Screen>
  );
}
