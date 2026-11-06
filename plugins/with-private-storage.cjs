const {
  withAndroidManifest,
  withDangerousMod,
} = require("@expo/config-plugins");
const fs = require("node:fs/promises");
const path = require("node:path");

module.exports = (config) => {
  config = withAndroidManifest(config, (mod) => {
    const manifest = mod.modResults.manifest,
      app = manifest.application[0];
    app.$["android:allowBackup"] = "false";
    app.$["android:fullBackupContent"] = "@xml/form_backup_rules";
    app.$["android:dataExtractionRules"] = "@xml/form_data_extraction_rules";
    manifest.queries = manifest.queries || [];
    if (
      !manifest.queries.some((q) =>
        (q.package || []).some(
          (p) => p.$["android:name"] === "com.google.android.apps.healthdata",
        ),
      )
    )
      manifest.queries.push({
        package: [
          { $: { "android:name": "com.google.android.apps.healthdata" } },
        ],
      });
    // Show privacy information even before React Native starts or while FORM is locked.
    app.activity = app.activity || [];
    for (const activity of app.activity) {
      if (activity.$["android:name"] === ".HealthPermissionsActivity") continue;
      activity["intent-filter"] = (activity["intent-filter"] || []).filter(
        (f) =>
          !(f.action || []).some(
            (a) =>
              a.$["android:name"] ===
              "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE",
          ),
      );
    }
    if (
      !app.activity.some(
        (a) => a.$["android:name"] === ".HealthPermissionsActivity",
      )
    )
      app.activity.push({
        $: {
          "android:name": ".HealthPermissionsActivity",
          "android:exported": "true",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name":
                    "androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE",
                },
              },
            ],
          },
        ],
      });
    app["activity-alias"] = app["activity-alias"] || [];
    if (
      !app["activity-alias"].some(
        (alias) => alias.$["android:name"] === "ViewPermissionUsageActivity",
      )
    )
      app["activity-alias"].push({
        $: {
          "android:name": "ViewPermissionUsageActivity",
          "android:exported": "true",
          "android:targetActivity": ".HealthPermissionsActivity",
          "android:permission":
            "android.permission.START_VIEW_PERMISSION_USAGE",
        },
        "intent-filter": [
          {
            action: [
              {
                $: {
                  "android:name": "android.intent.action.VIEW_PERMISSION_USAGE",
                },
              },
            ],
            category: [
              {
                $: {
                  "android:name": "android.intent.category.HEALTH_PERMISSIONS",
                },
              },
            ],
          },
        ],
      });
    for (const alias of app["activity-alias"])
      if (alias.$["android:name"] === "ViewPermissionUsageActivity")
        alias.$["android:targetActivity"] = ".HealthPermissionsActivity";
    return mod;
  });
  return withDangerousMod(config, [
    "android",
    async (mod) => {
      const base = mod.modRequest.platformProjectRoot;
      const xml = path.join(base, "app/src/main/res/xml");
      await fs.mkdir(xml, { recursive: true });
      const exclusions = ["root", "file", "database", "sharedpref", "external"]
        .map((domain) => `<exclude domain="${domain}" path="."/>`)
        .join("");
      await fs.writeFile(
        path.join(xml, "form_backup_rules.xml"),
        `<?xml version="1.0" encoding="utf-8"?><full-backup-content>${exclusions}</full-backup-content>`,
      );
      await fs.writeFile(
        path.join(xml, "form_data_extraction_rules.xml"),
        `<?xml version="1.0" encoding="utf-8"?><data-extraction-rules><cloud-backup disableIfNoEncryptionCapabilities="true">${exclusions}</cloud-backup><device-transfer>${exclusions}</device-transfer></data-extraction-rules>`,
      );
      const pkg = mod.android.package;
      const java = path.join(base, "app/src/main/java", ...pkg.split("."));
      await fs.mkdir(java, { recursive: true });
      await fs.writeFile(
        path.join(java, "HealthPermissionsActivity.kt"),
        `package ${pkg}

import android.app.Activity
import android.os.Bundle
import android.widget.ScrollView
import android.widget.TextView

class HealthPermissionsActivity : Activity() {
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    val explanation = TextView(this).apply {
      textSize = 17f
      val inset = (24 * resources.displayMetrics.density).toInt()
      setPadding(inset, inset, inset, inset)
      text = """FORM — Your health data\n\nFORM reads only the Health Connect categories you choose, to display your measurements and explain recorded trends. Permission does not guarantee that Samsung Health has shared data.\n\nRecords, original source metadata and synchronization checkpoints stay in an encrypted local database. The key uses device secure storage. FORM has no account, cloud sync, advertising or health-data analytics.\n\nYou can revoke Android permissions in Health Connect settings. Disconnecting inside FORM stops imports immediately. Deleting FORM's local copies does not delete the Health Connect or Samsung Health originals.\n\nYour manual logs work without health permissions. Only explicitly requested read permissions are used; FORM does not write external health records. Background import is optional and subject to Android restrictions.\n\nExports are readable files shared only when you choose. You can selectively remove data or erase the local journal in Settings. Exported copies must be removed separately.\n\nFORM is an informational wellness journal. It does not diagnose illness, prescribe supplements, or adjust medication."""
    }
    setContentView(ScrollView(this).apply { addView(explanation) })
  }
}
`,
      );
      return mod;
    },
  ]);
};
