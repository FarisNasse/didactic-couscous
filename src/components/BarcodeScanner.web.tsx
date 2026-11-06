import React, { useEffect, useRef, useState } from "react";
import { Button, Notice, Stack, Txt, useAction } from "./ui";
type Detector = {
  detect: (video: HTMLVideoElement) => Promise<Array<{ rawValue: string }>>;
};
type DetectorConstructor = new (options: { formats: string[] }) => Detector;
export default function BarcodeScanner({
  onScan,
}: {
  onScan: (barcode: string) => void;
}) {
  const video = useRef<HTMLVideoElement | null>(null),
    stream = useRef<MediaStream | null>(null),
    alive = useRef(true);
  const [active, setActive] = useState(false);
  const a = useAction();
  const DetectorClass = (
    globalThis as unknown as { BarcodeDetector?: DetectorConstructor }
  ).BarcodeDetector;
  useEffect(
    () => () => {
      alive.current = false;
      stream.current?.getTracks().forEach((t) => t.stop());
    },
    [],
  );
  useEffect(() => {
    if (!active || !video.current || !DetectorClass) return;
    video.current.srcObject = stream.current;
    void video.current
      .play()
      .catch(() =>
        a.setError("Camera playback was blocked. Use barcode text search."),
      );
    const detector = new DetectorClass({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e"],
    });
    let cancelled = false,
      timer: ReturnType<typeof setTimeout>;
    const scan = async () => {
      if (cancelled || !video.current) return;
      try {
        const results = await detector.detect(video.current);
        if (results[0]) {
          stream.current?.getTracks().forEach((t) => t.stop());
          onScan(results[0].rawValue);
          return;
        }
      } catch {
        /* The first frame may not be ready. */
      }
      if (!cancelled) timer = setTimeout(scan, 500);
    };
    void scan();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [active]);
  if (!DetectorClass)
    return (
      <Notice text="This browser has no built-in barcode detector. Enter the barcode into food search, or scan with the native Android app. No camera data is uploaded." />
    );
  return (
    <Stack>
      {active ? (
        <video
          ref={video}
          muted
          playsInline
          style={{
            width: "100%",
            height: 240,
            objectFit: "cover",
            borderRadius: 16,
          }}
        />
      ) : (
        <Button
          onPress={() =>
            a.run(async () => {
              const result = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: "environment" },
                audio: false,
              });
              if (!alive.current) {
                result.getTracks().forEach((t) => t.stop());
                return;
              }
              stream.current = result;
              setActive(true);
            })
          }
        >
          Allow camera
        </Button>
      )}
      {a.error && <Notice text={a.error} error />}
      <Txt variant="caption">
        Scanning uses the browser’s built-in detector. No external scripts or
        image uploads.
      </Txt>
    </Stack>
  );
}
