import React from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import { Button, Notice, Stack, Txt, useAction } from "./ui";
export default function BarcodeScanner({
  onScan,
}: {
  onScan: (barcode: string) => void;
}) {
  const [permission, requestPermission] = useCameraPermissions();
  const a = useAction();
  if (!permission?.granted)
    return (
      <Stack>
        <Txt>
          Allow camera access to scan a barcode. No photographs are saved or
          uploaded.
        </Txt>
        {a.error && <Notice text={a.error} error />}
        <Button
          onPress={() =>
            a.run(async () => {
              const result = await requestPermission();
              if (!result.granted)
                throw new Error(
                  "Camera access was not granted. Enter the barcode into search instead.",
                );
            })
          }
        >
          Allow camera
        </Button>
      </Stack>
    );
  return (
    <CameraView
      style={{ height: 240, borderRadius: 16 }}
      barcodeScannerSettings={{
        barcodeTypes: ["ean13", "ean8", "upc_a", "upc_e"],
      }}
      onBarcodeScanned={({ data }) => onScan(data)}
    />
  );
}
