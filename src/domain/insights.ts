import type { Data, Profile } from "./model";
import { addDays, dailyValues, mean, rollingAverage } from "./metrics";
import { references, totals } from "./nutrition";
export type Insight = {
  id: string;
  title: string;
  observation: string;
  action: string;
  evidence: string;
  confidence: "Limited" | "Moderate";
  source: string;
};
export function insights(
  data: Data,
  profile: Profile,
  today: string,
): Insight[] {
  const out: Insight[] = [];
  const start = addDays(today, -13);
  const weight = dailyValues(data.measurements, "weight", profile).filter(
    (v) => v.date >= start && v.date <= today,
  );
  const sleep = dailyValues(data.measurements, "sleep", profile).filter(
    (v) => v.date >= addDays(today, -6) && v.date <= today,
  );
  if (sleep.length >= 4) {
    const avg = mean(sleep.map((v) => v.value))!;
    out.push({
      id: `sleep-${today}`,
      title: "Make room for recovery",
      observation: `Your recorded sleep averaged ${avg.toFixed(1)} hours.`,
      action:
        avg < 7
          ? "Consider a consistent sleep window with more time for rest. Wearable sleep is an estimate."
          : "Keep a sleep schedule that leaves you feeling rested.",
      evidence: `${sleep.length} recorded nights, ${addDays(today, -6)} to ${today}. Missing nights excluded.`,
      confidence: "Moderate",
      source: "https://www.cdc.gov/sleep/about/",
    });
  }
  const complete = data.checkins.filter(
    (c) => c.nutritionComplete && c.date >= start && c.date <= today,
  );
  const refs = references(profile);
  for (const key of ["fiber", "calcium", "iron", "vitaminC"] as const) {
    const ref = refs[key];
    if (!ref) continue;
    const usable = complete
      .map((c) => totals(data.meals.filter((m) => m.date === c.date))[key])
      .filter((t) => t.coverage >= 0.9 && t.value !== null);
    if (usable.length >= 4) {
      const avg = mean(usable.map((t) => t.value!))!;
      if (avg < ref.amount * 0.8)
        out.push({
          id: `${key}-${today}`,
          title: `Review recorded ${key === "vitaminC" ? "vitamin C" : key}`,
          observation: `Average recorded intake was ${avg.toFixed(1)} against a ${ref.amount} ${key === "fiber" ? "g" : "mg"} planning reference.`,
          action:
            key === "fiber"
              ? "Consider beans, fruit, vegetables or whole grains you enjoy."
              : "Consider a food source you enjoy that provides this nutrient. This does not establish a deficiency.",
          evidence: `${usable.length} days marked complete with ≥90% food-entry coverage, ${start} to ${today}. Values remain food-composition estimates.`,
          confidence: "Limited",
          source: ref.source,
        });
    }
  }
  const sessions = data.workouts.filter(
    (w) =>
      w.completedAt &&
      w.startedAt.slice(0, 10) >= start &&
      w.startedAt.slice(0, 10) <= today,
  );
  if (weight.length >= 8 && sessions.length >= 4 && !profile.hideWeight) {
    const change =
      rollingAverage(weight, today)! -
      rollingAverage(weight, addDays(today, -7))!;
    if (Math.abs(change) < 0.5)
      out.push({
        id: `consistency-${today}`,
        title: "A consistent foundation",
        observation: `You recorded ${sessions.length} completed workouts alongside a relatively stable weight trend.`,
        action:
          "Continue if your routine feels comfortable and supports your goals. This pattern cannot prove body recomposition.",
        evidence: `${weight.length} weight days, ${sessions.length} workouts; 7-day averages over ${start} to ${today}.`,
        confidence: "Limited",
        source: "FORM deterministic trend calculations",
      });
  }
  if (!out.length)
    out.push({
      id: `baseline-${today}`,
      title: "Build your baseline",
      observation:
        "There is not enough recorded history for a personalized trend.",
      action:
        "Log what matters to you. Four recorded nights support a sleep summary; nutrition patterns need at least four days marked complete with sufficient composition data.",
      evidence: "No missing measurements or unlogged foods are imputed.",
      confidence: "Limited",
      source: "FORM data sufficiency rules",
    });
  return out
    .filter(
      (i) =>
        !data.insightStates.some(
          (s) => s.id === i.id && s.status === "dismissed",
        ),
    )
    .slice(0, 6);
}
export function correlation(
  a: Array<{ date: string; value: number }>,
  b: Array<{ date: string; value: number }>,
): { n: number; r: number | null } {
  const lookup = new Map(b.map((x) => [x.date, x.value]));
  const pairs = a
    .filter((x) => lookup.has(x.date))
    .map((x) => [x.value, lookup.get(x.date)!] as [number, number]);
  if (pairs.length < 7) return { n: pairs.length, r: null };
  const am = mean(pairs.map((p) => p[0]))!,
    bm = mean(pairs.map((p) => p[1]))!;
  const cov = pairs.reduce((s, p) => s + (p[0] - am) * (p[1] - bm), 0);
  const va = pairs.reduce((s, p) => s + (p[0] - am) ** 2, 0),
    vb = pairs.reduce((s, p) => s + (p[1] - bm) ** 2, 0);
  return { n: pairs.length, r: va && vb ? cov / Math.sqrt(va * vb) : null };
}
