import assert from "node:assert/strict";
import test from "node:test";
import {
  defaultProfile,
  emptyData,
  foodSchema,
  measurementSchema,
  type Food,
  type Meal,
  type Measurement,
} from "../src/domain/model";
import {
  zonedMidnight,
  addDays,
  bloodPressureMessage,
  dailyValues,
  fromCanonical,
  localDay,
  rollingAverage,
  toCanonical,
} from "../src/domain/metrics";
import {
  foodFromUSDA,
  nutrientStatus,
  portion,
  recipeNutrients,
  references,
  totals,
} from "../src/domain/nutrition";
import { correlation, insights } from "../src/domain/insights";
import { volume } from "../src/domain/training";
import { starterFoods } from "../src/data/foods";
const profile = {
  ...defaultProfile(),
  age: 25,
  referenceSex: "male" as const,
  timezone: "America/Los_Angeles",
};
const row = (patch: Partial<Measurement> = {}): Measurement => ({
  id: "m",
  metric: "weight",
  value: 66,
  unit: "kg",
  recordedAt: "2026-11-05T18:00:00Z",
  timezone: profile.timezone,
  source: "Manual",
  notes: "",
  updatedAt: "2026-11-05T18:00:00Z",
  ...patch,
});
const meal = (nutrients: Meal["nutrients"]): Pick<Meal, "nutrients"> => ({
  nutrients,
});
test("all supported imperial unit conversions round trip without cumulative rounding", () => {
  for (const metric of [
    "weight",
    "waist",
    "water",
    "distance",
    "temperature",
  ] as const)
    assert.ok(
      Math.abs(
        toCanonical(
          fromCanonical(37.6, metric, "imperial"),
          metric,
          "imperial",
        ) - 37.6,
      ) < 1e-10,
    );
});
test("a pound is 0.45359237 kg and inches use exact 2.54 cm", () => {
  assert.equal(toCanonical(1, "weight", "imperial"), 0.45359237);
  assert.equal(toCanonical(10, "waist", "imperial"), 25.4);
  assert.equal(toCanonical(32, "temperature", "imperial"), 0);
});
test("local-day grouping respects the configured timezone rather than UTC", () => {
  assert.equal(
    localDay("2026-11-06T01:00:00Z", "America/Los_Angeles"),
    "2026-11-05",
  );
  assert.equal(localDay("2026-11-06T01:00:00Z", "UTC"), "2026-11-06");
});
test("calendar date arithmetic crosses leap and year boundaries", () => {
  assert.equal(addDays("2024-02-28", 1), "2024-02-29");
  assert.equal(addDays("2026-12-31", 1), "2027-01-01");
});
test("rolling mean uses recorded days and never fills missing observations with zero", () => {
  assert.equal(
    rollingAverage(
      [
        { date: "2026-11-01", value: 64 },
        { date: "2026-11-05", value: 66 },
      ],
      "2026-11-05",
    ),
    65,
  );
  assert.equal(rollingAverage([], "2026-11-05"), null);
});
test("aggregate steps do not add overlapping phone and watch records", () => {
  const data = [
    row({ id: "a", metric: "steps", source: "Phone", value: 2000 }),
    row({ id: "b", metric: "steps", source: "Watch", value: 4000 }),
    row({
      id: "c",
      metric: "steps",
      source: "Health Connect · aggregate",
      value: 4500,
    }),
  ];
  assert.equal(dailyValues(data, "steps", profile)[0]?.value, 4500);
});
test("explicit source selection overrides the automatic source", () => {
  const data = [
    row({ id: "a", value: 65, source: "Scale" }),
    row({ id: "b", value: 66, source: "Manual" }),
  ];
  assert.equal(
    dailyValues(data, "weight", {
      ...profile,
      preferredSources: { weight: "Scale" },
    })[0]?.value,
    65,
  );
});
test("hydration sums only a single selected source for a day", () => {
  const data = [
    row({ id: "a", metric: "water", value: 250 }),
    row({ id: "b", metric: "water", value: 500 }),
    row({ id: "c", metric: "water", source: "Other", value: 750 }),
  ];
  assert.equal(
    dailyValues(data, "water", {
      ...profile,
      preferredSources: { water: "Manual" },
    })[0]?.value,
    750,
  );
});
test("overlapping sleep sessions are merged, avoiding double counting", () => {
  const data = [
    row({
      id: "a",
      metric: "sleep",
      value: 8,
      recordedAt: "2026-11-04T23:00:00Z",
      endAt: "2026-11-05T07:00:00Z",
    }),
    row({
      id: "b",
      metric: "sleep",
      value: 7,
      recordedAt: "2026-11-05T00:00:00Z",
      endAt: "2026-11-05T07:00:00Z",
    }),
  ];
  assert.equal(dailyValues(data, "sleep", profile)[0]?.value, 8);
});
test("a known zero is preserved while absent nutrients are unknown", () => {
  const t = totals([meal({ fiber: 0 }), meal({ protein: 10 })]);
  assert.equal(t.fiber.value, 0);
  assert.equal(t.fiber.coverage, 0.5);
  assert.equal(t.calcium.value, null);
  assert.equal(t.calcium.known, 0);
});
test("no meals means unknown totals rather than zero intake", () => {
  assert.equal(totals([]).energy.value, null);
  assert.equal(totals([]).energy.coverage, 0);
});
test("portion scaling carries zero and missing values distinctly", () => {
  assert.deepEqual(
    portion({ energy: 200, protein: 10, fiber: 0, biotin: null }, 150),
    { energy: 300, protein: 15, fiber: 0, biotin: null },
  );
  assert.throws(() => portion({}, -1));
  assert.throws(() => portion({}, NaN));
});
test("recipes account for finished weight and propagate unknown ingredients", () => {
  const food = starterFoods[0]!;
  const a = { ...food, nutrients: { energy: 100, protein: 10 } },
    b = { ...food, nutrients: { energy: 200 } };
  const t = recipeNutrients(
    [
      { food: a, grams: 100 },
      { food: b, grams: 50 },
    ],
    100,
  );
  assert.equal(t.energy, 200);
  assert.equal(t.protein, null);
  assert.throws(() => recipeNutrients([], 100));
  assert.throws(() => recipeNutrients([{ food: a, grams: NaN }], 100));
});
test("DRI selection is demographic and age-specific", () => {
  assert.equal(references(profile).iron?.amount, 8);
  assert.equal(
    references({ ...profile, referenceSex: "female" }).iron?.amount,
    18,
  );
  assert.equal(references(profile).magnesium?.amount, 400);
  assert.equal(references({ ...profile, age: 35 }).magnesium?.amount, 420);
});
test("unsupported ages and specialized nutrition never receive invented DRIs", () => {
  for (const p of [
    { ...profile, age: 18 },
    { ...profile, age: 51 },
    { ...profile, age: null },
    { ...profile, specialReferences: true },
    { ...profile, referenceSex: "unspecified" as const },
  ])
    assert.equal(references(p).calcium, undefined);
});
test("user targets remain explicit and do not create a calorie deficit", () => {
  assert.equal(references(profile).energy, undefined);
  assert.equal(
    references({ ...profile, energyTarget: 2200 }).energy?.type,
    "User",
  );
});
test("supplement-only upper limits are not compared to total food values", () => {
  const total = { value: 1000, known: 1, entries: 1, coverage: 1 };
  assert.equal(
    nutrientStatus(total, references(profile).magnesium),
    "RDA planning reference",
  );
  assert.match(
    nutrientStatus({ ...total, value: 3000 }, references(profile).calcium),
    /Above upper limit/,
  );
});
test("USDA microgram spelling variants normalize without mistaking IU or mg", () => {
  for (const unit of ["µg", "μg", "ug", "UG"]) {
    const f = foodFromUSDA({
      fdcId: 1,
      description: "Fixture",
      foodNutrients: [{ nutrient: { id: 1106, unitName: unit }, amount: 900 }],
    });
    assert.equal(f.nutrients.vitaminA, 900);
  }
  assert.equal(
    foodFromUSDA({
      fdcId: 1,
      description: "Fixture",
      foodNutrients: [{ nutrient: { id: 1106, unitName: "IU" }, amount: 900 }],
    }).nutrients.vitaminA,
    undefined,
  );
});
test("USDA ALA and LA require the specific fatty acid identifiers", () => {
  const f = foodFromUSDA({
    fdcId: 1,
    description: "Fixture",
    foodNutrients: [
      { nutrient: { id: 1268, unitName: "g" }, amount: 5 },
      { nutrient: { id: 1269, unitName: "g" }, amount: 4 },
      { nutrient: { id: 1404, unitName: "g" }, amount: 0.2 },
      { nutrient: { id: 1316, unitName: "g" }, amount: 0.3 },
    ],
  });
  assert.equal(f.nutrients.omega3, 0.2);
  assert.equal(f.nutrients.omega6, 0.3);
});
test("niacin equivalents require both dietary niacin and tryptophan", () => {
  const base = {
    fdcId: 1,
    description: "Fixture",
    foodNutrients: [{ nutrient: { id: 1167, unitName: "mg" }, amount: 2 }],
  };
  assert.equal(foodFromUSDA(base).nutrients.niacin, undefined);
  assert.equal(
    foodFromUSDA({
      ...base,
      foodNutrients: [
        ...base.foodNutrients,
        { nutrient: { id: 1210, unitName: "g" }, amount: 0.12 },
      ],
    }).nutrients.niacin,
    4,
  );
});
test("the offline catalog matches documented USDA reference values and known zeros", () => {
  for (const food of starterFoods) foodSchema.parse(food);
  const banana = starterFoods.find((f) => f.id === "usda-173944")!;
  assert.equal(banana.nutrients.energy, 89);
  assert.equal(banana.nutrients.protein, 1.09);
  assert.equal(banana.nutrients.potassium, 358);
  assert.equal(banana.nutrients.vitaminA, 3);
  const almonds = starterFoods.find((f) => f.id === "usda-170567")!;
  assert.equal(almonds.nutrients.vitaminA, 0);
  assert.equal(banana.nutrients.biotin, undefined);
});
test("blood-pressure escalation checks either number and gives symptom-specific action", () => {
  assert.equal(bloodPressureMessage(181, 80).level, "urgent");
  assert.equal(bloodPressureMessage(120, 121).level, "urgent");
  assert.match(bloodPressureMessage(181, 80).text, /call 911 now/);
  assert.equal(bloodPressureMessage(140, 80).level, "review");
  assert.equal(bloodPressureMessage(119, 79).level, "info");
});
test("measurement validation rejects invalid pressure pairs and impossible percentage values", () => {
  assert.throws(() =>
    measurementSchema.parse(
      row({ metric: "bloodPressure", value: 100, secondary: 110 }),
    ),
  );
  assert.throws(() =>
    measurementSchema.parse(row({ metric: "oxygen", value: 101 })),
  );
  assert.throws(() => measurementSchema.parse(row({ value: NaN })));
});
test("correlation matches dates and requires at least seven pairs with variation", () => {
  const p = Array.from({ length: 7 }, (_, i) => ({
    date: addDays("2026-11-01", i),
    value: i,
  }));
  assert.equal(correlation(p, p).r, 1);
  assert.equal(
    correlation(
      p,
      p.map((x) => ({ ...x, value: -x.value })),
    ).r,
    -1,
  );
  assert.equal(correlation(p.slice(0, 6), p).r, null);
  assert.equal(
    correlation(
      p,
      p.map((x) => ({ ...x, value: 1 })),
    ).r,
    null,
  );
});
test("empty data produces a sufficiency explanation instead of invented coaching", () => {
  const i = insights(emptyData(), profile, "2026-11-05");
  assert.equal(i.length, 1);
  assert.match(i[0]!.title, /baseline/);
});
test("partial and uncompleted diet diaries do not trigger nutrient gap claims", () => {
  const d = emptyData();
  d.checkins = Array.from({ length: 5 }, (_, i) => ({
    id: String(i),
    date: addDays("2026-11-01", i),
    energy: 3,
    soreness: 1,
    recovery: 3,
    nutritionComplete: true,
    notes: "",
  }));
  d.meals = d.checkins.flatMap((c) => [
    {
      id: c.id,
      date: c.date,
      meal: "Breakfast" as const,
      foodId: "f",
      foodName: "Unknown",
      grams: 100,
      nutrients: { protein: 10 },
      source: "User",
      recordedAt: c.date + "T12:00:00Z",
    },
  ]);
  assert.ok(
    !insights(d, profile, "2026-11-05").some((i) => i.id.startsWith("fiber")),
  );
});
test("external training volume counts only completed sets and excludes bodyweight load", () => {
  const w = {
    id: "w",
    name: "Test",
    source: "Manual",
    startedAt: "2026-11-05T00:00:00Z",
    completedAt: null,
    notes: "",
    sets: [
      {
        id: "s",
        exerciseId: "squat",
        reps: 10,
        kg: 20,
        seconds: 0,
        distanceKm: 0,
        rpe: 6,
        done: true,
      },
      {
        id: "s2",
        exerciseId: "squat",
        reps: 10,
        kg: 30,
        seconds: 0,
        distanceKm: 0,
        rpe: 6,
        done: false,
      },
    ],
  };
  assert.equal(volume(w), 200);
});

test("IANA midnight boundaries preserve 23- and 25-hour daylight saving days", () => {
  const zone = "America/Los_Angeles";
  assert.equal(
    (zonedMidnight("2026-03-09", zone).getTime() -
      zonedMidnight("2026-03-08", zone).getTime()) /
      3600000,
    23,
  );
  assert.equal(
    (zonedMidnight("2026-11-02", zone).getTime() -
      zonedMidnight("2026-11-01", zone).getTime()) /
      3600000,
    25,
  );
});
