import React, { useState } from "react";
import { router, useLocalSearchParams } from "expo-router";
import {
  Button,
  Card,
  Choices,
  Field,
  Notice,
  Screen,
  Txt,
  useAction,
} from "../src/components/ui";
import { commit, getProfile, uid, useData } from "../src/state/store";
import {
  metricNames,
  measurementSchema,
  type Metric,
} from "../src/domain/model";
import {
  metrics,
  fromCanonical,
  toCanonical,
  displayUnit,
  bloodPressureMessage,
} from "../src/domain/metrics";
export default function Log() {
  const params = useLocalSearchParams<{ metric?: string; id?: string }>();
  const d = useData(),
    p = getProfile();
  const existing = d.measurements.find((m) => m.id === params.id);
  const [metric, setMetric] = useState<Metric>(
    existing?.metric ??
      (metricNames.includes(params.metric as Metric)
        ? (params.metric as Metric)
        : p.hideWeight
          ? "waist"
          : "weight"),
  );
  const [value, setValue] = useState(
      existing
        ? fromCanonical(existing.value, existing.metric, p.units).toFixed(2)
        : "",
    ),
    [secondary, setSecondary] = useState(existing?.secondary?.toString() ?? ""),
    [notes, setNotes] = useState(existing?.notes ?? ""),
    [source, setSource] = useState(
      existing && !existing.sourceRecordId ? existing.source : "Manual",
    );
  const date = new Date(existing?.recordedAt ?? Date.now());
  const pad = (n: number) => String(n).padStart(2, "0");
  const [dateText, setDateText] = useState(
      `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`,
    ),
    [time, setTime] = useState(
      `${pad(date.getHours())}:${pad(date.getMinutes())}`,
    );
  const a = useAction();
  const imported = !!existing?.dataType;
  if (p.hideWeight && metric === "weight")
    return (
      <Screen title="Weight is hidden." back>
        <Notice text="Your weight history is retained privately. Change the visibility preference in Settings to view or edit it." />
        <Button onPress={() => router.push("/settings")}>
          Manage visibility
        </Button>
      </Screen>
    );
  return (
    <Screen
      title={existing ? "Review & correct" : "A new observation."}
      eyebrow="Your measurements"
      back
    >
      {imported && (
        <Notice text="Imported source records remain intact. Saving creates a separate manual correction; choose your preferred source in History." />
      )}
      <Card>
        <Choices
          label="Measurement group"
          options={["body", "activity", "recovery", "vital"] as const}
          value={metrics[metric].kind}
          onChange={(group) => {
            setMetric(
              metricNames.find(
                (m) =>
                  metrics[m].kind === group &&
                  !(p.hideWeight && m === "weight"),
              )!,
            );
            setValue("");
          }}
        />
        <Choices
          label="Measurement"
          options={metricNames.filter(
            (m) =>
              metrics[m].kind === metrics[metric].kind &&
              !(p.hideWeight && m === "weight"),
          )}
          value={metric}
          onChange={(m) => {
            setMetric(m);
            setValue("");
          }}
        />
        <Txt variant="heading">{metrics[metric].label}</Txt>
        <Field
          label={`Value (${displayUnit(metric, p.units)})${metric === "bloodPressure" ? " · systolic" : ""}`}
          value={value}
          onChange={setValue}
          keyboard="decimal-pad"
        />
        {metric === "bloodPressure" && (
          <Field
            label="Diastolic (mmHg)"
            value={secondary}
            onChange={setSecondary}
            keyboard="number-pad"
          />
        )}
        <Field
          label="Date (YYYY-MM-DD, device local)"
          value={dateText}
          onChange={setDateText}
        />
        <Field
          label="Time (HH:MM, device local)"
          value={time}
          onChange={setTime}
        />
        <Field label="Source or device" value={source} onChange={setSource} />
        <Field
          label="Notes / circumstances / pulse (optional)"
          value={notes}
          onChange={setNotes}
          multiline
        />
        {(metric === "bodyFat" || metric === "muscleMass") && (
          <Txt variant="caption">
            Consumer body-composition readings are estimates. Compare under
            similar measurement conditions.
          </Txt>
        )}
        {metric === "sleep" && (
          <Txt variant="caption">
            Record hours slept. Imported wearable entries may instead represent
            time in bed and identify this in their notes.
          </Txt>
        )}
        {a.error && <Notice text={a.error} error />}
        <Button
          disabled={a.busy}
          onPress={() =>
            a.run(async () => {
              if (!value.trim() || !Number.isFinite(Number(value)))
                throw new Error("Enter a valid numeric value.");
              const normalized = toCanonical(Number(value), metric, p.units);
              if (
                normalized < 0 ||
                normalized > metrics[metric].inputMax ||
                (["weight", "temperature", "bloodPressure"].includes(metric) &&
                  normalized === 0)
              )
                throw new Error(
                  `Check the ${metrics[metric].label.toLowerCase()} value and units.`,
                );
              if (
                !/^\d{4}-\d{2}-\d{2}$/.test(dateText) ||
                !/^\d{2}:\d{2}$/.test(time)
              )
                throw new Error("Use YYYY-MM-DD and HH:MM.");
              const [y, mo, da] = dateText.split("-").map(Number),
                [h, mi] = time.split(":").map(Number);
              const at = new Date(y!, mo! - 1, da!, h!, mi!);
              if (
                at.getFullYear() !== y ||
                at.getMonth() !== mo! - 1 ||
                at.getDate() !== da ||
                at.getHours() !== h ||
                at.getMinutes() !== mi ||
                at.getTime() > Date.now() + 300000
              )
                throw new Error(
                  "Enter a valid date and time that is not in the future.",
                );
              const now = new Date().toISOString(),
                id = existing && !imported ? existing.id : uid();
              const row = measurementSchema.parse({
                id,
                metric,
                value: normalized,
                secondary:
                  metric === "bloodPressure" ? Number(secondary) : undefined,
                unit: metrics[metric].unit,
                recordedAt: at.toISOString(),
                timezone: p.timezone,
                source: source.trim() || "Manual",
                original: {
                  value: Number(value),
                  unit: displayUnit(metric, p.units),
                },
                notes,
                updatedAt: now,
              });
              await commit([{ collection: "measurements", id, value: row }]);
              router.back();
            })
          }
        >
          {a.busy
            ? "Saving…"
            : imported
              ? "Save manual correction"
              : "Save measurement"}
        </Button>
      </Card>
      {metric === "bloodPressure" &&
        Number(value) > 0 &&
        Number(secondary) > 0 && (
          <Notice
            error={Number(value) >= 180 || Number(secondary) >= 120}
            text={bloodPressureMessage(Number(value), Number(secondary)).text}
          />
        )}
    </Screen>
  );
}
