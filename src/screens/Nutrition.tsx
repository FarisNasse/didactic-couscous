import React, { useState } from "react";
import { Linking, Pressable, View } from "react-native";
import BarcodeScanner from "../components/BarcodeScanner";
import {
  Button,
  Card,
  Choices,
  ConfirmButton,
  Empty,
  Field,
  Icon,
  Notice,
  Pill,
  Progress,
  Row,
  Screen,
  Section,
  Sheet,
  Stack,
  Stat,
  Toggle,
  Txt,
  useAction,
  useTheme,
} from "../components/ui";
import { commit, getProfile, uid, useData } from "../state/store";
import { addDays, localDay } from "../domain/metrics";
import {
  nutrientKeys,
  foodSchema,
  type Food,
  type Nutrient,
  type NutrientMap,
} from "../domain/model";
import {
  nutrientInfo,
  nutrientStatus,
  portion,
  recipeNutrients,
  references,
  totals,
  type Reference,
} from "../domain/nutrition";

export default function Nutrition() {
  const d = useData(),
    p = getProfile(),
    t = useTheme(),
    a = useAction();
  const [date, setDate] = useState(localDay(new Date(), p.timezone)),
    [tab, setTab] = useState("Diary"),
    [group, setGroup] = useState("Macros"),
    [foodOpen, setFoodOpen] = useState(false),
    [custom, setCustom] = useState(false),
    [recipe, setRecipe] = useState(false),
    [search, setSearch] = useState(""),
    [selected, setSelected] = useState<Food | null>(null),
    [grams, setGrams] = useState("100"),
    [meal, setMeal] = useState<"Breakfast" | "Lunch" | "Dinner" | "Snack">(
      "Breakfast",
    ),
    [onlyFavorites, setOnlyFavorites] = useState(false),
    [ref, setRef] = useState<{ key: Nutrient; reference?: Reference } | null>(
      null,
    );
  const [scanning, setScanning] = useState(false);
  const entries = d.meals.filter((m) => m.date === date),
    sum = totals(entries),
    refs = references(p),
    check = d.checkins.find((c) => c.date === date);
  const filtered = d.foods.filter(
    (f) =>
      (!onlyFavorites || f.favorite) &&
      `${f.name} ${f.brand} ${f.barcode ?? ""}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  async function logFood() {
    if (!selected) return;
    const g = Number(grams);
    if (!g || g <= 0 || g > 10000)
      throw new Error("Enter a portion from 0 to 10,000 grams.");
    const id = uid();
    await commit([
      {
        collection: "meals",
        id,
        value: {
          id,
          date,
          meal,
          foodId: selected.id,
          foodName: selected.name,
          grams: g,
          nutrients: portion(selected.nutrients, g),
          source: selected.source,
          recordedAt: new Date().toISOString(),
        },
      },
    ]);
    setSelected(null);
    setFoodOpen(false);
  }
  return (
    <Screen title="Eat well. Feel well." eyebrow="Nutrition">
      <Row style={{ justifyContent: "space-between" }}>
        <Button
          kind="quiet"
          icon="chevron-back"
          onPress={() => setDate(addDays(date, -1))}
        >
          Previous
        </Button>
        <Txt style={{ fontWeight: "600" }}>{date}</Txt>
        <Button
          kind="quiet"
          icon="chevron-forward"
          onPress={() => setDate(addDays(date, 1))}
          disabled={date >= localDay(new Date(), p.timezone)}
        >
          Next
        </Button>
      </Row>
      <Row style={{ flexWrap: "wrap" }}>
        <Stat
          label="Energy logged"
          value={sum.energy.value?.toFixed(0) ?? "—"}
          unit="kcal"
          detail={
            p.energyTarget
              ? `Personal target ${p.energyTarget}`
              : "Choose a target in Settings"
          }
        />
        <Stat
          label="Protein"
          value={sum.protein.value?.toFixed(1) ?? "—"}
          unit="g"
          detail={`${Math.round(sum.protein.coverage * 100)}% composition coverage`}
        />
      </Row>
      <Choices
        options={["Diary", "Nutrients", "Foods"]}
        value={tab}
        onChange={setTab}
      />
      {a.error && <Notice text={a.error} error />}
      {tab === "Diary" && (
        <>
          <Row style={{ flexWrap: "wrap" }}>
            <Button icon="add" onPress={() => setFoodOpen(true)}>
              Log food
            </Button>
            <Button kind="secondary" onPress={() => setRecipe(true)}>
              Create recipe
            </Button>
          </Row>
          {entries.length === 0 && (
            <Empty
              title="A fresh page."
              detail="Search the offline USDA catalog or create your own food. Missing composition data stays unknown."
            />
          )}
          {(["Breakfast", "Lunch", "Dinner", "Snack"] as const).map((name) => {
            const rows = entries.filter((m) => m.meal === name);
            return rows.length ? (
              <Section key={name} title={name}>
                {rows.map((m) => (
                  <Card key={m.id}>
                    <Row style={{ justifyContent: "space-between" }}>
                      <Stack style={{ gap: 3, flex: 1 }}>
                        <Txt style={{ fontWeight: "600" }}>{m.foodName}</Txt>
                        <Txt variant="caption">
                          {m.grams} g ·{" "}
                          {m.nutrients.energy?.toFixed(0) ?? "Unknown"} kcal
                        </Txt>
                        <Txt variant="caption">{m.source}</Txt>
                      </Stack>
                      <Button
                        kind="quiet"
                        onPress={() =>
                          void a.run(() =>
                            commit([
                              { collection: "meals", id: m.id, value: null },
                            ]),
                          )
                        }
                      >
                        Remove
                      </Button>
                    </Row>
                  </Card>
                ))}
              </Section>
            ) : null;
          })}
          <Card>
            <Toggle
              label="Finished logging this day"
              value={check?.nutritionComplete ?? false}
              onChange={(v) =>
                void a.run(() => {
                  const id = check?.id ?? date;
                  return commit([
                    {
                      collection: "checkins",
                      id,
                      value: {
                        id,
                        date,
                        energy: check?.energy ?? 3,
                        soreness: check?.soreness ?? 1,
                        recovery: check?.recovery ?? 3,
                        notes: check?.notes ?? "",
                        nutritionComplete: v,
                      },
                    },
                  ]);
                })
              }
              detail="Only days you mark complete are used to assess repeated nutrient patterns."
            />
            <Txt variant="caption">
              A complete diary may still have missing nutrient composition.
              Coverage counts food entries with a known value, not the
              completeness of your overall diet.
            </Txt>
          </Card>
        </>
      )}
      {tab === "Nutrients" && (
        <>
          <Choices
            options={["Macros", "Vitamins", "Minerals"]}
            value={group}
            onChange={setGroup}
          />
          {(!p.age ||
            p.age < 19 ||
            p.age > 50 ||
            p.referenceSex === "unspecified" ||
            p.specialReferences) && (
            <Notice text="DRI comparisons need an age 19–50 reference group in Settings. Specialized nutrition needs require individually selected targets." />
          )}
          <Card>
            {nutrientKeys
              .filter((k) => nutrientInfo[k].group === group)
              .map((key) => {
                const info = nutrientInfo[key],
                  total = sum[key],
                  reference = refs[key];
                return (
                  <Pressable
                    key={key}
                    accessibilityRole="button"
                    accessibilityLabel={`${info.label}, ${total.value?.toFixed(1) ?? "unknown"} ${info.unit}; ${Math.round(total.coverage * 100)} percent composition coverage`}
                    onPress={() => setRef({ key, reference })}
                    style={{
                      gap: 6,
                      paddingVertical: 9,
                      borderBottomColor: t.line,
                      borderBottomWidth: 1,
                    }}
                  >
                    <Row style={{ justifyContent: "space-between" }}>
                      <Txt style={{ flex: 1 }}>{info.label}</Txt>
                      <Txt style={{ fontWeight: "600" }}>
                        {total.value?.toFixed(1) ?? "—"} {info.unit}
                      </Txt>
                    </Row>
                    <Progress value={total.value} target={reference?.amount} />
                    <Txt variant="caption">
                      {reference
                        ? `${reference.amount} ${info.unit} ${reference.type} · `
                        : ""}
                      {Math.round(total.coverage * 100)}% entry coverage ·{" "}
                      {nutrientStatus(total, reference)}
                    </Txt>
                  </Pressable>
                );
              })}
          </Card>
          <Txt variant="caption">
            Totals with incomplete composition are known subtotals. An AI is a
            planning reference; intake below it does not establish inadequacy.
            Upper limits apply to specific forms and are not intake goals.
          </Txt>
        </>
      )}
      {tab === "Foods" && (
        <>
          <Button onPress={() => setCustom(true)}>Create a food</Button>
          <Field
            label="Search your catalog"
            value={search}
            onChange={setSearch}
          />
          {d.foods
            .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
            .map((f) => (
              <Card key={f.id}>
                <Row>
                  <Stack style={{ flex: 1, gap: 4 }}>
                    <Txt style={{ fontWeight: "600" }}>{f.name}</Txt>
                    <Txt variant="caption">
                      {f.source} · {f.version}
                    </Txt>
                    <Txt variant="caption">
                      Per 100 g · {f.nutrients.energy?.toFixed(0) ?? "—"} kcal
                    </Txt>
                  </Stack>
                  <Button
                    kind="quiet"
                    onPress={() =>
                      void a.run(() =>
                        commit([
                          {
                            collection: "foods",
                            id: f.id,
                            value: { ...f, favorite: !f.favorite },
                          },
                        ]),
                      )
                    }
                  >
                    {f.favorite ? "Unfavorite" : "Favorite"}
                  </Button>
                </Row>
                <Button
                  kind="secondary"
                  onPress={() => {
                    setSelected(f);
                    setGrams(String(f.servingGrams));
                    setFoodOpen(true);
                  }}
                >
                  Log a portion
                </Button>
              </Card>
            ))}
        </>
      )}
      <Sheet
        title={selected ? "Choose your portion" : "Add food"}
        visible={foodOpen}
        onClose={() => {
          setFoodOpen(false);
          setSelected(null);
          setScanning(false);
        }}
      >
        {selected ? (
          <>
            <Txt variant="heading">{selected.name}</Txt>
            <Txt variant="caption">{selected.source} · values per 100 g</Txt>
            <Field
              label="Portion in grams"
              value={grams}
              onChange={setGrams}
              keyboard="decimal-pad"
            />
            <Choices
              label="Meal"
              options={["Breakfast", "Lunch", "Dinner", "Snack"] as const}
              value={meal}
              onChange={setMeal}
            />
            <Txt>
              {selected.nutrients.energy == null
                ? "Energy is unknown"
                : `${((selected.nutrients.energy * Number(grams || 0)) / 100).toFixed(0)} kcal`}{" "}
              · composition estimates
            </Txt>
            {a.error && <Notice text={a.error} error />}
            <Button disabled={a.busy} onPress={() => a.run(logFood)}>
              Add to {meal.toLowerCase()}
            </Button>
            <Button kind="quiet" onPress={() => setSelected(null)}>
              Back to foods
            </Button>
          </>
        ) : (
          <>
            <Field
              label="Find food or barcode"
              value={search}
              onChange={setSearch}
            />
            <Toggle
              label="Favorites only"
              value={onlyFavorites}
              onChange={setOnlyFavorites}
            />
            <Row>
              <Button
                kind="secondary"
                icon="barcode-outline"
                onPress={() => setScanning(true)}
              >
                Scan barcode
              </Button>
              <Button
                kind="quiet"
                onPress={() => {
                  setFoodOpen(false);
                  setCustom(true);
                }}
              >
                Create food
              </Button>
            </Row>
            {scanning && (
              <>
                <BarcodeScanner
                  onScan={(barcode) => {
                    setScanning(false);
                    setSearch(barcode);
                    const f = d.foods.find((f) => f.barcode === barcode);
                    if (f) {
                      setSelected(f);
                      setGrams(String(f.servingGrams));
                    } else
                      a.setError(
                        "This barcode is not in your offline catalog. Create a food using its label.",
                      );
                  }}
                />
                <Txt variant="caption">
                  Barcode lookup uses your saved catalog. No photos are
                  uploaded.
                </Txt>
              </>
            )}
            {a.error && <Notice text={a.error} error />}
            {filtered.slice(0, 60).map((f) => (
              <Pressable
                key={f.id}
                accessibilityRole="button"
                onPress={() => {
                  setSelected(f);
                  setGrams(String(f.servingGrams));
                }}
                style={{
                  padding: 14,
                  borderBottomWidth: 1,
                  borderBottomColor: t.line,
                }}
              >
                <Txt style={{ fontWeight: "600" }}>{f.name}</Txt>
                <Txt variant="caption">
                  {f.nutrients.energy ?? "—"} kcal / 100 g · {f.source}
                </Txt>
              </Pressable>
            ))}
            {!filtered.length && (
              <Txt>
                No saved foods match. Create an entry from the food label.
              </Txt>
            )}
          </>
        )}
      </Sheet>
      {custom && <FoodEditor onClose={() => setCustom(false)} />}
      {recipe && <RecipeEditor onClose={() => setRecipe(false)} />}
      <Sheet
        visible={!!ref}
        title={ref ? nutrientInfo[ref.key].label : "Reference"}
        onClose={() => setRef(null)}
      >
        {ref && (
          <>
            <Txt>
              Known subtotal: {sum[ref.key].value?.toFixed(2) ?? "unknown"}{" "}
              {nutrientInfo[ref.key].unit}
            </Txt>
            <Txt>
              {sum[ref.key].known} of {sum[ref.key].entries} food entries
              provide this nutrient.
            </Txt>
            {ref.reference ? (
              <>
                <Txt>
                  {ref.reference.type}: {ref.reference.amount}{" "}
                  {nutrientInfo[ref.key].unit}. {ref.reference.version}
                </Txt>
                {ref.reference.upper && (
                  <Txt>
                    Upper limit: {ref.reference.upper}{" "}
                    {nutrientInfo[ref.key].unit}; scope:{" "}
                    {ref.reference.upperScope}.{" "}
                    {ref.reference.upperScope !== "total"
                      ? "FORM cannot compare this limit without data separating the relevant nutrient forms."
                      : ""}
                  </Txt>
                )}
                <Button
                  kind="secondary"
                  onPress={() => {
                    if (ref.reference!.source.startsWith("https:"))
                      void Linking.openURL(ref.reference!.source);
                  }}
                >
                  Reference details
                </Button>
              </>
            ) : (
              <Txt>
                No reference selected. Values are available for logging.
              </Txt>
            )}
          </>
        )}
      </Sheet>
    </Screen>
  );
}

function FoodEditor({ onClose }: { onClose: () => void }) {
  const a = useAction();
  const [name, setName] = useState(""),
    [brand, setBrand] = useState(""),
    [barcode, setBarcode] = useState(""),
    [group, setGroup] = useState("Macros"),
    [values, setValues] = useState<Partial<Record<Nutrient, string>>>({});
  return (
    <Sheet visible title="Create food · per 100 g" onClose={onClose}>
      <Field label="Food name" value={name} onChange={setName} />
      <Field label="Brand (optional)" value={brand} onChange={setBrand} />
      <Field label="Barcode (optional)" value={barcode} onChange={setBarcode} />
      <Txt variant="caption">
        Convert label amounts to a 100 g basis. Leave unknown values blank;
        enter 0 only when the source reports zero.
      </Txt>
      <Choices
        options={["Macros", "Vitamins", "Minerals"]}
        value={group}
        onChange={setGroup}
      />
      {nutrientKeys
        .filter((k) => nutrientInfo[k].group === group)
        .map((k) => (
          <Field
            key={k}
            label={`${nutrientInfo[k].label} (${nutrientInfo[k].unit} / 100 g)`}
            value={values[k] ?? ""}
            onChange={(v) => setValues({ ...values, [k]: v })}
            keyboard="decimal-pad"
          />
        ))}
      {a.error && <Notice text={a.error} error />}
      <Button
        disabled={a.busy}
        onPress={() =>
          a.run(async () => {
            const nutrients: NutrientMap = {};
            for (const k of nutrientKeys) {
              const v = values[k];
              if (v?.trim()) {
                if (!Number.isFinite(Number(v)) || Number(v) < 0)
                  throw new Error(`Check ${nutrientInfo[k].label}.`);
                nutrients[k] = Number(v);
              }
            }
            const id = uid();
            const food = foodSchema.parse({
              id,
              name: name.trim(),
              brand,
              barcode: barcode || undefined,
              source: "User label entry",
              sourceUrl: "",
              version: new Date().toISOString().slice(0, 10),
              servingGrams: 100,
              servingLabel: "100 g",
              favorite: false,
              nutrients,
            });
            await commit([{ collection: "foods", id, value: food }]);
            onClose();
          })
        }
      >
        Save food
      </Button>
    </Sheet>
  );
}
function RecipeEditor({ onClose }: { onClose: () => void }) {
  const d = useData(),
    a = useAction();
  const [name, setName] = useState(""),
    [finished, setFinished] = useState(""),
    [items, setItems] = useState<Array<{ food: Food; grams: string }>>([]),
    [search, setSearch] = useState("");
  return (
    <Sheet visible title="Create recipe" onClose={onClose}>
      <Field label="Recipe name" value={name} onChange={setName} />
      <Field label="Find an ingredient" value={search} onChange={setSearch} />
      {d.foods
        .filter((f) => f.name.toLowerCase().includes(search.toLowerCase()))
        .slice(0, 8)
        .map((f) => (
          <Button
            key={f.id}
            kind="secondary"
            onPress={() => setItems([...items, { food: f, grams: "100" }])}
          >
            Add {f.name}
          </Button>
        ))}
      {items.map((item, i) => (
        <Card key={i}>
          <Txt>{item.food.name}</Txt>
          <Field
            label="Ingredient grams"
            value={item.grams}
            onChange={(grams) =>
              setItems(items.map((x, j) => (j === i ? { ...x, grams } : x)))
            }
            keyboard="decimal-pad"
          />
          <Button
            kind="quiet"
            onPress={() => setItems(items.filter((_, j) => j !== i))}
          >
            Remove ingredient
          </Button>
        </Card>
      ))}
      <Field
        label="Finished recipe weight (g)"
        value={finished}
        onChange={setFinished}
        keyboard="decimal-pad"
      />
      <Txt variant="caption">
        Use the cooked finished weight to account for water loss or gain.
        Nutrients remain unknown where any ingredient lacks composition data.
      </Txt>
      {a.error && <Notice text={a.error} error />}
      <Button
        disabled={a.busy}
        onPress={() =>
          a.run(async () => {
            const id = uid();
            const nutrients = recipeNutrients(
              items.map((i) => ({ food: i.food, grams: Number(i.grams) })),
              Number(finished),
            );
            const food = foodSchema.parse({
              id,
              name: name.trim(),
              brand: "",
              source: "User recipe · ingredient composition",
              sourceUrl: "",
              version: new Date().toISOString().slice(0, 10),
              servingGrams: 100,
              servingLabel: "100 g",
              favorite: true,
              nutrients,
            });
            await commit([{ collection: "foods", id, value: food }]);
            onClose();
          })
        }
      >
        Save recipe
      </Button>
    </Sheet>
  );
}
