import React, { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import {
  Button,
  Card,
  Choices,
  Field,
  Notice,
  Progress,
  Row,
  Screen,
  Stack,
  Toggle,
  Txt,
  useAction,
} from "../src/components/ui";
import { getProfile, updateProfile } from "../src/state/store";
import { physiqueGoals, type Profile } from "../src/domain/model";
export default function Onboarding() {
  const [p, setP] = useState(getProfile),
    [step, setStep] = useState(0);
  const [height, setHeight] = useState(""),
    [age, setAge] = useState("");
  const a = useAction();
  const patch = (v: Partial<Profile>) => setP({ ...p, ...v });
  return (
    <Screen
      title={
        step === 0
          ? "Your body.\nYour own direction."
          : step === 1
            ? "A little about you."
            : "Make it fit your life."
      }
      eyebrow={`Welcome to FORM · ${step + 1} of 3`}
      action={<Txt variant="caption">Private by default</Txt>}
    >
      <Progress value={step + 1} target={3} />
      {step === 0 && (
        <>
          <Card tone="sage">
            <Txt variant="heading">
              Understand your body. Shape your routine.
            </Txt>
            <Txt>
              A private space for your nutrition, training, health and progress.
              Choose the appearance you enjoy, while making room for strength
              and recovery.
            </Txt>
            <PillText />
          </Card>
          <Card>
            <Field
              label="What should we call you? (optional)"
              value={p.name}
              onChange={(name) => patch({ name })}
            />
            <Choices
              label="Your preferred physique"
              options={physiqueGoals}
              value={p.goal}
              onChange={(goal) => patch({ goal })}
            />
            <Choices
              label="Current focus"
              options={["Maintain", "Build strength", "Recomposition"] as const}
              value={p.phase}
              onChange={(phase) => patch({ phase })}
            />
            <Txt variant="caption">
              No ideal body weight or body-fat percentage is imposed.
            </Txt>
          </Card>
        </>
      )}
      {step === 1 && (
        <Card>
          <Choices
            label="Measurement units"
            options={["metric", "imperial"] as const}
            value={p.units}
            onChange={(units) => patch({ units })}
          />
          <Field
            label="Age (optional, adults 18+)"
            keyboard="number-pad"
            value={age}
            onChange={setAge}
          />
          <Field
            label={`Height (${p.units === "metric" ? "cm" : "in"}, optional)`}
            keyboard="decimal-pad"
            value={height}
            onChange={setHeight}
          />
          <Choices
            label="Nutrient reference table (optional)"
            options={["unspecified", "male", "female"] as const}
            value={p.referenceSex}
            onChange={(referenceSex) => patch({ referenceSex })}
          />
          <Txt variant="caption">
            This selects a physiological DRI reference group, separate from
            gender identity. The bundled tables cover ages 19–50. Individual
            needs can vary.
          </Txt>
          <Toggle
            label="Pregnancy, lactation or specialized nutrition needs"
            value={p.specialReferences}
            onChange={(specialReferences) => patch({ specialReferences })}
            detail="Reference comparisons are disabled. You can still log all nutrients."
          />
          <Toggle
            label="Hide weight throughout the app"
            value={p.hideWeight}
            onChange={(hideWeight) => patch({ hideWeight })}
          />
        </Card>
      )}
      {step === 2 && (
        <Card>
          <Choices
            label="Equipment available"
            options={["Bodyweight", "Dumbbells", "Gym"] as const}
            value={p.equipment}
            onChange={(equipment) => patch({ equipment })}
          />
          <Choices
            label="Strength days per week"
            options={["1", "2", "3", "4", "5", "6"]}
            value={String(p.trainingDays)}
            onChange={(v) => patch({ trainingDays: Number(v) })}
          />
          <Choices
            label="Time per session"
            options={["15", "30", "45", "60"]}
            value={String(p.sessionMinutes)}
            onChange={(v) => patch({ sessionMinutes: Number(v) })}
          />
          <Field
            label="Body areas or goals to prioritize (optional)"
            value={p.priorities}
            onChange={(priorities) => patch({ priorities })}
          />
          <Field
            label="Dietary preferences or restrictions (optional)"
            value={p.dietaryNotes}
            onChange={(dietaryNotes) => patch({ dietaryNotes })}
          />
          <Field
            label="Movement limitations or clinician guidance (optional)"
            value={p.limitations}
            onChange={(limitations) => patch({ limitations })}
            multiline
          />
          <Txt variant="caption">
            Start with manual logging. Connect Samsung Health in Settings when
            you are ready. No account or paid API is required.
          </Txt>
        </Card>
      )}
      {a.error && <Notice text={a.error} error />}
      <Row>
        {step > 0 && (
          <Button kind="secondary" onPress={() => setStep(step - 1)}>
            Back
          </Button>
        )}
        <View style={{ flex: 1 }}>
          <Button
            disabled={a.busy}
            onPress={() =>
              a.run(async () => {
                if (step === 1) {
                  const ag = age ? Number(age) : null,
                    ht = height
                      ? Number(height) * (p.units === "imperial" ? 2.54 : 1)
                      : null;
                  if (
                    ag !== null &&
                    (!Number.isInteger(ag) || ag < 18 || ag > 120)
                  )
                    throw new Error(
                      "Enter an adult age between 18 and 120, or leave it empty.",
                    );
                  if (
                    ht !== null &&
                    (!Number.isFinite(ht) || ht < 80 || ht > 250)
                  )
                    throw new Error("Check the height and selected units.");
                  setP({ ...p, age: ag, heightCm: ht });
                }
                if (step < 2) setStep(step + 1);
                else {
                  await updateProfile({ ...p, onboarded: true });
                  router.replace("/");
                }
              })
            }
          >
            {step === 2 ? "Start my journal" : "Continue"}
          </Button>
        </View>
      </Row>
    </Screen>
  );
}
function PillText() {
  return (
    <Txt variant="caption">
      Offline first · No advertising · You own your data
    </Txt>
  );
}
