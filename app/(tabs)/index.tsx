import React from "react";
import { router } from "expo-router";
import {
  Button,
  Card,
  Chart,
  Icon,
  Pill,
  Row,
  Screen,
  Section,
  Stack,
  Stat,
  Txt,
  Notice,
  useAction,
} from "../../src/components/ui";
import { useData, getProfile, commit, uid } from "../../src/state/store";
import {
  addDays,
  dailyValues,
  displayUnit,
  fromCanonical,
  latest,
  localDay,
  rollingAverage,
} from "../../src/domain/metrics";
import { totals } from "../../src/domain/nutrition";
import { insights } from "../../src/domain/insights";
export default function Today() {
  const d = useData(),
    p = getProfile(),
    a = useAction();
  const today = localDay(new Date(), p.timezone);
  const meals = d.meals.filter((m) => m.date === today),
    sum = totals(meals);
  const day = (metric: Parameters<typeof dailyValues>[1]) =>
    dailyValues(d.measurements, metric, p).find((r) => r.date === today);
  const sleep = dailyValues(d.measurements, "sleep", p).slice(-1)[0];
  const weight = dailyValues(d.measurements, "weight", p).filter(
    (x) => x.date >= addDays(today, -29),
  );
  const avg = rollingAverage(weight, today);
  const briefing = insights(d, p, today)[0]!;
  const show = (key: (typeof p.dashboard)[number]) => p.dashboard.includes(key);
  return (
    <Screen
      title={
        p.name
          ? `Good ${new Date().getHours() < 12 ? "morning" : "day"}, ${p.name}.`
          : "A little better, every day."
      }
      eyebrow={new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        timeZone: p.timezone,
      })}
    >
      <Card tone="sage">
        <Row style={{ justifyContent: "space-between" }}>
          <Pill>{p.goal}</Pill>
          <Icon name="leaf-outline" size={25} />
        </Row>
        <Txt variant="heading">{briefing.title}</Txt>
        <Txt>{briefing.action}</Txt>
        <Txt variant="caption">Based on your recorded data · {p.phase}</Txt>
      </Card>
      <Row style={{ flexWrap: "wrap" }}>
        <Button icon="add" onPress={() => router.push("/log")}>
          Log a measurement
        </Button>
        <Button
          kind="secondary"
          icon="restaurant-outline"
          onPress={() => router.push("/nutrition")}
        >
          Log a meal
        </Button>
        <Button kind="quiet" onPress={() => router.push("/training")}>
          Train today
        </Button>
      </Row>
      {show("activity") && (
        <Section title="Your daily rhythm">
          <Row style={{ flexWrap: "wrap" }}>
            <Stat
              label="Steps"
              value={day("steps")?.value.toLocaleString() ?? "—"}
              unit="steps"
              detail={
                p.stepTarget
                  ? `Your goal · ${p.stepTarget.toLocaleString()}`
                  : "Set your own baseline"
              }
              onPress={() => router.push("/history?metric=steps")}
            />
            <Stat
              label="Water logged"
              value={
                day("water")
                  ? fromCanonical(
                      day("water")!.value,
                      "water",
                      p.units,
                    ).toFixed(0)
                  : "—"
              }
              unit={displayUnit("water", p.units)}
              detail={
                p.waterTarget
                  ? `Personal target · ${fromCanonical(p.waterTarget, "water", p.units).toFixed(0)} ${displayUnit("water", p.units)}`
                  : "Drinks recorded in FORM"
              }
              onPress={() => router.push("/history?metric=water")}
            />
          </Row>
          <Button
            kind="quiet"
            icon="water-outline"
            disabled={a.busy}
            onPress={() =>
              a.run(async () => {
                const now = new Date().toISOString(),
                  id = uid();
                await commit([
                  {
                    collection: "measurements",
                    id,
                    value: {
                      id,
                      metric: "water",
                      value: 250,
                      unit: "ml",
                      recordedAt: now,
                      timezone: p.timezone,
                      source: "Manual",
                      notes: "Quick add · 250 ml",
                      updatedAt: now,
                    },
                  },
                ]);
              })
            }
          >
            Add 250 ml water
          </Button>
        </Section>
      )}
      {a.error && <Notice text={a.error} error />}
      {show("nutrition") && (
        <Section
          title="Nourish your day"
          aside={
            <Button kind="quiet" onPress={() => router.push("/nutrition")}>
              View diary
            </Button>
          }
        >
          <Row style={{ flexWrap: "wrap" }}>
            <Stat
              label="Energy logged"
              value={sum.energy.value?.toFixed(0) ?? "—"}
              unit="kcal"
              detail={`${meals.length} food entries · ${sum.energy.coverage < 1 ? "partial composition" : "recorded total"}`}
            />
            <Stat
              label="Protein logged"
              value={sum.protein.value?.toFixed(0) ?? "—"}
              unit="g"
              detail={
                p.proteinTarget
                  ? `Personal target · ${p.proteinTarget} g`
                  : "No target selected"
              }
            />
          </Row>
        </Section>
      )}
      {show("recovery") && (
        <Section title="Space to recover">
          <Card tone="lavender">
            <Row style={{ justifyContent: "space-between" }}>
              <Stack style={{ gap: 4 }}>
                <Txt variant="caption">Last recorded sleep</Txt>
                <Txt variant="number">
                  {sleep?.value.toFixed(1) ?? "—"} <Txt>hours</Txt>
                </Txt>
                <Txt variant="caption">
                  {sleep
                    ? `${sleep.date} · ${sleep.source}`
                    : "Connect a wearable or add a sleep entry."}
                </Txt>
              </Stack>
              <Icon name="moon-outline" size={33} />
            </Row>
            <Button kind="quiet" onPress={() => router.push("/health")}>
              Sleep & recovery
            </Button>
          </Card>
        </Section>
      )}
      {show("physique") && !p.hideWeight && (
        <Section title="The bigger picture">
          <Card>
            <Row style={{ justifyContent: "space-between" }}>
              <Stack style={{ gap: 4 }}>
                <Txt variant="caption">7-day average · recorded days</Txt>
                <Txt variant="number">
                  {avg === null
                    ? "—"
                    : fromCanonical(avg, "weight", p.units).toFixed(1)}{" "}
                  <Txt variant="caption">{displayUnit("weight", p.units)}</Txt>
                </Txt>
              </Stack>
              <Button kind="quiet" onPress={() => router.push("/physique")}>
                Your progress
              </Button>
            </Row>
            <Chart
              label="Weight history"
              points={weight.map((w) => ({
                ...w,
                value: fromCanonical(w.value, "weight", p.units),
              }))}
            />
            <Txt variant="caption">
              Day-to-day changes are normal. FORM emphasizes the trend.
            </Txt>
          </Card>
        </Section>
      )}
      <Txt variant="caption">
        Your journal stays on this device.{" "}
        {d.sync.some((s) => s.enabled)
          ? "Health Connect imports when available."
          : "No health sources connected."}
      </Txt>
    </Screen>
  );
}
