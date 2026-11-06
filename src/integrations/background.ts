import { Platform } from "react-native";
import * as TaskManager from "expo-task-manager";
import * as BackgroundTask from "expo-background-task";
import { syncHealth } from "./health-connect";
if (Platform.OS === "android")
  TaskManager.defineTask("form-health-import", async () => {
    try {
      await syncHealth();
      return BackgroundTask.BackgroundTaskResult.Success;
    } catch {
      return BackgroundTask.BackgroundTaskResult.Failed;
    }
  });
