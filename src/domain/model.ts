import { z } from "zod";

export const metricNames = [
  "weight",
  "waist",
  "hips",
  "chest",
  "shoulders",
  "arm",
  "thigh",
  "calf",
  "neck",
  "bodyFat",
  "muscleMass",
  "steps",
  "distance",
  "activeMinutes",
  "sleep",
  "restingHeartRate",
  "heartRate",
  "hrv",
  "bloodPressure",
  "water",
  "oxygen",
  "glucose",
  "temperature",
  "cholesterol",
  "hba1c",
] as const;
export type Metric = (typeof metricNames)[number];
export type UnitSystem = "metric" | "imperial";
export const nutrientKeys = [
  "energy",
  "protein",
  "carbs",
  "fat",
  "fiber",
  "sugar",
  "addedSugar",
  "saturatedFat",
  "monoFat",
  "polyFat",
  "omega3",
  "omega6",
  "cholesterol",
  "caffeine",
  "alcohol",
  "water",
  "vitaminA",
  "vitaminC",
  "vitaminD",
  "vitaminE",
  "vitaminK",
  "thiamin",
  "riboflavin",
  "niacin",
  "pantothenicAcid",
  "vitaminB6",
  "biotin",
  "folate",
  "vitaminB12",
  "calcium",
  "iron",
  "magnesium",
  "phosphorus",
  "potassium",
  "sodium",
  "chloride",
  "zinc",
  "copper",
  "manganese",
  "selenium",
  "iodine",
  "chromium",
  "molybdenum",
  "choline",
] as const;
export type Nutrient = (typeof nutrientKeys)[number];
export type NutrientMap = Partial<Record<Nutrient, number | null>>;
export const physiqueGoals = [
  "Slim natural",
  "Lean defined",
  "Soft athletic",
  "Custom",
] as const;

const iso = z.string().datetime({ offset: true });
const nonnegative = z.number().finite().min(0);
export const profileSchema = z.object({
  id: z.literal("profile"),
  name: z.string().max(60),
  age: z.number().int().min(18).max(120).nullable(),
  heightCm: z.number().min(80).max(250).nullable(),
  units: z.enum(["metric", "imperial"]),
  referenceSex: z.enum(["male", "female", "unspecified"]),
  specialReferences: z.boolean(),
  goal: z.enum(physiqueGoals),
  phase: z.enum(["Maintain", "Build strength", "Recomposition"]),
  equipment: z.enum(["Bodyweight", "Dumbbells", "Gym"]),
  trainingDays: z.number().int().min(1).max(6),
  sessionMinutes: z.number().int().min(10).max(120),
  priorities: z.string().max(300),
  dietaryNotes: z.string().max(500),
  limitations: z.string().max(500),
  timezone: z.string().max(100),
  theme: z.enum(["system", "light", "dark"]),
  hideWeight: z.boolean(),
  dashboard: z.array(z.enum(["activity", "nutrition", "recovery", "physique"])),
  stepTarget: z.number().int().min(0).max(50000).nullable(),
  energyTarget: z.number().min(1000).max(6000).nullable(),
  proteinTarget: z.number().min(10).max(300).nullable(),
  waterTarget: z.number().min(250).max(6000).nullable(),
  preferredSources: z.record(z.string(), z.string()),
  onboarded: z.boolean(),
  biometricLock: z.boolean(),
  demo: z.boolean(),
});
export type Profile = z.infer<typeof profileSchema>;

export const measurementSchema = z
  .object({
    id: z.string().min(1),
    metric: z.enum(metricNames),
    value: nonnegative,
    secondary: nonnegative.optional(),
    unit: z.string().max(24),
    recordedAt: iso,
    endAt: iso.optional(),
    timezone: z.string(),
    source: z.string().max(200),
    sourceRecordId: z.string().optional(),
    dataType: z.string().optional(),
    original: z.unknown().optional(),
    notes: z.string().max(1000),
    updatedAt: iso,
  })
  .superRefine((m, ctx) => {
    if (
      m.metric === "bloodPressure" &&
      (m.secondary == null || m.secondary <= 0 || m.value <= m.secondary)
    )
      ctx.addIssue({
        code: "custom",
        message: "Systolic pressure must exceed a positive diastolic pressure.",
      });
    if (m.endAt && m.endAt < m.recordedAt)
      ctx.addIssue({ code: "custom", message: "End must follow start." });
    if (m.metric === "bodyFat" && m.value > 100)
      ctx.addIssue({ code: "custom", message: "Body fat cannot exceed 100%." });
    if (m.metric === "oxygen" && m.value > 100)
      ctx.addIssue({
        code: "custom",
        message: "Oxygen saturation cannot exceed 100%.",
      });
  });
export type Measurement = z.infer<typeof measurementSchema>;
export const foodSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(180),
  brand: z.string().max(120),
  source: z.string(),
  sourceUrl: z.string(),
  version: z.string(),
  servingGrams: z.number().positive().max(10000),
  servingLabel: z.string(),
  barcode: z.string().optional(),
  favorite: z.boolean(),
  nutrients: z.partialRecord(z.enum(nutrientKeys), nonnegative.nullable()),
});
export type Food = z.infer<typeof foodSchema>;
export const mealSchema = z.object({
  id: z.string(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  meal: z.enum(["Breakfast", "Lunch", "Dinner", "Snack"]),
  foodId: z.string(),
  foodName: z.string(),
  grams: z.number().positive().max(10000),
  nutrients: z.partialRecord(z.enum(nutrientKeys), nonnegative.nullable()),
  source: z.string(),
  recordedAt: iso,
});
export type Meal = z.infer<typeof mealSchema>;
export const setSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  reps: z.number().int().min(0).max(500),
  kg: nonnegative.max(1000),
  seconds: nonnegative.max(86400),
  distanceKm: nonnegative.max(1000),
  rpe: z.number().min(0).max(10).nullable(),
  done: z.boolean(),
});
export type ExerciseSet = z.infer<typeof setSchema>;
export const workoutSchema = z.object({
  id: z.string(),
  name: z.string().max(120),
  startedAt: iso,
  completedAt: iso.nullable(),
  notes: z.string().max(2000),
  sets: z.array(setSchema).max(300),
  source: z.string(),
});
export type Workout = z.infer<typeof workoutSchema>;
export const workoutPlanSchema = z.object({
  id: z.string(),
  name: z.string().min(1).max(120),
  exerciseIds: z.array(z.string()).min(1).max(40),
  weekdays: z
    .array(z.enum(["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]))
    .max(7),
});
export type WorkoutPlan = z.infer<typeof workoutPlanSchema>;
export const checkinSchema = z.object({
  id: z.string(),
  date: z.string(),
  energy: z.number().min(1).max(5),
  soreness: z.number().min(1).max(5),
  recovery: z.number().min(1).max(5),
  nutritionComplete: z.boolean(),
  notes: z.string().max(1000),
});
export type Checkin = z.infer<typeof checkinSchema>;
export const routineSchema = z.object({
  id: z.string(),
  title: z.string().min(1).max(100),
  time: z.enum(["Morning", "Evening", "Anytime"]),
  completedDates: z.array(z.string()),
  notes: z.string().max(500),
});
export type Routine = z.infer<typeof routineSchema>;
export const syncSchema = z.object({
  id: z.string(),
  enabled: z.boolean(),
  granted: z.boolean(),
  token: z.string().nullable(),
  lastSuccess: iso.nullable(),
  lastAttempt: iso.nullable(),
  error: z.string().nullable(),
});
export type SyncState = z.infer<typeof syncSchema>;
export const insightStateSchema = z.object({
  id: z.string(),
  status: z.enum(["accepted", "dismissed"]),
  updatedAt: iso,
});
export const schemas = {
  profiles: profileSchema,
  measurements: measurementSchema,
  foods: foodSchema,
  meals: mealSchema,
  workouts: workoutSchema,
  workoutPlans: workoutPlanSchema,
  checkins: checkinSchema,
  routines: routineSchema,
  sync: syncSchema,
  insightStates: insightStateSchema,
};
export type Collection = keyof typeof schemas;
export type Data = { [K in Collection]: Array<z.infer<(typeof schemas)[K]>> };
export type Operation = {
  [K in Collection]: {
    collection: K;
    id: string;
    value: z.infer<(typeof schemas)[K]> | null;
  };
}[Collection];
export const emptyData = (): Data => ({
  profiles: [],
  measurements: [],
  foods: [],
  meals: [],
  workouts: [],
  workoutPlans: [],
  checkins: [],
  routines: [],
  sync: [],
  insightStates: [],
});
export const defaultProfile = (): Profile => ({
  id: "profile",
  name: "",
  age: null,
  heightCm: null,
  units: "metric",
  referenceSex: "unspecified",
  specialReferences: false,
  goal: "Lean defined",
  phase: "Maintain",
  equipment: "Bodyweight",
  trainingDays: 3,
  sessionMinutes: 30,
  priorities: "",
  dietaryNotes: "",
  limitations: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC",
  theme: "system",
  hideWeight: false,
  dashboard: ["activity", "nutrition", "recovery", "physique"],
  stepTarget: null,
  energyTarget: null,
  proteinTarget: null,
  waterTarget: null,
  preferredSources: {},
  onboarded: false,
  biometricLock: false,
  demo: false,
});

export function validateOperations(ops: Operation[]): void {
  for (const op of ops) {
    if (!schemas[op.collection] || !op.id)
      throw new Error("Invalid collection or identifier.");
    if (op.value !== null) {
      const parsed = schemas[op.collection].parse(op.value);
      if (parsed.id !== op.id)
        throw new Error("Record identity does not match.");
    }
  }
}
export function applyOperations(data: Data, ops: Operation[]): Data {
  const next = { ...data };
  for (const name of Object.keys(schemas) as Collection[]) {
    const changes = ops.filter((op) => op.collection === name);
    if (!changes.length) continue;
    const rows = new Map<string, { id: string }>(
      data[name].map((v) => [v.id, v]),
    );
    for (const op of changes)
      op.value === null ? rows.delete(op.id) : rows.set(op.id, op.value);
    (next[name] as { id: string }[]) = [...rows.values()];
  }
  return next;
}
