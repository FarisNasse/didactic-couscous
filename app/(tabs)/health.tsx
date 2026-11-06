import React, { useState } from "react";
import { router } from "expo-router";
import {
  Button,
  Card,
  Chart,
  Choices,
  Notice,
  Pill,
  Row,
  Screen,
  Section,
  Stack,
  Stat,
  Txt,
  useAction,
  Field,
} from "../../src/components/ui";
import { commit, getProfile, useData } from "../../src/state/store";
import {
  addDays,
  bloodPressureMessage,
  dailyValues,
  latest,
  localDay,
  mean,
} from "../../src/domain/metrics";
export default function Health() {
  const d = useData(),
    p = getProfile(),
    a = useAction();
  const today = localDay(new Date(), p.timezone),
    saved = d.checkins.find((c) => c.date === today);
  const [energy, setEnergy] = useState(saved?.energy ?? 3),
    [soreness, setSoreness] = useState(saved?.soreness ?? 1),
    [recovery, setRecovery] = useState(saved?.recovery ?? 3),
    [notes, setNotes] = useState(saved?.notes ?? ""),
    [message, setMessage] = useState("");
  const sleep = dailyValues(d.measurements, "sleep", p).filter(
    (v) => v.date >= addDays(today, -29) && v.date <= today,
  );
  const rhr = dailyValues(d.measurements, "restingHeartRate", p).filter(
    (v) => v.date >= addDays(today, -6) && v.date <= today,
  );
  const bp = latest(
    d.measurements,
    "bloodPressure",
    p.preferredSources.bloodPressure,
  );
  const weekSleep = sleep.filter((v) => v.date >= addDays(today, -6));
  return (
    <Screen title="Listen to your body." eyebrow="Health & recovery">
      <Row style={{ flexWrap: "wrap" }}>
        <Stat
          label="Sleep · recorded 7-day mean"
          value={mean(weekSleep.map((v) => v.value))?.toFixed(1) ?? "—"}
          unit="hours"
          detail={`${weekSleep.length} recorded nights`}
          onPress={() => router.push("/history?metric=sleep")}
        />
        <Stat
          label="Resting heart rate · 7 days"
          value={mean(rhr.map((v) => v.value))?.toFixed(0) ?? "—"}
          unit="bpm"
          detail={`${rhr.length} recorded days`}
          onPress={() => router.push("/history?metric=restingHeartRate")}
        />
      </Row>
      <Section title="Your sleep rhythm">
        <Card tone="lavender">
          <Chart label="Recorded sleep hours" points={sleep} />
          <Txt variant="caption">
            Most adults ages 18–60 need at least seven hours of sleep. Wearable
            stages and session durations are estimates and may include awake
            time.
          </Txt>
          <Row>
            <Button
              kind="secondary"
              onPress={() => router.push("/log?metric=sleep")}
            >
              Log sleep
            </Button>
            <Button
              kind="quiet"
              onPress={() => router.push("/history?metric=sleep")}
            >
              History & sources
            </Button>
          </Row>
        </Card>
      </Section>
      <Section title="A moment to check in">
        <Card>
          <Txt>How do you feel today?</Txt>
          {(
            [
              ["Energy", energy, setEnergy],
              ["Soreness", soreness, setSoreness],
              ["Perceived recovery", recovery, setRecovery],
            ] as const
          ).map(([label, value, set]) => (
            <Choices
              key={label}
              label={`${label} · 1 low, 5 high`}
              options={["1", "2", "3", "4", "5"]}
              value={String(value)}
              onChange={(v) => set(Number(v))}
            />
          ))}
          <Field
            label="Notes (optional)"
            value={notes}
            onChange={setNotes}
            multiline
          />
          {a.error && <Notice text={a.error} error />}
          {message && <Pill>{message}</Pill>}
          <Button
            disabled={a.busy}
            onPress={() =>
              a.run(async () => {
                await commit((current) => {
                  const existing = current.checkins.find(
                    (c) => c.date === today,
                  );
                  const id = existing?.id ?? today;
                  return [
                    {
                      collection: "checkins",
                      id,
                      value: {
                        id,
                        date: today,
                        energy,
                        soreness,
                        recovery,
                        notes,
                        nutritionComplete: existing?.nutritionComplete ?? false,
                      },
                    },
                  ];
                });
                setMessage("Check-in saved");
              })
            }
          >
            Save check-in
          </Button>
        </Card>
      </Section>
      <Section title="Blood pressure">
        <Card>
          <Row style={{ justifyContent: "space-between" }}>
            <Stack style={{ gap: 5 }}>
              <Txt variant="number">
                {bp ? `${bp.value} / ${bp.secondary}` : "— / —"}
              </Txt>
              <Txt variant="caption">
                mmHg ·{" "}
                {bp
                  ? new Date(bp.recordedAt).toLocaleString()
                  : "No recorded reading"}
              </Txt>
              <Txt variant="caption">
                {bp?.source ?? "Use a validated upper-arm cuff."}
              </Txt>
            </Stack>
            <Button
              kind="secondary"
              onPress={() => router.push("/log?metric=bloodPressure")}
            >
              Log
            </Button>
          </Row>
          {bp && (
            <Notice
              text={bloodPressureMessage(bp.value, bp.secondary!).text}
              error={bp.value >= 180 || bp.secondary! >= 120}
            />
          )}
          <Txt variant="caption">
            Readings are historical observations, not live monitoring. FORM does
            not diagnose, adjust medications or replace clinical care.
          </Txt>
          <Button
            kind="quiet"
            onPress={() => router.push("/history?metric=bloodPressure")}
          >
            View readings & context
          </Button>
        </Card>
      </Section>
      <Section title="Your other observations">
        <Row style={{ flexWrap: "wrap" }}>
          {(
            [
              "heartRate",
              "hrv",
              "oxygen",
              "glucose",
              "temperature",
              "cholesterol",
              "hba1c",
            ] as const
          ).map((metric) => (
            <Button
              key={metric}
              kind="secondary"
              onPress={() => router.push(`/history?metric=${metric}`)}
            >
              {
                {
                  heartRate: "Heart rate",
                  hrv: "HRV",
                  oxygen: "Oxygen",
                  glucose: "Glucose",
                  temperature: "Temperature",
                  cholesterol: "Cholesterol",
                  hba1c: "HbA1c",
                }[metric]
              }
            </Button>
          ))}
        </Row>
        <Txt variant="caption">
          Optional tracking for readings you already have. There is no need to
          order laboratory testing to fill empty fields.
        </Txt>
      </Section>
    </Screen>
  );
}
