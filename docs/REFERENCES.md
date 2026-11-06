# Reference sources and formulas

Reviewed November 5, 2026. This is a U.S.-reference wellness journal, not clinical decision support.

## Food composition

The twelve bundled entries were downloaded directly from the public USDA FoodData Central food-detail endpoint, using its public demonstration credential during development. No API credential is shipped. Source IDs, source URLs and publication dates are retained per food.

| FDC ID | Source description                                 |
| ------ | -------------------------------------------------- |
| 173944 | Bananas, raw                                       |
| 171287 | Egg, whole, raw, fresh                             |
| 171077 | Chicken breast, skinless, boneless, meat only, raw |
| 169910 | Mangos, raw                                        |
| 170379 | Broccoli, raw                                      |
| 171688 | Apples, raw, with skin                             |
| 170567 | Nuts, almonds                                      |
| 168917 | Quinoa, cooked                                     |
| 172421 | Lentils, cooked, boiled, without salt              |
| 171265 | Whole milk, 3.25% milkfat, with added vitamin D    |
| 169975 | Cabbage, raw                                       |
| 173424 | Egg, hard-boiled                                   |

- [USDA FoodData Central](https://fdc.nal.usda.gov/)
- [USDA API guide and download formats](https://fdc.nal.usda.gov/api-guide/)

`amount for portion = amount per 100 g × portion grams / 100`.

USDA nutrient IDs are mapped only with compatible units. `µg`, `μg` and `ug` normalize to micrograms; international units are not treated as micrograms. Vitamin A uses RAE, folate uses DFE, vitamin E uses alpha-tocopherol. ALA uses nutrient ID 1404; LA uses 1316. Undifferentiated 18:2 and MUFA 18:1 are not substitutes. Niacin equivalents require both niacin (1167) and tryptophan (1210): `NE mg = niacin mg + tryptophan g × 1000 / 60`. Without either input, NE remains unknown. USDA food water is grams of water, approximated as the same number of milliliters; this is distinct from logged drinking water.

## Dietary planning references

- [NIH Office of Dietary Supplements: DRI tables](https://ods.od.nih.gov/HealthInformation/nutrientrecommendations/)
- [NASEM adult vitamin table](https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t2/)
- [NASEM elements table, with 2019 sodium/potassium update](https://www.ncbi.nlm.nih.gov/books/NBK545442/table/appJ_tab3/)
- [Vitamin upper limits](https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t7/)
- [Element upper limits](https://www.ncbi.nlm.nih.gov/books/NBK56068/table/summarytables.t8/)
- [NIH niacin fact sheet and equivalents](https://ods.od.nih.gov/factsheets/Niacin-HealthProfessional/)

The source table group, reference kind (RDA or AI), unit, applicable upper limit/scope and source version are retained in the reference model. Male/female table selection is explicit and separate from gender identity. Magnesium switches at age 31. An AI is not a diagnostic threshold; an RDA is not an individual deficiency cutoff. This release does not implement EAR probability assessment.

Supplement-only limits (magnesium, niacin, folic acid and vitamin E) and preformed-vitamin-A limits are not compared against undifferentiated food totals. Total-intake limits can produce a review message even with incomplete composition, since the known subtotal is already above the limit. No percentage target is prescribed for nutrients without an applicable reference.

## Units and trends

- 1 lb = 0.45359237 kg; 1 in = 2.54 cm; 1 mile = 1.609344 km.
- 1 U.S. fluid ounce = 29.5735295625 ml; °F = °C × 1.8 + 32.
- Rolling averages use recorded days within the calendar window, with missing days excluded.
- A preferred source is selected per metric/day. Health Connect's priority-aware aggregate is the default for steps. Incompatible source totals are never added.
- External training volume = sum of completed repetitions × external resistance in kg. Timed and unweighted movement do not contribute invented load.
- Correlations use matched calendar dates, require at least seven pairs and variance in each series, and make no causal claim.

## General wellness and blood pressure

- [CDC adult activity guidance](https://www.cdc.gov/physical-activity-basics/guidelines/adults.html)
- [CDC sleep guidance](https://www.cdc.gov/sleep/about/)
- [American Heart Association: severe blood pressure and emergency symptoms](https://www.heart.org/en/health-topics/high-blood-pressure/understanding-blood-pressure-readings/when-to-call-911-for-high-blood-pressure)

The blood-pressure rule conservatively flags either systolic ≥180 or diastolic ≥120 mmHg, describes emergency symptoms requiring 911 in the U.S., and otherwise advises repeating after at least a minute and contacting a clinician promptly if it remains high. It is not a diagnosis and is intended for the general adult context; pregnancy-specific triage is not implemented. Historical readings are clearly timestamped. The app is not live monitoring.

## Android and Expo

- [Health Connect synchronization, changes and reconciliation](https://developer.android.com/health-and-fitness/health-connect/sync-data)
- [Samsung Health and Health Connect](https://developer.samsung.com/health/health-connect-faq.html)
- [React Native Health Connect installation](https://matinzd.github.io/react-native-health-connect/docs/get-started/)
- [Expo development builds](https://docs.expo.dev/workflow/customizing/)
- [Expo SQLite / SQLCipher](https://docs.expo.dev/versions/latest/sdk/sqlite/)
- [Expo BackgroundTask](https://docs.expo.dev/versions/latest/sdk/background-task/)
