import React, { useEffect, useState } from "react";
import { Platform } from "react-native";
import { router } from "expo-router";
import * as LocalAuthentication from "expo-local-authentication";
import {
  Button,
  Card,
  Choices,
  ConfirmButton,
  Field,
  Notice,
  Pill,
  Row,
  Screen,
  Section,
  Sheet,
  Stack,
  Toggle,
  Txt,
  useAction,
} from "../src/components/ui";
import {
  commit,
  deleteCollection,
  deleteEverything,
  getData,
  getProfile,
  updateProfile,
  useData,
} from "../src/state/store";
import {
  healthAvailability,
  connectHealth,
  disconnectHealth,
  enableBackground,
  openHealthSettings,
  syncHealth,
} from "../src/integrations/health-connect";
import { healthTypes, type HealthType } from "../src/integrations/sync-engine";
import { localDay } from "../src/domain/metrics";
import {
  measurementCsv,
  parseBackup,
  serializeBackup,
} from "../src/domain/backup";
import { foodFromUSDA } from "../src/domain/nutrition";
import { foodSchema, type Operation, type Profile } from "../src/domain/model";
import { pickJson, shareText } from "../src/integrations/files";
import { demoOperations, removeDemo } from "../src/data/demo";
import ReminderSettings, {
  cancelJournalReminder,
} from "../src/components/ReminderSettings";

export default function Settings() {
  const d = useData(),
    p = getProfile(),
    a = useAction();
  const [status, setStatus] = useState("Checking availability…"),
    [selected, setSelected] = useState<HealthType[]>(
      d.sync.filter((s) => s.enabled).map((s) => s.id as HealthType),
    ),
    [profileOpen, setProfileOpen] = useState(false),
    [message, setMessage] = useState(""),
    [pending, setPending] = useState<Operation[] | null>(null);
  useEffect(() => {
    void healthAvailability().then(setStatus);
  }, []);
  return (
    <Screen title="Make FORM yours." eyebrow="Settings & privacy" back>
      {Platform.OS === "web" && (
        <Notice text="Browser development preview: records use this browser’s IndexedDB and are not encrypted. Use the native app for private health data, SQLCipher and device integrations." />
      )}
      {a.error && <Notice text={a.error} error />}
      {message && <Pill>{message}</Pill>}
      <Section title="Your preferences">
        <Card>
          <Txt variant="heading">{p.name || "Personal profile"}</Txt>
          <Txt>
            {p.goal} · {p.phase} · {p.units}
          </Txt>
          <Button kind="secondary" onPress={() => setProfileOpen(true)}>
            Edit profile & targets
          </Button>
          <Choices
            label="Appearance"
            options={["system", "light", "dark"] as const}
            value={p.theme}
            onChange={(theme) => void a.run(() => updateProfile({ theme }))}
          />
          <Toggle
            label="Hide weight"
            value={p.hideWeight}
            onChange={(hideWeight) =>
              void a.run(() => updateProfile({ hideWeight }))
            }
          />
          {(["activity", "nutrition", "recovery", "physique"] as const).map(
            (key) => (
              <Toggle
                key={key}
                label={`Show ${key} on Today`}
                value={p.dashboard.includes(key)}
                onChange={(on) =>
                  void a.run(() =>
                    updateProfile({
                      dashboard: on
                        ? [...p.dashboard, key]
                        : p.dashboard.filter((v) => v !== key),
                    }),
                  )
                }
              />
            ),
          )}
          <Toggle
            label="Require device authentication"
            value={p.biometricLock}
            onChange={(enabled) =>
              void a.run(async () => {
                if (Platform.OS === "web")
                  throw new Error("App locking is available on native builds.");
                const available =
                  (await LocalAuthentication.getEnrolledLevelAsync()) !==
                  LocalAuthentication.SecurityLevel.NONE;
                if (!available)
                  throw new Error(
                    "Set up a device passcode or biometric authentication first.",
                  );
                const result = await LocalAuthentication.authenticateAsync({
                  promptMessage: enabled
                    ? "Enable FORM lock"
                    : "Disable FORM lock",
                  disableDeviceFallback: false,
                });
                if (!result.success)
                  throw new Error("Authentication cancelled.");
                await updateProfile({ biometricLock: enabled });
              })
            }
            detail="Locks on launch and when you leave the app. Device authentication is required to change this setting."
          />
        </Card>
      </Section>
      <Section title="Samsung Health connection">
        <Card>
          <Pill>{status}</Pill>
          <Txt>Galaxy Watch → Samsung Health → Health Connect → FORM</Txt>
          <Txt variant="caption">
            In Samsung Health settings, enable sharing to Health Connect for the
            categories you want. FORM requests only selected read permissions.
            Having permission does not mean records exist.
          </Txt>
          {healthTypes.map((type) => (
            <Toggle
              key={type}
              label={type.replace(/([a-z])([A-Z])/g, "$1 $2")}
              value={selected.includes(type)}
              onChange={(on) =>
                setSelected(
                  on ? [...selected, type] : selected.filter((t) => t !== type),
                )
              }
            />
          ))}
          <Row style={{ flexWrap: "wrap" }}>
            <Button
              disabled={a.busy || !selected.length || Platform.OS !== "android"}
              onPress={() =>
                a.run(async () => {
                  await connectHealth(selected);
                  setMessage("Connection updated. Check each category below.");
                })
              }
            >
              Connect selected data
            </Button>
            <Button
              kind="secondary"
              disabled={a.busy || Platform.OS !== "android"}
              onPress={() =>
                a.run(async () => {
                  await syncHealth();
                  setMessage("Import attempted. Review diagnostics below.");
                })
              }
            >
              Refresh
            </Button>
            <Button
              kind="quiet"
              disabled={Platform.OS !== "android"}
              onPress={() => a.run(openHealthSettings)}
            >
              Manage permissions
            </Button>
          </Row>
          <Button
            kind="secondary"
            disabled={
              Platform.OS !== "android" ||
              a.busy ||
              !d.sync.some((s) => s.enabled)
            }
            onPress={() =>
              a.run(async () => {
                await enableBackground();
                setMessage(
                  "Periodic background import requested. Android controls when jobs run.",
                );
              })
            }
          >
            Enable background import
          </Button>
          <Txt variant="caption">
            WorkManager schedules background imports through Expo
            BackgroundTask, subject to Android restrictions and background read
            permission. Imports are not real-time monitoring. Initial reads
            reconcile an authorized 30-day window; extended history is not
            requested.
          </Txt>
          <Button
            kind="quiet"
            onPress={() =>
              a.run(async () => {
                await disconnectHealth();
                setSelected([]);
                setMessage(
                  "Imports stopped. Manage Android permissions separately if desired.",
                );
              })
            }
          >
            Disconnect in FORM
          </Button>
        </Card>
        {d.sync.map((s) => {
          const records = d.measurements
            .filter((m) => m.dataType === s.id)
            .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
          return (
            <Card key={s.id}>
              <Row style={{ justifyContent: "space-between" }}>
                <Txt style={{ fontWeight: "600" }}>{s.id}</Txt>
                <Pill>
                  {s.enabled
                    ? s.granted
                      ? "Read granted"
                      : "Permission needed"
                    : "Disabled"}
                </Pill>
              </Row>
              <Txt>
                {records.length
                  ? `${records.length} local records`
                  : "No local records available"}
              </Txt>
              {records.length > 0 && (
                <Txt variant="caption">
                  {records[0]!.recordedAt.slice(0, 10)} –{" "}
                  {records[records.length - 1]!.recordedAt.slice(0, 10)}
                </Txt>
              )}
              <Txt variant="caption">
                Last successful import:{" "}
                {s.lastSuccess
                  ? new Date(s.lastSuccess).toLocaleString()
                  : "Never"}
              </Txt>
              {s.error && <Notice text={s.error} error />}
            </Card>
          );
        })}
      </Section>
      <Section title="Reminders">
        <ReminderSettings />
      </Section>
      <Section title="Your data, in your hands">
        <Card>
          <Txt>
            Your records stay local. There is no account, cloud synchronization,
            advertising or health-data analytics.
          </Txt>
          <Txt variant="caption">
            Native records, source metadata and change tokens are stored in a
            SQLCipher database. The encryption key uses Android Keystore / iOS
            Keychain through SecureStore. Progress photographs are not included
            in this release.
          </Txt>
          <Button kind="quiet" onPress={() => router.push("/privacy")}>
            Read the privacy & data guide
          </Button>
          <ConfirmButton
            label="Export full journal (JSON)"
            detail="This creates an unencrypted file containing personal health information and opens the share sheet. Store or share it only where you choose. Device-specific access tokens and app-lock settings are excluded."
            onConfirm={() =>
              shareText(
                `FORM-journal-${localDay()}.json`,
                serializeBackup(getData()),
                "application/json",
              )
            }
          />
          <ConfirmButton
            label="Export measurements (CSV)"
            detail="This creates an unencrypted spreadsheet-compatible file containing all recorded measurements, sources and notes."
            onConfirm={() =>
              shareText(
                `FORM-measurements-${localDay()}.csv`,
                measurementCsv(getData()),
                "text/csv",
              )
            }
          />
          <Button
            kind="secondary"
            disabled={a.busy}
            onPress={() =>
              a.run(async () => {
                const text = await pickJson();
                if (text) setPending(parseBackup(text));
              })
            }
          >
            Import a FORM export
          </Button>
          <Button
            kind="secondary"
            disabled={a.busy}
            onPress={() =>
              a.run(async () => {
                const text = await pickJson();
                if (!text) return;
                const raw = JSON.parse(text);
                const list = Array.isArray(raw)
                  ? raw
                  : Array.isArray(raw?.FoundationFoods)
                    ? raw.FoundationFoods
                    : Array.isArray(raw?.SRLegacyFoods)
                      ? raw.SRLegacyFoods
                      : [raw];
                if (list.length > 5000)
                  throw new Error("Import at most 5,000 USDA foods at a time.");
                const foods = list.map((item: unknown) =>
                  foodSchema.parse(foodFromUSDA(item)),
                );
                await commit(
                  foods.map((food: ReturnType<typeof foodFromUSDA>) => ({
                    collection: "foods",
                    id: food.id,
                    value: food,
                  })),
                );
                setMessage(`${foods.length} USDA foods saved for offline use.`);
              })
            }
          >
            Import USDA food JSON
          </Button>
          <Txt variant="caption">
            Use FoodData Central food-detail records or a downloaded dataset
            subset. USDA API credentials are never stored in this app.
          </Txt>
        </Card>
      </Section>
      <Section title="Explore or clear your journal">
        <Card>
          {p.demo ? (
            <ConfirmButton
              label="Remove sample data"
              detail="Remove fictional sample records. Personal entries are preserved."
              onConfirm={async () => {
                await commit((current) => [
                  ...removeDemo(current),
                  {
                    collection: "profiles",
                    id: "profile",
                    value: { ...getProfile(), demo: false },
                  },
                ]);
              }}
            />
          ) : (
            <Button
              kind="secondary"
              onPress={() =>
                a.run(async () => {
                  if (
                    d.measurements.length ||
                    d.meals.length ||
                    d.workouts.length
                  )
                    throw new Error(
                      "Sample mode is available only in an empty journal to keep fictional and personal history separate.",
                    );
                  await commit([
                    ...demoOperations(
                      localDay(new Date(), p.timezone),
                      p.timezone,
                    ),
                    {
                      collection: "profiles",
                      id: "profile",
                      value: { ...p, demo: true },
                    },
                  ]);
                  setMessage(
                    "Sample mode enabled. All sample measurements are fictional.",
                  );
                })
              }
            >
              Explore with fictional sample data
            </Button>
          )}
          <ConfirmButton
            label="Delete imported copies"
            detail="Stop FORM imports and remove locally imported measurements. Source records in Samsung Health and Health Connect remain untouched."
            onConfirm={async () => {
              await disconnectHealth();
              await commit((current) =>
                current.measurements
                  .filter((m) => m.dataType)
                  .map((m) => ({
                    collection: "measurements",
                    id: m.id,
                    value: null,
                  })),
              );
            }}
          />
          <ConfirmButton
            label="Delete meal history"
            detail="Remove all logged meals from this device. Saved foods are retained."
            onConfirm={() => deleteCollection("meals")}
          />
          <ConfirmButton
            label="Erase my FORM journal"
            detail="Permanently delete your profile and all journal records on this device, then return to onboarding. External Health Connect data is untouched. Export first if you want a copy."
            onConfirm={async () => {
              await disconnectHealth();
              await cancelJournalReminder();
              await deleteEverything();
              router.replace("/onboarding");
            }}
          />
        </Card>
      </Section>
      {profileOpen && <ProfileEditor onClose={() => setProfileOpen(false)} />}
      <Sheet
        visible={!!pending}
        title="Review import"
        onClose={() => setPending(null)}
      >
        <Txt>
          {pending?.length} validated records will be merged. Records with
          matching IDs will be replaced; other local records are retained.
          Health connections and app locking must be configured again.
        </Txt>
        <Notice text="Import only exports you trust. Imported records affect your history and insights." />
        {a.error && <Notice text={a.error} error />}
        <Button
          disabled={a.busy}
          onPress={() =>
            a.run(async () => {
              if (!pending) return;
              await disconnectHealth();
              await commit(pending);
              setPending(null);
              setMessage(
                "Journal imported. Review your profile and connection settings.",
              );
            })
          }
        >
          Merge these records
        </Button>
      </Sheet>
    </Screen>
  );
}

function ProfileEditor({ onClose }: { onClose: () => void }) {
  const current = getProfile(),
    a = useAction();
  const [p, setP] = useState(current);
  const [age, setAge] = useState(p.age?.toString() ?? ""),
    [height, setHeight] = useState(
      p.heightCm
        ? String(
            p.units === "imperial"
              ? Math.round((p.heightCm / 2.54) * 10) / 10
              : p.heightCm,
          )
        : "",
    ),
    [steps, setSteps] = useState(p.stepTarget?.toString() ?? ""),
    [energy, setEnergy] = useState(p.energyTarget?.toString() ?? ""),
    [protein, setProtein] = useState(p.proteinTarget?.toString() ?? ""),
    [water, setWater] = useState(p.waterTarget?.toString() ?? "");
  const patch = (v: Partial<Profile>) => setP({ ...p, ...v });
  return (
    <Sheet visible title="Profile & personal targets" onClose={onClose}>
      <Field
        label="Name (optional)"
        value={p.name}
        onChange={(name) => patch({ name })}
      />
      <Choices
        label="Units"
        options={["metric", "imperial"] as const}
        value={p.units}
        onChange={(units) => {
          if (height) {
            const canonical =
              Number(height) * (p.units === "imperial" ? 2.54 : 1);
            setHeight(
              (units === "imperial" ? canonical / 2.54 : canonical).toFixed(1),
            );
          }
          patch({ units });
        }}
      />
      <Field
        label="Age (optional)"
        value={age}
        onChange={setAge}
        keyboard="number-pad"
      />
      <Field
        label={`Height (${p.units === "imperial" ? "in" : "cm"}, optional)`}
        value={height}
        onChange={setHeight}
        keyboard="decimal-pad"
      />
      <Choices
        label="DRI reference table · ages 19–50"
        options={["unspecified", "male", "female"] as const}
        value={p.referenceSex}
        onChange={(referenceSex) => patch({ referenceSex })}
      />
      <Toggle
        label="Specialized nutrition needs / pregnancy / lactation"
        value={p.specialReferences}
        onChange={(specialReferences) => patch({ specialReferences })}
      />
      <Choices
        label="Focus"
        options={["Maintain", "Build strength", "Recomposition"] as const}
        value={p.phase}
        onChange={(phase) => patch({ phase })}
      />
      <Choices
        label="Equipment"
        options={["Bodyweight", "Dumbbells", "Gym"] as const}
        value={p.equipment}
        onChange={(equipment) => patch({ equipment })}
      />
      <Choices
        label="Training days per week"
        options={["1", "2", "3", "4", "5", "6"]}
        value={String(p.trainingDays)}
        onChange={(v) => patch({ trainingDays: Number(v) })}
      />
      <Choices
        label="Session minutes"
        options={["15", "30", "45", "60"]}
        value={String(p.sessionMinutes)}
        onChange={(v) => patch({ sessionMinutes: Number(v) })}
      />
      <Field
        label="Physique priorities"
        value={p.priorities}
        onChange={(priorities) => patch({ priorities })}
      />
      <Field
        label="Dietary preferences / restrictions"
        value={p.dietaryNotes}
        onChange={(dietaryNotes) => patch({ dietaryNotes })}
      />
      <Field
        label="Limitations / clinician guidance"
        value={p.limitations}
        onChange={(limitations) => patch({ limitations })}
        multiline
      />
      <Txt variant="heading">Optional personal planning targets</Txt>
      <Txt variant="caption">
        Leave blank for no target. FORM does not generate a calorie deficit or
        impose a weight goal. Choose appropriate targets, including clinician
        guidance where relevant.
      </Txt>
      <Field
        label="Steps / day"
        value={steps}
        onChange={setSteps}
        keyboard="number-pad"
      />
      <Field
        label="Energy / day (kcal)"
        value={energy}
        onChange={setEnergy}
        keyboard="decimal-pad"
      />
      <Field
        label="Protein / day (g)"
        value={protein}
        onChange={setProtein}
        keyboard="decimal-pad"
      />
      <Field
        label="Drinking water / day (ml)"
        value={water}
        onChange={setWater}
        keyboard="decimal-pad"
      />
      {a.error && <Notice text={a.error} error />}
      <Button
        disabled={a.busy}
        onPress={() =>
          a.run(async () => {
            const num = (value: string) =>
              value.trim() ? Number(value) : null;
            await updateProfile({
              ...p,
              age: num(age),
              heightCm: height.trim()
                ? Number(height) * (p.units === "imperial" ? 2.54 : 1)
                : null,
              stepTarget: num(steps),
              energyTarget: num(energy),
              proteinTarget: num(protein),
              waterTarget: num(water),
            });
            onClose();
          })
        }
      >
        Save preferences
      </Button>
    </Sheet>
  );
}
