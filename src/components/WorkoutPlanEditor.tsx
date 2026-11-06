import React, { useState } from "react";
import {
  Button,
  Field,
  Notice,
  Row,
  Sheet,
  Toggle,
  Txt,
  useAction,
} from "./ui";
import { exercises } from "../domain/training";
import { commit, uid } from "../state/store";
import { workoutPlanSchema } from "../domain/model";
export default function WorkoutPlanEditor({
  onClose,
}: {
  onClose: () => void;
}) {
  const [name, setName] = useState(""),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<string[]>([]),
    [days, setDays] = useState<
      Array<"Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun">
    >([]);
  const a = useAction();
  return (
    <Sheet visible title="Build your own workout plan" onClose={onClose}>
      <Field label="Plan name" value={name} onChange={setName} />
      <Txt variant="caption">
        Select movements in the order you want to train them. Add or adjust sets
        during a session.
      </Txt>
      <Row style={{ flexWrap: "wrap" }}>
        {(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const).map(
          (day) => (
            <Button
              key={day}
              kind={days.includes(day) ? "primary" : "secondary"}
              onPress={() =>
                setDays(
                  days.includes(day)
                    ? days.filter((d) => d !== day)
                    : [...days, day],
                )
              }
            >
              {day}
            </Button>
          ),
        )}
      </Row>
      <Field label="Find an exercise" value={search} onChange={setSearch} />
      {exercises
        .filter((e) =>
          `${e.name} ${e.muscle}`.toLowerCase().includes(search.toLowerCase()),
        )
        .map((e) => (
          <Toggle
            key={e.id}
            label={`${selected.includes(e.id) ? `${selected.indexOf(e.id) + 1}. ` : ""}${e.name}`}
            value={selected.includes(e.id)}
            onChange={(v) =>
              setSelected(
                v ? [...selected, e.id] : selected.filter((id) => id !== e.id),
              )
            }
          />
        ))}
      {a.error && <Notice text={a.error} error />}
      <Button
        disabled={a.busy}
        onPress={() =>
          a.run(async () => {
            const id = uid();
            const value = workoutPlanSchema.parse({
              id,
              name: name.trim(),
              exerciseIds: selected,
              weekdays: days,
            });
            await commit([{ collection: "workoutPlans", id, value }]);
            onClose();
          })
        }
      >
        Save workout plan
      </Button>
    </Sheet>
  );
}
