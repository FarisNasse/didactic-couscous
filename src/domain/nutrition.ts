import type { Food, Meal, Nutrient, NutrientMap, Profile } from "./model";
import { nutrientKeys } from "./model";

export const nutrientInfo: Record<
  Nutrient,
  { label: string; unit: string; group: "Macros" | "Vitamins" | "Minerals" }
> = Object.fromEntries(
  [
    ["energy", "Energy", "kcal", "Macros"],
    ["protein", "Protein", "g", "Macros"],
    ["carbs", "Carbohydrate", "g", "Macros"],
    ["fat", "Total fat", "g", "Macros"],
    ["fiber", "Fiber", "g", "Macros"],
    ["sugar", "Total sugars", "g", "Macros"],
    ["addedSugar", "Added sugars", "g", "Macros"],
    ["saturatedFat", "Saturated fat", "g", "Macros"],
    ["monoFat", "Monounsaturated fat", "g", "Macros"],
    ["polyFat", "Polyunsaturated fat", "g", "Macros"],
    ["omega3", "Omega-3 (ALA)", "g", "Macros"],
    ["omega6", "Omega-6 (LA)", "g", "Macros"],
    ["cholesterol", "Cholesterol", "mg", "Macros"],
    ["caffeine", "Caffeine", "mg", "Macros"],
    ["alcohol", "Alcohol", "g", "Macros"],
    ["water", "Food water", "ml", "Macros"],
    ["vitaminA", "Vitamin A (RAE)", "µg", "Vitamins"],
    ["vitaminC", "Vitamin C", "mg", "Vitamins"],
    ["vitaminD", "Vitamin D", "µg", "Vitamins"],
    ["vitaminE", "Vitamin E (alpha-tocopherol)", "mg", "Vitamins"],
    ["vitaminK", "Vitamin K", "µg", "Vitamins"],
    ["thiamin", "Thiamin (B1)", "mg", "Vitamins"],
    ["riboflavin", "Riboflavin (B2)", "mg", "Vitamins"],
    ["niacin", "Niacin (NE)", "mg", "Vitamins"],
    ["pantothenicAcid", "Pantothenic acid (B5)", "mg", "Vitamins"],
    ["vitaminB6", "Vitamin B6", "mg", "Vitamins"],
    ["biotin", "Biotin (B7)", "µg", "Vitamins"],
    ["folate", "Folate (DFE)", "µg", "Vitamins"],
    ["vitaminB12", "Vitamin B12", "µg", "Vitamins"],
    ["calcium", "Calcium", "mg", "Minerals"],
    ["iron", "Iron", "mg", "Minerals"],
    ["magnesium", "Magnesium", "mg", "Minerals"],
    ["phosphorus", "Phosphorus", "mg", "Minerals"],
    ["potassium", "Potassium", "mg", "Minerals"],
    ["sodium", "Sodium", "mg", "Minerals"],
    ["chloride", "Chloride", "mg", "Minerals"],
    ["zinc", "Zinc", "mg", "Minerals"],
    ["copper", "Copper", "mg", "Minerals"],
    ["manganese", "Manganese", "mg", "Minerals"],
    ["selenium", "Selenium", "µg", "Minerals"],
    ["iodine", "Iodine", "µg", "Minerals"],
    ["chromium", "Chromium", "µg", "Minerals"],
    ["molybdenum", "Molybdenum", "µg", "Minerals"],
    ["choline", "Choline", "mg", "Minerals"],
  ].map(([key, label, unit, group]) => [key, { label, unit, group }]),
) as typeof nutrientInfo;

export type Reference = {
  amount: number;
  type: "RDA" | "AI" | "User";
  upper?: number;
  upperScope?: "total" | "supplemental" | "preformed";
  source: string;
  version: string;
};
const dri = "https://ods.od.nih.gov/HealthInformation/nutrientrecommendations/";
/** Adults 19–50 only. Other ages and pregnancy/lactation deliberately return no DRI. */
export function references(
  profile: Profile,
): Partial<Record<Nutrient, Reference>> {
  const out: Partial<Record<Nutrient, Reference>> = {};
  if (
    profile.age != null &&
    profile.age >= 19 &&
    profile.age <= 50 &&
    profile.referenceSex !== "unspecified" &&
    !profile.specialReferences
  ) {
    const m = profile.referenceSex === "male";
    const data: Partial<
      Record<
        Nutrient,
        [number, "RDA" | "AI", number?, Reference["upperScope"]?]
      >
    > = {
      fiber: [m ? 38 : 25, "AI"],
      carbs: [130, "RDA"],
      omega3: [m ? 1.6 : 1.1, "AI"],
      omega6: [m ? 17 : 12, "AI"],
      vitaminA: [m ? 900 : 700, "RDA", 3000, "preformed"],
      vitaminC: [m ? 90 : 75, "RDA", 2000, "total"],
      vitaminD: [15, "RDA", 100, "total"],
      vitaminE: [15, "RDA", 1000, "supplemental"],
      vitaminK: [m ? 120 : 90, "AI"],
      thiamin: [m ? 1.2 : 1.1, "RDA"],
      riboflavin: [m ? 1.3 : 1.1, "RDA"],
      niacin: [m ? 16 : 14, "RDA", 35, "supplemental"],
      pantothenicAcid: [5, "AI"],
      vitaminB6: [1.3, "RDA", 100, "total"],
      biotin: [30, "AI"],
      folate: [400, "RDA", 1000, "supplemental"],
      vitaminB12: [2.4, "RDA"],
      calcium: [1000, "RDA", 2500, "total"],
      iron: [m ? 8 : 18, "RDA", 45, "total"],
      magnesium: [
        m ? (profile.age >= 31 ? 420 : 400) : profile.age >= 31 ? 320 : 310,
        "RDA",
        350,
        "supplemental",
      ],
      phosphorus: [700, "RDA", 4000, "total"],
      potassium: [m ? 3400 : 2600, "AI"],
      sodium: [1500, "AI"],
      chloride: [2300, "AI", 3600, "total"],
      zinc: [m ? 11 : 8, "RDA", 40, "total"],
      copper: [0.9, "RDA", 10, "total"],
      manganese: [m ? 2.3 : 1.8, "AI", 11, "total"],
      selenium: [55, "RDA", 400, "total"],
      iodine: [150, "RDA", 1100, "total"],
      chromium: [m ? 35 : 25, "AI"],
      molybdenum: [45, "RDA", 2000, "total"],
      choline: [m ? 550 : 425, "AI", 3500, "total"],
    };
    for (const k of nutrientKeys) {
      const d = data[k];
      if (d)
        out[k] = {
          amount: d[0],
          type: d[1],
          upper: d[2],
          upperScope: d[3],
          source: dri,
          version: "NASEM DRI; Na/K 2019; reviewed 2026-11-05",
        };
    }
  }
  if (profile.energyTarget)
    out.energy = {
      amount: profile.energyTarget,
      type: "User",
      source: "Personal planning target",
      version: "User configured",
    };
  if (profile.proteinTarget)
    out.protein = {
      amount: profile.proteinTarget,
      type: "User",
      source: "Personal planning target",
      version: "User configured",
    };
  return out;
}
export type NutrientTotal = {
  value: number | null;
  known: number;
  entries: number;
  coverage: number;
};
/** Missing values never become zero. Known subtotal and entry coverage are returned together. */
export function totals(
  meals: Pick<Meal, "nutrients">[],
): Record<Nutrient, NutrientTotal> {
  return Object.fromEntries(
    nutrientKeys.map((key) => {
      const known = meals
        .map((m) => m.nutrients[key])
        .filter((v): v is number => v != null);
      return [
        key,
        {
          value: known.length ? known.reduce((a, b) => a + b, 0) : null,
          known: known.length,
          entries: meals.length,
          coverage: meals.length ? known.length / meals.length : 0,
        },
      ];
    }),
  ) as Record<Nutrient, NutrientTotal>;
}
export function portion(nutrients: NutrientMap, grams: number): NutrientMap {
  if (!Number.isFinite(grams) || grams <= 0)
    throw new Error("Enter a positive portion in grams.");
  return Object.fromEntries(
    nutrientKeys
      .filter((k) => k in nutrients)
      .map((k) => [
        k,
        nutrients[k] == null ? null : (nutrients[k]! * grams) / 100,
      ]),
  );
}
export function recipeNutrients(
  ingredients: Array<{ food: Food; grams: number }>,
  finishedGrams: number,
): NutrientMap {
  if (
    !ingredients.length ||
    !Number.isFinite(finishedGrams) ||
    finishedGrams <= 0
  )
    throw new Error("Add ingredients and a positive finished weight.");
  const rows = ingredients.map((i) => ({
    nutrients: portion(i.food.nutrients, i.grams),
  }));
  const sum = totals(rows);
  return Object.fromEntries(
    nutrientKeys.map((k) => [
      k,
      sum[k].coverage === 1 ? (sum[k].value! * 100) / finishedGrams : null,
    ]),
  );
}
export function nutrientStatus(total: NutrientTotal, ref?: Reference): string {
  if (total.value === null) return "No composition data";
  if (ref?.upper && ref.upperScope === "total" && total.value > ref.upper)
    return "Above upper limit · review intake";
  if (total.coverage < 1) return "Partial nutrient data";
  if (!ref) return "No selected reference";
  return ref.type === "User"
    ? "Personal target"
    : `${ref.type} planning reference`;
}

// USDA numeric nutrient identifiers and units: only semantically equivalent forms are mapped.
const usdaMap: Record<number, [Nutrient, string]> = {
  1008: ["energy", "KCAL"],
  1003: ["protein", "G"],
  1004: ["fat", "G"],
  1005: ["carbs", "G"],
  1079: ["fiber", "G"],
  2000: ["sugar", "G"],
  1235: ["addedSugar", "G"],
  1258: ["saturatedFat", "G"],
  1292: ["monoFat", "G"],
  1293: ["polyFat", "G"],
  1404: ["omega3", "G"],
  1316: ["omega6", "G"],
  1253: ["cholesterol", "MG"],
  1057: ["caffeine", "MG"],
  1018: ["alcohol", "G"],
  1051: ["water", "G"],
  1106: ["vitaminA", "UG"],
  1162: ["vitaminC", "MG"],
  1114: ["vitaminD", "UG"],
  1109: ["vitaminE", "MG"],
  1185: ["vitaminK", "UG"],
  1165: ["thiamin", "MG"],
  1166: ["riboflavin", "MG"],
  1170: ["pantothenicAcid", "MG"],
  1175: ["vitaminB6", "MG"],
  1176: ["biotin", "UG"],
  1190: ["folate", "UG"],
  1178: ["vitaminB12", "UG"],
  1087: ["calcium", "MG"],
  1089: ["iron", "MG"],
  1090: ["magnesium", "MG"],
  1091: ["phosphorus", "MG"],
  1092: ["potassium", "MG"],
  1093: ["sodium", "MG"],
  1088: ["chloride", "MG"],
  1095: ["zinc", "MG"],
  1098: ["copper", "MG"],
  1101: ["manganese", "MG"],
  1103: ["selenium", "UG"],
  1100: ["iodine", "UG"],
  1096: ["chromium", "UG"],
  1102: ["molybdenum", "UG"],
  1180: ["choline", "MG"],
};
const normalizeUnit = (unit: string | undefined) =>
  (unit ?? "").replace(/[µμ]/g, "u").toUpperCase();
export function foodFromUSDA(raw: unknown): Food {
  const r = raw as {
    fdcId?: number;
    description?: string;
    brandOwner?: string;
    gtinUpc?: string;
    publicationDate?: string;
    foodNutrients?: Array<{
      nutrient?: { id?: number; unitName?: string };
      nutrientId?: number;
      unitName?: string;
      amount?: number;
      value?: number;
    }>;
  };
  if (!r || !r.fdcId || !r.description || !Array.isArray(r.foodNutrients))
    throw new Error("Not a USDA FoodData Central record.");
  const nutrients: NutrientMap = {};
  for (const row of r.foodNutrients) {
    const mapping = usdaMap[row.nutrient?.id ?? row.nutrientId ?? -1];
    const value = row.amount ?? row.value;
    if (
      mapping &&
      Number.isFinite(value) &&
      value! >= 0 &&
      normalizeUnit(row.nutrient?.unitName ?? row.unitName) === mapping[1]
    )
      nutrients[mapping[0]] = value;
  }
  // Energy may be reported as kcal under the newer Atwater-specific factor IDs.
  if (nutrients.energy == null)
    for (const id of [2047, 2048]) {
      const n = r.foodNutrients.find(
        (n) => (n.nutrient?.id ?? n.nutrientId) === id,
      );
      if (n && (n.nutrient?.unitName ?? n.unitName)?.toUpperCase() === "KCAL")
        nutrients.energy = n.amount ?? n.value;
    }
  const find = (id: number, unit: string) => {
    const n = r.foodNutrients?.find(
      (n) => (n.nutrient?.id ?? n.nutrientId) === id,
    );
    const v = n?.amount ?? n?.value;
    return n &&
      normalizeUnit(n.nutrient?.unitName ?? n.unitName) === unit &&
      Number.isFinite(v) &&
      v! >= 0
      ? v
      : null;
  };
  const dietaryNiacin = find(1167, "MG"),
    tryptophan = find(1210, "G");
  // 1 mg niacin equivalent = 1 mg niacin or 60 mg tryptophan; no NE imputation if either is missing.
  if (dietaryNiacin != null && tryptophan != null)
    nutrients.niacin = dietaryNiacin + (tryptophan * 1000) / 60;
  return {
    id: `usda-${r.fdcId}`,
    name: r.description,
    brand: r.brandOwner || "",
    source: `USDA FoodData Central · ${r.fdcId}`,
    sourceUrl: `https://fdc.nal.usda.gov/food-details/${r.fdcId}/nutrients`,
    version: r.publicationDate || "Source date unavailable",
    servingGrams: 100,
    servingLabel: "100 g",
    barcode: r.gtinUpc,
    favorite: false,
    nutrients,
  };
}
