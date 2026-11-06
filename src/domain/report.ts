import type { Data, Profile } from "./model";
import { addDays, dailyValues, localDay, mean } from "./metrics";
import { totals } from "./nutrition";
import { insights } from "./insights";
export const escapeHtml = (text: unknown): string =>
  String(text ?? "").replace(
    /[&<>"']/g,
    (ch) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        ch
      ]!,
  );
export function reportHtml(
  data: Data,
  profile: Profile,
  today: string,
  days = 7,
): string {
  const from = addDays(today, 1 - days),
    range = (date: string) => date >= from && date <= today;
  const sleep = dailyValues(data.measurements, "sleep", profile).filter((v) =>
    range(v.date),
  );
  const steps = dailyValues(data.measurements, "steps", profile).filter((v) =>
    range(v.date),
  );
  const workouts = data.workouts.filter(
    (w) => w.completedAt && range(localDay(w.startedAt, profile.timezone)),
  );
  const meals = data.meals.filter((m) => range(m.date));
  const nutrient = totals(meals);
  const bp = data.measurements
    .filter(
      (m) =>
        m.metric === "bloodPressure" &&
        range(localDay(m.recordedAt, profile.timezone)),
    )
    .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  const val = (n: number | null, unit: string) =>
    n === null ? "Not recorded" : `${n.toFixed(1)} ${unit}`;
  const rows = [
    [
      "Sleep · average recorded night",
      val(mean(sleep.map((v) => v.value)), "h"),
    ],
    [
      "Steps · average recorded day",
      val(mean(steps.map((v) => v.value)), "steps"),
    ],
    ["Completed workouts", String(workouts.length)],
    ["Food entries", String(meals.length)],
    [
      "Diary days marked complete",
      String(
        data.checkins.filter((c) => range(c.date) && c.nutritionComplete)
          .length,
      ),
    ],
    [
      "Protein · known subtotal across period",
      val(nutrient.protein.value, "g"),
    ],
  ];
  return `<!doctype html><html><head><meta charset="utf-8"><title>FORM review</title><style>@page{margin:22mm}body{font-family:Arial,sans-serif;color:#202a25;font-size:12px;line-height:1.6}h1{font-size:34px;font-weight:500}h2{font-size:18px;margin-top:28px}small{color:#64736b}table{border-collapse:collapse;width:100%;margin:16px 0}td,th{border-bottom:1px solid #dfe5dc;text-align:left;padding:10px}header{border-bottom:2px solid #43634d;padding-bottom:16px}.insight{background:#edf1e8;padding:16px;margin:12px 0;break-inside:avoid}footer{margin-top:32px;font-size:10px;color:#64736b}</style></head><body><header><small>F O R M · PERSONAL JOURNAL</small><h1>${days <= 7 ? "Weekly" : days <= 31 ? "Monthly" : "Quarterly"} review</h1><p>${escapeHtml(profile.name || "Personal journal")} · ${from} – ${today} · ${escapeHtml(profile.timezone)}</p>${profile.demo ? "<strong>FICTIONAL SAMPLE DATA</strong>" : ""}</header><h2>A record of your routine</h2><table>${rows.map(([k, v]) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(v)}</td></tr>`).join("")}</table><p>Means exclude missing days. Nutrition values are known subtotals of logged entries, not estimated total intake. Protein composition coverage: ${Math.round(nutrient.protein.coverage * 100)}% of food entries.</p><h2>Observations</h2>${insights(
    data,
    profile,
    today,
  )
    .map(
      (i) =>
        `<div class="insight"><strong>${escapeHtml(i.title)}</strong><p>${escapeHtml(i.observation)} ${escapeHtml(i.action)}</p><small>${escapeHtml(i.evidence)} Confidence: ${i.confidence}. Source: ${escapeHtml(i.source)}</small></div>`,
    )
    .join(
      "",
    )}<h2>Blood-pressure log</h2>${bp.length ? `<table><tr><th>Recorded</th><th>mmHg</th><th>Source / notes</th></tr>${bp.map((m) => `<tr><td>${escapeHtml(m.recordedAt)}</td><td>${m.value} / ${m.secondary}</td><td>${escapeHtml(m.source)} · ${escapeHtml(m.notes)}</td></tr>`).join("")}</table>` : "<p>No readings in this period.</p>"}<footer>Generated ${escapeHtml(new Date().toISOString())}. FORM is an informational wellness journal. It does not diagnose or prescribe. Share this file only with people you choose.</footer></body></html>`;
}
