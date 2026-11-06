import React, { useState } from "react";
import { router } from "expo-router";
import {
  Button,
  Card,
  Chart,
  Choices,
  Field,
  Notice,
  Pill,
  Row,
  Screen,
  Section,
  Sheet,
  Stack,
  Txt,
  useAction,
} from "../../src/components/ui";
import {
  commit,
  getProfile,
  uid,
  updateProfile,
  useData,
} from "../../src/state/store";
import { physiqueGoals, metricNames } from "../../src/domain/model";
import {
  metrics,
  addDays,
  dailyValues,
  displayUnit,
  fromCanonical,
  latest,
  localDay,
} from "../../src/domain/metrics";
export default function Physique() {
  const d = useData(),
    p = getProfile(),
    a = useAction();
  const [open, setOpen] = useState(false),
    [title, setTitle] = useState(""),
    [time, setTime] = useState<"Morning" | "Evening" | "Anytime">("Morning");
  const today = localDay(new Date(), p.timezone);
  const [selected, setSelected] = useState<"waist" | "weight" | "hips">(
    p.hideWeight ? "waist" : "weight",
  );
  const displayed = p.hideWeight && selected === "weight" ? "waist" : selected;
  const points = dailyValues(d.measurements, displayed, p)
    .filter((v) => v.date >= addDays(today, -89))
    .map((v) => ({ ...v, value: fromCanonical(v.value, displayed, p.units) }));
  return (
    <Screen title="Progress on your terms." eyebrow="Physique & personal care">
      <Card tone="sage">
        <Pill>{p.phase}</Pill>
        <Txt variant="heading">{p.goal}</Txt>
        <Choices
          label="Preferred direction"
          options={physiqueGoals}
          value={p.goal}
          onChange={(goal) => void a.run(() => updateProfile({ goal }))}
        />
        <Txt>
          {p.priorities ||
            "Choose the silhouette you enjoy. Keep nutrition, strength and recovery part of your routine."}
        </Txt>
        <Txt variant="caption">
          Appearance preferences do not define your health status. Consumer
          composition readings are estimates.
        </Txt>
      </Card>
      {a.error && <Notice text={a.error} error />}
      <Section title="A wider view">
        <Card>
          <Choices
            options={
              p.hideWeight ? ["waist", "hips"] : ["weight", "waist", "hips"]
            }
            value={displayed}
            onChange={(v) => setSelected(v as typeof selected)}
          />
          <Txt variant="caption">
            90 days · {displayUnit(displayed, p.units)}
          </Txt>
          <Chart label={`${displayed} history`} points={points} />
          <Button
            kind="quiet"
            onPress={() => router.push(`/history?metric=${displayed}`)}
          >
            Explore history
          </Button>
        </Card>
      </Section>
      <Section
        title="Your measurements"
        aside={
          <Button kind="quiet" onPress={() => router.push("/log?metric=waist")}>
            Add entry
          </Button>
        }
      >
        <Row style={{ flexWrap: "wrap" }}>
          {metricNames
            .filter(
              (m) =>
                metrics[m].kind === "body" && !(p.hideWeight && m === "weight"),
            )
            .map((m) => {
              const item = latest(d.measurements, m, p.preferredSources[m]);
              return (
                <Card key={m} style={{ minWidth: 145, flex: 1 }}>
                  <Txt variant="caption">{metrics[m].label}</Txt>
                  <Txt variant="heading">
                    {item
                      ? fromCanonical(item.value, m, p.units).toFixed(1)
                      : "—"}{" "}
                    <Txt variant="caption">{displayUnit(m, p.units)}</Txt>
                  </Txt>
                  <Txt variant="caption">
                    {item
                      ? localDay(item.recordedAt, p.timezone)
                      : "No entry yet"}
                  </Txt>
                  <Button
                    kind="quiet"
                    onPress={() => router.push(`/history?metric=${m}`)}
                  >
                    History
                  </Button>
                </Card>
              );
            })}
        </Row>
      </Section>
      <Section
        title="Small acts of care"
        aside={
          <Button kind="quiet" onPress={() => setOpen(true)}>
            Add routine
          </Button>
        }
      >
        {!d.routines.length && (
          <Card>
            <Txt>
              Create an optional skincare, grooming or mobility routine.
            </Txt>
            <Txt variant="caption">
              These are personal reminders. FORM does not evaluate product
              safety or recommend treatments.
            </Txt>
          </Card>
        )}
        {d.routines.map((r) => (
          <Card key={r.id}>
            <Row style={{ justifyContent: "space-between" }}>
              <Stack style={{ gap: 4, flex: 1 }}>
                <Pill>{r.time}</Pill>
                <Txt style={{ fontWeight: "600" }}>{r.title}</Txt>
                <Txt variant="caption">
                  {r.completedDates.length} recorded days
                </Txt>
              </Stack>
              <Button
                kind={
                  r.completedDates.includes(today) ? "secondary" : "primary"
                }
                onPress={() =>
                  a.run(() =>
                    commit((data) => {
                      const current = data.routines.find((v) => v.id === r.id)!;
                      return [
                        {
                          collection: "routines",
                          id: r.id,
                          value: {
                            ...current,
                            completedDates: current.completedDates.includes(
                              today,
                            )
                              ? current.completedDates.filter(
                                  (x) => x !== today,
                                )
                              : [...current.completedDates, today],
                          },
                        },
                      ];
                    }),
                  )
                }
              >
                {r.completedDates.includes(today) ? "Done · undo" : "Mark done"}
              </Button>
            </Row>
            <Button
              kind="quiet"
              onPress={() =>
                a.run(() =>
                  commit([{ collection: "routines", id: r.id, value: null }]),
                )
              }
            >
              Remove routine
            </Button>
          </Card>
        ))}
      </Section>
      <Sheet
        visible={open}
        title="Create a personal routine"
        onClose={() => setOpen(false)}
      >
        <Field label="Routine name" value={title} onChange={setTitle} />
        <Choices
          label="Time of day"
          options={["Morning", "Evening", "Anytime"] as const}
          value={time}
          onChange={setTime}
        />
        {a.error && <Notice text={a.error} error />}
        <Button
          onPress={() =>
            a.run(async () => {
              if (!title.trim()) throw new Error("Give your routine a name.");
              const id = uid();
              await commit([
                {
                  collection: "routines",
                  id,
                  value: {
                    id,
                    title: title.trim(),
                    time,
                    completedDates: [],
                    notes: "",
                  },
                },
              ]);
              setOpen(false);
              setTitle("");
            })
          }
        >
          Save routine
        </Button>
      </Sheet>
    </Screen>
  );
}
