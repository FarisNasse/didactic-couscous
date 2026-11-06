import { Platform } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import * as Print from "expo-print";

export async function shareText(
  name: string,
  content: string,
  mime: string,
): Promise<void> {
  if (Platform.OS === "web") {
    const url = URL.createObjectURL(new Blob([content], { type: mime }));
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    return;
  }
  const path = FileSystem.cacheDirectory + name;
  try {
    await FileSystem.writeAsStringAsync(path, content, {
      encoding: FileSystem.EncodingType.UTF8,
    });
    if (!(await Sharing.isAvailableAsync()))
      throw new Error("Sharing is unavailable on this device.");
    await Sharing.shareAsync(path, {
      mimeType: mime,
      dialogTitle: "Export FORM records",
    });
  } finally {
    await FileSystem.deleteAsync(path, { idempotent: true });
  }
}
export async function pickJson(): Promise<string | null> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ["application/json", "text/plain"],
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (result.canceled) return null;
  const file = result.assets[0];
  if (!file) throw new Error("No file selected.");
  if (file.size && file.size > 30_000_000)
    throw new Error("Choose a JSON file smaller than 30 MB.");
  try {
    return Platform.OS === "web"
      ? await (await fetch(file.uri)).text()
      : await FileSystem.readAsStringAsync(file.uri);
  } finally {
    if (Platform.OS !== "web")
      await FileSystem.deleteAsync(file.uri, { idempotent: true });
  }
}
export async function shareReport(html: string): Promise<void> {
  if (Platform.OS === "web") {
    const preview = window.open("", "_blank");
    if (!preview) throw new Error("Allow a new window to print your report.");
    preview.document.write(html);
    preview.document.close();
    preview.focus();
    preview.print();
    return;
  }
  const file = await Print.printToFileAsync({ html });
  try {
    await Sharing.shareAsync(file.uri, {
      mimeType: "application/pdf",
      dialogTitle: "Share your FORM review",
    });
  } finally {
    await FileSystem.deleteAsync(file.uri, { idempotent: true });
  }
}
