import type { Data, Operation } from "../domain/model";
import { addDays } from "../domain/metrics";
import { portion } from "../domain/nutrition";
import { starterFoods } from "./foods";
export function demoOperations(today: string, timezone: string): Operation[] {
  const ops: Operation[] = [];
  for (let i = 0; i < 21; i++) {
    const date = addDays(today, i - 20),
      at = new Date(`${date}T12:00:00`).toISOString();
    const values = {
      weight: 65.8 + Math.sin(i * 1.4) * 0.3 - i * 0.01,
      steps: 5200 + ((i * 733) % 4500),
      sleep: 6.7 + (i % 5) * 0.3,
      restingHeartRate: 65 - i * 0.12,
      waist: 76.5 - i * 0.015,
    };
    for (const [metric, value] of Object.entries(values)) {
      const id = `demo-${metric}-${date}`;
      ops.push({
        collection: "measurements",
        id,
        value: {
          id,
          metric: metric as "weight",
          value,
          unit:
            metric === "weight"
              ? "kg"
              : metric === "steps"
                ? "steps"
                : metric === "sleep"
                  ? "h"
                  : metric === "waist"
                    ? "cm"
                    : "bpm",
          recordedAt: at,
          timezone,
          source: "Sample · fictional",
          notes: "Fictional sample data",
          updatedAt: at,
        },
      });
    }
    for (const [j, food] of starterFoods
      .filter((f) =>
        [
          "usda-173944",
          "usda-168917",
          "usda-172421",
          "usda-171265",
          "usda-173424",
          "usda-170379",
        ].includes(f.id),
      )
      .entries()) {
      const id = `demo-meal-${date}-${j}`,
        grams = 100 + j * 25;
      ops.push({
        collection: "meals",
        id,
        value: {
          id,
          date,
          meal: j < 2 ? "Breakfast" : j < 4 ? "Lunch" : "Dinner",
          foodId: food.id,
          foodName: food.name,
          grams,
          nutrients: portion(food.nutrients, grams),
          source: "Sample · fictional",
          recordedAt: at,
        },
      });
    }
    const id = `demo-check-${date}`;
    ops.push({
      collection: "checkins",
      id,
      value: {
        id,
        date,
        energy: 3 + (i % 2),
        soreness: 1 + (i % 3),
        recovery: 3,
        nutritionComplete: true,
        notes: "Fictional sample check-in",
      },
    });
  }
  return ops;
}
export function removeDemo(data: Data): Operation[] {
  return (Object.keys(data) as Array<keyof Data>).flatMap((collection) =>
    data[collection]
      .filter((row) => row.id.startsWith("demo-"))
      .map((row) => ({ collection, id: row.id, value: null }) as Operation),
  );
}
