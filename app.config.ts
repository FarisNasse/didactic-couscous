import type { ExpoConfig } from "expo/config";
const config: ExpoConfig = {
  name: "FORM",
  slug: "form-personal-health",
  scheme: "form",
  version: "0.1.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  newArchEnabled: true,
  android: {
    package: "com.form.personalhealth",
    allowBackup: false,
    blockedPermissions: [
      "android.permission.READ_EXTERNAL_STORAGE",
      "android.permission.WRITE_EXTERNAL_STORAGE",
      "android.permission.RECORD_AUDIO",
    ],
    permissions: [
      "android.permission.health.READ_STEPS",
      "android.permission.health.READ_WEIGHT",
      "android.permission.health.READ_SLEEP",
      "android.permission.health.READ_HEART_RATE",
      "android.permission.health.READ_RESTING_HEART_RATE",
      "android.permission.health.READ_BLOOD_PRESSURE",
      "android.permission.health.READ_BODY_FAT",
      "android.permission.health.READ_HYDRATION",
      "android.permission.health.READ_OXYGEN_SATURATION",
      "android.permission.health.READ_EXERCISE",
      "android.permission.health.READ_HEALTH_DATA_IN_BACKGROUND",
    ],
  },
  ios: {
    bundleIdentifier: "com.form.personalhealth",
    supportsTablet: true,
    infoPlist: {
      NSFaceIDUsageDescription:
        "Use Face ID to unlock your private FORM health journal.",
    },
  },
  web: { bundler: "metro", output: "single", name: "FORM · Personal health" },
  plugins: [
    "expo-router",
    "expo-notifications",
    ["expo-sqlite", { useSQLCipher: true }],
    ["expo-secure-store", { configureAndroidBackup: false }],
    [
      "expo-local-authentication",
      { faceIDPermission: "Unlock your private FORM journal." },
    ],
    [
      "expo-camera",
      {
        cameraPermission:
          "Scan a food barcode. Camera images are not uploaded.",
        recordAudioAndroid: false,
      },
    ],
    [
      "expo-build-properties",
      {
        android: {
          compileSdkVersion: 36,
          targetSdkVersion: 36,
          minSdkVersion: 26,
        },
      },
    ],
    "./plugins/with-private-storage.cjs",
  ],
  experiments: { typedRoutes: false },
};
export default config;
