import React, { useEffect, useState } from "react";
import WorkoutPlanEditor from "../components/WorkoutPlanEditor";
import type { WorkoutPlan } from "../domain/model";
import { Pressable } from "react-native";
import {
  Button,
  Card,
  Choices,
  ConfirmButton,
  Empty,
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
} from "../components/ui";
import { commit, getProfile, uid, useData } from "../state/store";
import { type ExerciseSet, type Workout } from "../domain/model";
import {
  exercises,
  plan,
  progression,
  volume,
  type Exercise,
} from "../domain/training";
import { localDay } from "../domain/metrics";
export default function Training() {
  const d = useData(),
    p = getProfile(),
    a = useAction();
  const [tab, setTab] = useState("Plan"),
    [light, setLight] = useState(false),
    [search, setSearch] = useState(""),
    [detail, setDetail] = useState<Exercise | null>(null),
    [addOpen, setAddOpen] = useState(false),
    [rest, setRest] = useState(0),
    [planOpen, setPlanOpen] = useState(false);
  const current = d.workouts.find(
    (w) => !w.completedAt && w.source === "Manual",
  );
  const check = d.checkins.find(
    (c) => c.date === localDay(new Date(), p.timezone),
  );
  const routine = plan(p, light);
  const history = d.workouts
    .filter((w) => w.completedAt)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt));
  useEffect(() => {
    if (!rest) return;
    const timer = setInterval(() => setRest((r) => Math.max(0, r - 1)), 1000);
    return () => clearInterval(timer);
  }, [rest > 0]);
  const makeSet = (e: Exercise): ExerciseSet => ({
    id: uid(),
    exerciseId: e.id,
    reps: e.timed ? 0 : 10,
    kg: 0,
    seconds: e.timed ? 30 : 0,
    distanceKm: 0,
    rpe: null,
    done: false,
  });
  const updateSet = (id: string, patch: Partial<ExerciseSet>) =>
    a.run(() =>
      commit((data) => {
        const w = data.workouts.find((w) => w.id === current?.id);
        return w
          ? [
              {
                collection: "workouts",
                id: w.id,
                value: {
                  ...w,
                  sets: w.sets.map((s) =>
                    s.id === id ? { ...s, ...patch } : s,
                  ),
                },
              },
            ]
          : [];
      }),
    );
  async function start(custom?: WorkoutPlan) {
    if (current) {
      setTab("Session");
      return;
    }
    const id = uid();
    const w: Workout = {
      id,
      name:
        custom?.name ??
        (light ? "Recovery & mobility" : "Full body · " + p.equipment),
      startedAt: new Date().toISOString(),
      completedAt: null,
      notes: "",
      source: "Manual",
      sets: (custom
        ? custom.exerciseIds
            .map((id) => exercises.find((e) => e.id === id))
            .filter((e): e is Exercise => !!e)
        : routine
      ).flatMap((e) =>
        Array.from({ length: e.timed ? 1 : 2 }, () => makeSet(e)),
      ),
    };
    await commit([{ collection: "workouts", id, value: w }]);
    setTab("Session");
  }
  return (
    <Screen title="Strong in your own way." eyebrow="Training">
      <Choices
        options={["Plan", "Session", "Library", "History"]}
        value={tab}
        onChange={setTab}
      />
      {a.error && <Notice text={a.error} error />}
      {tab === "Plan" && (
        <>
          <Card tone="blue">
            <Pill>
              {p.trainingDays} days / week · {p.sessionMinutes} min available
            </Pill>
            <Txt variant="heading">
              {light ? "A gentler session." : "Your full-body foundation."}
            </Txt>
            <Txt>
              Practice controlled movements, keep a comfortable effort, and rest
              between sessions. Adjust the exercise list and sets in your
              session.
            </Txt>
            <Txt variant="caption">
              General starter routine for {p.equipment.toLowerCase()}. Your
              physique choice does not automatically change medical or exercise
              limits.
            </Txt>
            <Choices
              label="Today’s approach"
              options={["Standard", "Lighter"]}
              value={light ? "Lighter" : "Standard"}
              onChange={(v) => setLight(v === "Lighter")}
            />
            {check && (check.soreness >= 4 || check.energy <= 2) && (
              <Notice text="You reported soreness or low energy. Consider the lighter option if it feels appropriate." />
            )}
            {p.limitations && (
              <Notice
                text={`Your recorded limitations: ${p.limitations}. Review this general routine with a qualified professional where needed.`}
              />
            )}
            <Button onPress={() => a.run(start)} disabled={a.busy}>
              {current ? "Resume saved session" : "Start a session"}
            </Button>
          </Card>
          <Section
            title="Saved workout plans"
            aside={
              <Button kind="quiet" onPress={() => setPlanOpen(true)}>
                Create plan
              </Button>
            }
          >
            {!d.workoutPlans.length && (
              <Card>
                <Txt>Choose your own exercises and weekly schedule.</Txt>
                <Button kind="secondary" onPress={() => setPlanOpen(true)}>
                  Create a workout plan
                </Button>
              </Card>
            )}
            {d.workoutPlans.map((w) => (
              <Card key={w.id}>
                <Txt variant="heading">{w.name}</Txt>
                <Txt variant="caption">
                  {w.weekdays.length
                    ? w.weekdays.join(" · ")
                    : "Flexible schedule"}{" "}
                  · {w.exerciseIds.length} movements
                </Txt>
                <Button onPress={() => a.run(() => start(w))}>
                  {current ? "Resume active session" : "Start this plan"}
                </Button>
                <ConfirmButton
                  label="Delete plan"
                  detail="Remove this plan? Completed workout history is retained."
                  onConfirm={() =>
                    commit([
                      { collection: "workoutPlans", id: w.id, value: null },
                    ])
                  }
                />
              </Card>
            ))}
          </Section>
          <Section title="Your movement menu">
            {routine.map((e, i) => (
              <Card key={e.id}>
                <Row style={{ justifyContent: "space-between" }}>
                  <Stack style={{ gap: 4, flex: 1 }}>
                    <Txt variant="label">
                      0{i + 1} · {e.muscle}
                    </Txt>
                    <Txt variant="heading">{e.name}</Txt>
                    <Txt variant="caption">
                      {e.timed
                        ? "Comfortable duration"
                        : "Begin with 2 sets · 8–12 comfortable reps"}
                    </Txt>
                  </Stack>
                  <Button kind="quiet" onPress={() => setDetail(e)}>
                    How to
                  </Button>
                </Row>
              </Card>
            ))}
          </Section>
          <Txt variant="caption">
            General adult guidance: at least 150 moderate-intensity minutes and
            strength work on two days weekly. Imported exercise durations are
            not automatically classified as moderate intensity.
          </Txt>
        </>
      )}
      {tab === "Session" &&
        (current ? (
          <>
            <Card tone="sage">
              <Pill>Saved on this device</Pill>
              <Txt variant="heading">{current.name}</Txt>
              <Txt variant="caption">
                Started {new Date(current.startedAt).toLocaleString()} ·{" "}
                {current.sets.filter((s) => s.done).length} /{" "}
                {current.sets.length} sets logged
              </Txt>
              <Button kind="secondary" onPress={() => setRest(rest ? 0 : 90)}>
                {rest ? `Rest · ${rest}s · stop` : "Start 90-second rest"}
              </Button>
            </Card>
            {[...new Set(current.sets.map((s) => s.exerciseId))].map(
              (exerciseId) => {
                const e = exercises.find((e) => e.id === exerciseId);
                return (
                  <Card key={exerciseId}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Txt variant="heading" style={{ flex: 1 }}>
                        {e?.name ?? exerciseId}
                      </Txt>
                      {e && (
                        <Button kind="quiet" onPress={() => setDetail(e)}>
                          Guide
                        </Button>
                      )}
                    </Row>
                    <Txt variant="caption">
                      {progression(exerciseId, history)}
                    </Txt>
                    {current.sets
                      .filter((s) => s.exerciseId === exerciseId)
                      .map((s, i) => (
                        <Stack key={s.id} style={{ gap: 9 }}>
                          <Txt variant="label">
                            Set {i + 1}
                            {s.done ? " · recorded" : ""}
                          </Txt>
                          <Row style={{ flexWrap: "wrap" }}>
                            {(e?.timed
                              ? ["seconds", "distanceKm"]
                              : ["reps", "kg"]
                            ).map((field) => (
                              <Stack
                                key={field}
                                style={{ flex: 1, minWidth: 110 }}
                              >
                                <Field
                                  label={
                                    field === "kg"
                                      ? "Resistance (kg)"
                                      : field === "reps"
                                        ? "Reps"
                                        : field === "seconds"
                                          ? "Duration (seconds)"
                                          : "Distance (km)"
                                  }
                                  value={String(
                                    s[field as keyof ExerciseSet] ?? 0,
                                  )}
                                  onChange={(v) => {
                                    const value = Number(v);
                                    if (Number.isFinite(value) && value >= 0)
                                      void updateSet(s.id, { [field]: value });
                                  }}
                                  keyboard="decimal-pad"
                                />
                              </Stack>
                            ))}
                          </Row>
                          <Field
                            label="Perceived effort (1–10, optional)"
                            value={s.rpe?.toString() ?? ""}
                            onChange={(v) => {
                              const n = Number(v);
                              if (
                                !v ||
                                (Number.isFinite(n) && n >= 0 && n <= 10)
                              )
                                void updateSet(s.id, { rpe: v ? n : null });
                            }}
                            keyboard="decimal-pad"
                          />
                          <Row>
                            <Button
                              kind={s.done ? "secondary" : "primary"}
                              onPress={() => updateSet(s.id, { done: !s.done })}
                            >
                              {s.done ? "Undo recorded set" : "Record set"}
                            </Button>
                            <Button
                              kind="quiet"
                              onPress={() =>
                                a.run(() =>
                                  commit((data) => {
                                    const w = data.workouts.find(
                                      (w) => w.id === current.id,
                                    )!;
                                    return [
                                      {
                                        collection: "workouts",
                                        id: w.id,
                                        value: {
                                          ...w,
                                          sets: w.sets.filter(
                                            (x) => x.id !== s.id,
                                          ),
                                        },
                                      },
                                    ];
                                  }),
                                )
                              }
                            >
                              Remove
                            </Button>
                          </Row>
                        </Stack>
                      ))}
                    {e && (
                      <Button
                        kind="secondary"
                        onPress={() =>
                          a.run(() =>
                            commit((data) => {
                              const w = data.workouts.find(
                                (w) => w.id === current.id,
                              )!;
                              return [
                                {
                                  collection: "workouts",
                                  id: w.id,
                                  value: {
                                    ...w,
                                    sets: [...w.sets, makeSet(e)],
                                  },
                                },
                              ];
                            }),
                          )
                        }
                      >
                        Add set
                      </Button>
                    )}
                  </Card>
                );
              },
            )}
            <Button kind="secondary" onPress={() => setAddOpen(true)}>
              Add exercise
            </Button>
            <Button
              disabled={!current.sets.some((s) => s.done) || a.busy}
              onPress={() =>
                a.run(async () => {
                  await commit((data) => {
                    const w = data.workouts.find((w) => w.id === current.id)!;
                    return [
                      {
                        collection: "workouts",
                        id: w.id,
                        value: { ...w, completedAt: new Date().toISOString() },
                      },
                    ];
                  });
                  setRest(0);
                  setTab("History");
                })
              }
            >
              Finish workout
            </Button>
            <ConfirmButton
              label="Discard this session"
              detail="Delete this unfinished workout and its sets?"
              onConfirm={() =>
                commit([
                  { collection: "workouts", id: current.id, value: null },
                ])
              }
            />
          </>
        ) : (
          <Empty
            title="Ready when you are."
            detail="Start a session from your plan. Every recorded set is saved locally so you can resume later."
            action={
              <Button onPress={() => setTab("Plan")}>View my plan</Button>
            }
          />
        ))}
      {tab === "Library" && (
        <>
          <Field
            label="Search exercises or muscle groups"
            value={search}
            onChange={setSearch}
          />
          {exercises
            .filter((e) =>
              `${e.name} ${e.muscle} ${e.equipment}`
                .toLowerCase()
                .includes(search.toLowerCase()),
            )
            .map((e) => (
              <Card key={e.id}>
                <Pill>
                  {e.muscle} · {e.equipment}
                </Pill>
                <Txt variant="heading">{e.name}</Txt>
                <Txt>{e.instructions}</Txt>
                <Txt variant="caption">
                  Alternative: {e.alternative}. Use a pain-free range. Stop if
                  you feel unwell.
                </Txt>
              </Card>
            ))}
        </>
      )}
      {tab === "History" &&
        (!history.length ? (
          <Empty
            title="Your first session starts here."
            detail="Completed workouts will show your sets, resistance and recorded training volume."
          />
        ) : (
          history.map((w) => (
            <Card key={w.id}>
              <Txt variant="heading">{w.name}</Txt>
              <Txt variant="caption">
                {new Date(w.startedAt).toLocaleDateString()} ·{" "}
                {w.sets.filter((s) => s.done).length} completed sets
              </Txt>
              <Txt>{volume(w).toFixed(0)} kg × reps external volume</Txt>
              <Txt variant="caption">
                Bodyweight and timed exercises are excluded from external load
                totals.
              </Txt>
              {w.sets
                .filter((s) => s.done)
                .map((s) => (
                  <Txt key={s.id} variant="caption">
                    {exercises.find((e) => e.id === s.exerciseId)?.name ??
                      s.exerciseId}{" "}
                    ·{" "}
                    {s.seconds
                      ? `${s.seconds}s`
                      : `${s.reps} reps × ${s.kg} kg`}
                    {s.rpe ? ` · effort ${s.rpe}/10` : ""}
                  </Txt>
                ))}
              <ConfirmButton
                label="Delete workout"
                detail="Remove this completed workout from history?"
                onConfirm={() =>
                  commit([{ collection: "workouts", id: w.id, value: null }])
                }
              />
            </Card>
          ))
        ))}
      {planOpen && <WorkoutPlanEditor onClose={() => setPlanOpen(false)} />}
      <Sheet
        title={detail?.name ?? "Exercise"}
        visible={!!detail}
        onClose={() => setDetail(null)}
      >
        {detail && (
          <>
            <Pill>
              {detail.muscle} · {detail.equipment}
            </Pill>
            <Txt>{detail.instructions}</Txt>
            <Txt>Alternative: {detail.alternative}</Txt>
            <Txt variant="caption">
              General movement guidance. Reduce resistance or stop if painful.
            </Txt>
          </>
        )}
      </Sheet>
      <Sheet
        title="Add an exercise"
        visible={addOpen}
        onClose={() => setAddOpen(false)}
      >
        <Field label="Search exercise" value={search} onChange={setSearch} />
        {exercises
          .filter((e) => e.name.toLowerCase().includes(search.toLowerCase()))
          .map((e) => (
            <Button
              key={e.id}
              kind="secondary"
              onPress={() =>
                a.run(async () => {
                  if (!current) return;
                  await commit((data) => {
                    const w = data.workouts.find((w) => w.id === current.id)!;
                    return [
                      {
                        collection: "workouts",
                        id: w.id,
                        value: { ...w, sets: [...w.sets, makeSet(e)] },
                      },
                    ];
                  });
                  setAddOpen(false);
                })
              }
            >
              {e.name}
            </Button>
          ))}
      </Sheet>
    </Screen>
  );
}
