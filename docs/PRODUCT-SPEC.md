# FORM

## The Personal Physique & Health Intelligence Platform

### Comprehensive Product Vision, Functional Specification & Development Roadmap

- **Version:** 1.0 — Master Plan
- **Primary platform:** Android
- **Secondary platform:** iOS
- **Product category:** Personal health, physique optimization, nutrition, fitness, and wellness
- **Development philosophy:** Local-first, privacy-focused, scientifically grounded, highly personalized

---

# 1. Executive Vision

## 1.1 The Ambition

FORM will be a comprehensive personal health and physique optimization platform designed to help individuals understand their bodies, develop their preferred physical appearance, and sustain excellent long-term health.

The application will bring together information that currently exists across multiple disconnected services:

- Samsung Health and Galaxy Watch measurements.
- Body weight, body composition, and physical measurements.
- Caloric intake, macronutrients, vitamins, and minerals.
- Cardiovascular fitness and daily physical activity.
- Resistance training and muscular development.
- Sleep, recovery, hydration, and energy.
- Blood pressure and other physiological measurements.
- Skin health, grooming, and appearance-related routines.
- Long-term behavioral trends and personal progress.

Instead of simply displaying information, FORM will explain what the information means, identify useful patterns, and help users make sustainable changes.

**The ultimate ambition is to create a personal body and health intelligence system: one place that understands a user's goals, their measurements, their habits, and their progress.**

FORM should eventually become sophisticated enough to answer questions such as:

- Is my training program helping me achieve my preferred physique?
- How has my body composition changed over the last six months?
- Am I obtaining enough protein, fiber, vitamins, and minerals?
- Which nutritional gaps consistently appear in my recorded diet?
- Am I getting enough activity and recovery?
- How are my sleep habits associated with my training performance?
- Are my cardiovascular measurements moving in a favorable direction?
- How should I adjust my routine while maintaining the appearance I want?
- What is the smallest meaningful change I could make this week?

## 1.2 Primary Physique Objective

The initial physique-planning experience will focus on individuals seeking a slim, youthful-looking, subtly athletic physique commonly associated with the _twink_ aesthetic.

The system should recognize that this aesthetic can take several forms:

**Slim Natural:** A slender silhouette with limited visible muscularity.

**Lean Defined:** A slender appearance combined with moderate muscle definition, especially around the abdomen, shoulders, back, and legs.

**Soft Athletic:** A relatively soft visual appearance combined with functional strength, good mobility, and subtle muscular development.

**Custom Physique:** The user selects individual goals for different body regions, with no requirement to conform to a predefined category.

The application will not treat a particular weight, body-fat percentage, waist size, or body shape as universally ideal.

The objective is to support the user's preferred appearance within healthy, sustainable boundaries, rather than encourage extreme leanness or excessive tracking.

---

# 2. Fundamental Product Principles

FORM's development should follow seven principles.

### 2.1 Comprehensive Data, Minimal Effort

The platform should capture as much useful information automatically as possible.

Measurements available from Samsung Health, Health Connect, or supported connected devices should not require repeated manual entry.

Manual logging should remain available for information that cannot be collected automatically.

### 2.2 Personalization Over Generic Advice

Every recommendation should account for the individual's goals, available measurements, activity level, preferences, and relevant health considerations.

A user maintaining an already-desired physique should receive different recommendations from someone beginning a resistance-training program.

### 2.3 Trends Over Individual Measurements

A single weight reading, resting heart rate, or night of poor sleep rarely provides enough information for meaningful conclusions.

FORM should emphasize longitudinal patterns and clearly distinguish normal fluctuations from potentially significant changes.

### 2.4 Scientific Transparency

Recommendations should explain their supporting evidence.

Nutrition reference values should come from established scientific sources, and calculations should display assumptions and uncertainty.

The system should never imply that an estimated value is a precise measurement.

### 2.5 Health Before Aesthetic Optimization

The app should protect adequate nutrition, recovery, strength, cardiovascular fitness, and general well-being.

Aesthetic preferences must not override clinically important safety considerations.

### 2.6 User Control and Privacy

Users should own their information, control access permissions, and be able to operate the application without mandatory cloud synchronization.

Progress photos and sensitive health information should remain private by default.

### 2.7 Premium Experience

FORM should feel like a refined, purpose-built health application.

The experience should be visually polished, responsive, consistent, and enjoyable enough to use for years.

It should be aspirational without becoming punitive, obsessive, or dependent on constant notifications.

---

# 3. Product Experience and Navigation

## 3.1 Core Navigation

The application will contain six major sections.

| Section      | Primary purpose                                     |
| ------------ | --------------------------------------------------- |
| Today        | Personalized dashboard and daily guidance           |
| Nutrition    | Food intake, nutrients, meal planning               |
| Training     | Exercise programming and performance                |
| Physique     | Body measurements, appearance goals, progress       |
| Health       | Sleep, cardiovascular metrics, medical measurements |
| Intelligence | Trend analysis, insights, planning, reports         |

Account settings, integrations, privacy controls, and personal preferences will be accessible through a profile screen.

## 3.2 The Today Dashboard

The Today screen will act as the command center.

Its primary components should include:

**Daily overview**

- Current date and selected personal objective.
- Latest recorded measurements.
- Synchronization status.
- Planned activities.
- Relevant reminders.

**Activity**

- Daily steps and walking distance.
- Moderate and vigorous activity minutes.
- Exercise sessions completed.
- Remaining planned activity.

**Nutrition**

- Logged energy intake.
- Protein, fats, carbohydrates, and fiber.
- Hydration.
- Nutrients requiring attention based on recent trends.

**Recovery**

- Last recorded sleep duration.
- Recent sleep consistency.
- Resting heart rate trend.
- Training recovery check-in.

**Physique**

- Weight trend, if enabled.
- Most recent body measurements.
- Current training phase.
- Progress toward self-selected objectives.

**Personal insights**

- One to three useful recommendations.
- Clear explanations.
- Links to supporting measurements.

The dashboard must be modular. Users should choose which metrics appear and their relative importance.

## 3.3 Daily Briefing

FORM should offer an optional morning briefing.

Example:

"Good morning. Your sleep duration was longer than your recent average, and you have a strength workout planned today. Your nutrition records suggest that fiber intake has been consistently below your selected reference target. A fiber-rich breakfast would be worth considering."

The system should explain that these observations are based on available recorded data.

No recommendation should be presented as a medical diagnosis.

## 3.4 Premium Visual Design

**Visual direction:** Minimalist, sophisticated, and information-rich.

Suggested design language:

- Warm white and charcoal surfaces.
- Deep graphite typography.
- Muted sage, slate blue, and soft lavender accents.
- Generous whitespace.
- Carefully organized data visualizations.
- Rounded cards with restrained shadows.
- Subtle animations and transitions.
- Full light- and dark-mode support.

Charts should favor clear trends rather than decorative graphics.

Users should be able to open any measurement and immediately understand its history, source, units, and interpretation.

---

# 4. Personalized Onboarding

## 4.1 Initial Profile

The onboarding system should collect only the information required to configure initial functionality.

**Basic profile**

- Age or birth date.
- Height.
- Current weight, if the user wishes to track it.
- Preferred measurement units.
- Relevant physiological information needed to select appropriate nutrient references.
- Time zone.

**Personal goals**

- Desired physique category.
- Areas of interest for muscle development.
- General activity goals.
- Whether weight change, body recomposition, or maintenance is preferred.
- Priority given to nutrition, strength, cardiovascular health, and appearance.

**Lifestyle**

- Typical activity level.
- Training experience.
- Available exercise equipment.
- Dietary preferences and restrictions.
- Typical sleep schedule.
- Time available for exercise.

**Health considerations**

- Optional relevant medical conditions.
- Physical limitations.
- Medications or treatments that affect exercise or nutrition, if the user chooses to provide them.
- Whether a healthcare professional has recommended specific limits or targets.

The user must be able to skip nonessential fields.

## 4.2 Device Connection Wizard

During onboarding, the application should ask whether the user wishes to connect external health data.

The Android experience should prioritize Samsung Health through Health Connect.

Connection steps:

1. Detect whether Health Connect is available.
2. Explain how Samsung Health shares information through Health Connect.
3. Guide the user through enabling Samsung Health synchronization.
4. Present FORM's requested read permissions.
5. Import available historical records within the authorized window.
6. Display a summary of successfully connected measurements.
7. Allow the user to disable individual data categories.

The application should not request access to unrelated health data.

## 4.3 Baseline Establishment

After setup, FORM will enter a baseline period.

During this period, it should learn typical patterns in:

- Daily steps.
- Sleep duration.
- Exercise frequency.
- Resting heart rate.
- Recorded nutrition.
- Weight trends, if enabled.

Initial observations may be available immediately, but personalized recommendations should become more confident as additional reliable measurements accumulate.

The interface should explain when there is insufficient data.

---

# 5. Samsung Health Integration

## 5.1 Strategic Importance

Samsung Health integration will be a foundational product feature.

For the Android version, FORM will integrate with **Android Health Connect**, allowing it to import supported health information synchronized from Samsung Health.

The intended data path:

**Galaxy Watch and compatible accessories → Samsung Health → Health Connect → FORM → Local database → Analysis engine**

Health Connect operates on the Android phone, not directly on the Galaxy Watch.

The watch sends information to Samsung Health, which shares supported records through Health Connect according to available permissions and synchronization behavior.

## 5.2 Supported Data Categories

The application should be architected to support these categories:

| Category         | Target measurements                                                    |
| ---------------- | ---------------------------------------------------------------------- |
| Daily movement   | Steps, walking distance, activity                                      |
| Cardiovascular   | Heart rate, resting heart rate where derivable                         |
| Exercise         | Session type, duration, distance, selected exercise measurements       |
| Sleep            | Sleep sessions, duration, available stages                             |
| Body composition | Weight, body fat, available body-composition fields                    |
| Nutrition        | Energy, nutrients, recorded meals where available                      |
| Hydration        | Water consumption                                                      |
| Vital signs      | Blood pressure, oxygen saturation, and other supported records         |
| Metabolic health | Blood glucose and related supported records                            |
| Additional       | Other Health Connect record types as justified by user-facing features |

**Important:** The presence of a Health Connect record type does not guarantee Samsung Health exports it, that a particular wearable measures it, or that the user has granted permission.

FORM should verify data availability and report unsupported categories explicitly.

## 5.3 Connection Management Screen

The integration page should show:

**Samsung Health via Health Connect**

- Connection status.
- Last successful import.
- Categories with active permissions.
- Categories with actual recorded data.
- Earliest and latest available measurement dates.
- Record counts.
- Synchronization errors.
- Manual refresh control.
- Permission management.
- Disconnect option.

Example:

| Category       | Permission  | Data status          |
| -------------- | ----------- | -------------------- |
| Steps          | Granted     | Records available    |
| Heart rate     | Granted     | Records available    |
| Sleep          | Granted     | Records available    |
| Blood pressure | Granted     | No records available |
| Nutrition      | Not granted | Disabled             |

This distinction is critical: permission granted does not mean data exists.

## 5.4 Automatic Synchronization

FORM should support several synchronization methods.

**Foreground synchronization**

Every time the application opens or returns to the foreground, it should check for updated health records.

**Background synchronization**

Where Android supports it and the user grants the additional permission, the application should schedule periodic background imports.

Android WorkManager should coordinate background processing rather than an unreliable JavaScript timer.

Background execution is subject to Android restrictions and should not be described as guaranteed real-time monitoring.

**Incremental synchronization**

FORM should use Health Connect's Changes API where appropriate.

The application should:

- Obtain a changes token for each independently synchronized data type.
- Store the token securely.
- Retrieve new, modified, and deleted records.
- Update corresponding local records.
- Save the replacement token after successful processing.
- Recover from expired tokens with a controlled historical reconciliation.

**Historical import**

Health Connect generally restricts reading other apps' historical data to 30 days before the initial permission grant unless additional history permission is granted.

FORM should offer an optional extended-history request when supported.

It must never promise access to records that Samsung Health has not synchronized.

## 5.5 Avoiding Duplicate Measurements

Duplicate records are a major integration risk.

A phone, Galaxy Watch, and other applications may record overlapping activity.

For cumulative measurements such as daily step counts, FORM should prefer Health Connect's aggregate APIs, which account for supported source-priority and duplicate-handling behavior.

For other measurements, FORM should retain source identifiers and avoid blindly combining overlapping observations.

Every imported record should preserve:

- External record identifier.
- Originating application.
- Available device metadata.
- Start and end timestamps or measurement timestamp.
- Original unit.
- Normalized value.
- Measurement type.
- Last modification time.
- Import timestamp.

The import mechanism should be idempotent: importing the same data twice must not duplicate it.

## 5.6 Source Preferences

Users should be able to configure preferred measurement sources where useful.

For example:

- Samsung Health as the preferred source for sleep.
- An upper-arm monitor as the preferred source for blood pressure.
- A connected smart scale as the preferred source for weight.
- Manual entries for body circumference measurements.

Source preference should be separate from data quality. Device-specific accuracy should not be assumed without evidence.

## 5.7 Samsung Health Direct SDK — Future Expansion

FORM should preserve the ability to add Samsung's direct Health Data SDK later.

This could be useful for selected Samsung-specific fields such as Energy Score or other measurements not adequately represented through Health Connect.

However, direct SDK access should not become a dependency for the initial release.

Samsung requires partnership approval for publicly distributing apps using its direct Data SDK.

A separate experimental adapter should be developed only after identifying a concrete feature that justifies the extra work and approval requirements.

## 5.8 Read Versus Write Behavior

The initial release should read imported health information without automatically writing duplicate records back to Health Connect.

Future two-way synchronization may allow FORM-generated workouts, nutrition entries, and body measurements to be shared with supported apps.

Any write functionality must be opt-in and include safeguards against synchronization loops and conflicting edits.

---

# 6. Physique Development System

## 6.1 Objective

Create a highly personalized body-composition and appearance-planning experience that supports the user's aesthetic preferences while preserving functional strength and good health.

## 6.2 Measurement Catalog

| Measurement            | Collection method      | Suggested cadence            |
| ---------------------- | ---------------------- | ---------------------------- |
| Body weight            | Smart scale or manual  | Optional daily or weekly     |
| Height                 | Manual                 | Onboarding, update as needed |
| Waist                  | Measuring tape         | Every 2–4 weeks              |
| Hips                   | Measuring tape         | Every 2–4 weeks              |
| Chest                  | Measuring tape         | Monthly                      |
| Shoulder circumference | Measuring tape         | Monthly                      |
| Upper arms             | Measuring tape         | Monthly                      |
| Thighs                 | Measuring tape         | Monthly                      |
| Calves                 | Measuring tape         | Monthly                      |
| Neck                   | Measuring tape         | Optional                     |
| Body fat estimate      | Compatible device      | Optional monthly             |
| Muscle-mass estimate   | Compatible device      | Optional monthly             |
| Progress photographs   | Camera                 | Optional monthly             |
| Strength and endurance | Exercise records       | During workouts              |
| Mobility               | Functional assessments | Every 4–8 weeks              |

Smart-scale body-fat and muscle-mass estimates should be labeled as method-dependent approximations.

## 6.3 Physique Planning

Users will select which characteristics they want to emphasize.

Examples include:

- Maintaining a slender overall silhouette.
- Developing subtle abdominal definition.
- Improving glute or leg development.
- Strengthening the back and improving posture.
- Building modest shoulder definition.
- Improving mobility and flexibility.
- Maintaining their current proportions.

FORM should generate a coordinated training and nutrition plan supporting the selected priorities.

The system must not produce an arbitrary "perfect weight" or assign a numerical attractiveness score.

## 6.4 Progress Analytics

The physique dashboard should visualize:

- Rolling body-weight averages.
- Circumference measurements.
- Strength progression.
- Estimated body-composition changes.
- Comparison photographs.
- Goal adherence over time.

Progress photographs should support consistent framing, lighting instructions, side-by-side comparisons, and private storage.

Computer-vision body analysis may become an optional future feature but must clearly disclose uncertainty and avoid making unsupported claims about body fat or health.

---

# 7. Nutrition Intelligence Engine

## 7.1 Vision

FORM's nutrition system should become one of its most sophisticated features.

It will track not only calories and macronutrients, but also comprehensive micronutrient intake, nutrient adequacy, dietary patterns, and nutritional consistency.

The system should identify what a recorded diet provides, what remains uncertain, and what may be worth improving.

## 7.2 Macronutrients

Track:

- Energy intake.
- Protein.
- Total carbohydrates.
- Dietary fiber.
- Total sugars.
- Added sugars where known.
- Total fat.
- Saturated fat.
- Monounsaturated fat.
- Polyunsaturated fat.
- Omega-3 and omega-6 fatty acids where known.
- Dietary cholesterol.
- Water.
- Alcohol, if applicable.
- Caffeine.

Each nutrient will have a history, data-coverage indicator, and relevant target or reference range.

## 7.3 Vitamins

Track all 13 essential vitamins:

- Vitamin A.
- Vitamin C.
- Vitamin D.
- Vitamin E.
- Vitamin K.
- Thiamin (B1).
- Riboflavin (B2).
- Niacin (B3).
- Pantothenic acid (B5).
- Vitamin B6.
- Biotin (B7).
- Folate (B9).
- Vitamin B12.

Where food composition data supports it, provide more detailed forms such as folate equivalents or vitamin A activity equivalents.

## 7.4 Minerals and Additional Nutrients

Track:

- Calcium.
- Iron.
- Magnesium.
- Phosphorus.
- Potassium.
- Sodium.
- Chloride.
- Zinc.
- Copper.
- Manganese.
- Selenium.
- Iodine.
- Chromium.
- Molybdenum.
- Choline.
- Additional nutritionally relevant compounds when reliable data is available.

The system should distinguish essential nutrients with established reference values from compounds that lack comparable intake recommendations.

## 7.5 Nutrient Reference Model

FORM should use established Dietary Reference Intakes rather than universal percentage-based goals.

For each nutrient, store applicable values including:

- Estimated Average Requirement (EAR).
- Recommended Dietary Allowance (RDA).
- Adequate Intake (AI).
- Tolerable Upper Intake Level (UL).
- Other applicable guidance where available.

Values should be selected according to relevant age and physiological criteria.

The system should distinguish between:

**Adequacy planning:** Choosing intake patterns likely to meet nutritional requirements.

**Possible inadequacy:** Identifying repeated recorded intakes that may warrant attention.

**Excess intake:** Identifying circumstances in which a nutrient's applicable upper limit could be exceeded.

**Unknown:** Acknowledging missing nutrient composition data or insufficient logging.

An AI or another computational model should not invent reference values.

## 7.6 Nutritional Data Sources

**Primary source:** USDA FoodData Central.

The system should support:

- Foundation Foods.
- Survey foods.
- Branded foods.
- Relevant legacy data.
- User-created food entries.

Every food entry should retain its nutritional source, data version, serving unit, and nutrient availability.

FoodData Central supports downloadable datasets and an API.

For an offline-capable experience, FORM should ship a curated local food catalog and update it periodically.

The USDA API can supplement the local catalog.

The API key should not be embedded directly in a distributed client application.

## 7.7 Food Logging Experience

Users should be able to log meals using:

- Food search.
- Barcode scanning.
- Saved favorites.
- Recent foods.
- Recipes.
- Meal templates.
- Manual nutrition entry.
- Portion selection.
- Optional image-assisted food identification in a later phase.

The initial system should not depend on a paid AI API.

Food photographs may eventually provide suggested items or portion estimates, but users should confirm entries before they affect nutrition totals.

## 7.8 Nutritional Analysis

FORM should analyze nutrition at multiple timescales.

**Daily:** Energy, protein, fiber, hydration, and selected important nutrients.

**Weekly:** Average nutrient intake, dietary variety, repeated gaps, and data completeness.

**Monthly:** Long-term nutritional consistency, changing habits, and progress toward selected goals.

For each finding, the system should explain whether the evidence is strong, limited, or incomplete.

Example insight:

"Across 11 sufficiently logged days, your estimated calcium intake was frequently below the selected planning reference. Consider adding a calcium-rich food you enjoy."

The application should prioritize food-based suggestions and should not automatically prescribe supplements.

## 7.9 Adaptive Energy Planning

FORM may estimate an initial energy requirement using an accepted predictive equation and available demographic and activity inputs.

This value should be labeled as an estimate.

Over time, the system may compare recorded intake with body-weight trends to refine the estimate, accounting for incomplete logging and fluctuations.

Users should be able to choose maintenance or a clinically appropriate body-composition goal.

The app should avoid aggressive deficits, punitive calorie alerts, and rigid weight-loss targets.

Adequate energy intake must remain a foundational requirement.

---

# 8. Training and Movement

## 8.1 Training Philosophy

FORM should provide evidence-informed programming that supports the selected physique while developing sustainable physical fitness.

The exercise system will prioritize:

- Muscular strength and endurance.
- Cardiovascular conditioning.
- Mobility and flexibility.
- Posture.
- Appropriate recovery.
- Consistent activity.

## 8.2 Exercise Library

The application should include a searchable exercise catalog with:

- Exercise name.
- Primary and secondary muscle groups.
- Required equipment.
- Difficulty.
- Instructions.
- Movement alternatives.
- Safety considerations.
- Optional demonstration media.

Exercises should support body weight, resistance bands, dumbbells, machines, barbells, and other common equipment.

## 8.3 Workout Planning

Users should be able to create or generate:

- Full-body routines.
- Upper/lower routines.
- Home workout plans.
- Gym workout plans.
- Mobility sessions.
- Cardio sessions.
- Custom weekly schedules.

The adaptive planner should account for:

- Available training days.
- Session duration.
- Equipment.
- Training experience.
- Recent activity.
- User-reported soreness and fatigue.
- Physique priorities.

## 8.4 Workout Logging

Record:

- Exercise performed.
- Sets.
- Repetitions.
- Resistance.
- Duration.
- Distance.
- Perceived exertion.
- Rest intervals.
- Optional notes.

The application should display previous performance and recommend reasonable progression when the data supports it.

## 8.5 Movement Goals

FORM will import daily activity measurements through Health Connect.

Step recommendations should be personalized according to baseline activity and accessibility.

The app should also track the CDC's general adult activity guidance: at least 150 minutes of moderate activity weekly and muscle-strengthening activity on at least two days.

These are baseline public-health recommendations, not universal maximums or individualized exercise prescriptions.

## 8.6 Adaptive Recovery

FORM should offer lighter sessions or rest-day alternatives when the user reports significant fatigue, soreness, or insufficient recovery.

Wearable-derived recovery estimates should be treated as imperfect indicators.

No single readiness metric should automatically prohibit or demand a workout.

---

# 9. Cardiovascular and General Health

## 9.1 Cardiovascular Dashboard

Track available measurements including:

- Resting heart rate.
- Exercise heart rate.
- Heart-rate trends.
- Heart-rate recovery, where calculable.
- Available heart-rate variability measures.
- Estimated cardiorespiratory fitness.
- Blood pressure.
- Relevant exercise duration and intensity.

Each metric should have a dedicated history view.

## 9.2 Blood Pressure

Provide a specialized blood-pressure module with:

- Systolic reading.
- Diastolic reading.
- Pulse, when available.
- Measurement time.
- Device and measurement source.
- Relevant circumstances.
- Optional notes.
- Historical comparisons.
- Exportable summaries.

FORM should encourage use of a validated upper-arm cuff for home blood-pressure monitoring.

Blood pressure should be interpreted using appropriate clinical guidance rather than aesthetic optimization rules.

## 9.3 Other Health Measurements

The extensible measurement system should support:

- Oxygen saturation.
- Blood glucose.
- Body temperature.
- Relevant laboratory measurements.
- Cholesterol.
- HbA1c.
- Other clinically meaningful measurements.

These features should be optional.

Laboratory testing should not be recommended indiscriminately simply to fill dashboard fields.

## 9.4 Health Alerts

The application may identify potentially concerning readings based on properly validated rules.

However, it must distinguish among:

- General wellness guidance.
- A measurement worth repeating.
- A reason to contact a healthcare professional.
- A potentially urgent symptom or measurement.

FORM must not diagnose illness or automatically adjust medications.

Medical alerts and safety guidance should not depend on a generative AI model alone.

---

# 10. Sleep and Recovery Intelligence

## 10.1 Sleep Tracking

Import sleep information from Samsung Health through Health Connect when available.

Track:

- Total sleep duration.
- Sleep start and end times.
- Sleep schedule consistency.
- Time awake during the night.
- Sleep stages, where available.
- Sleep-related trends.

Wearable sleep-stage measurements should be clearly described as estimates.

## 10.2 Sleep Planning

Users should set preferred sleep and wake windows.

FORM could recommend consistent timing and practical sleep habits based on observed patterns.

For most adults ages 18–60, the CDC recommends at least seven hours of sleep.

The application should avoid assigning false precision to a single sleep score.

## 10.3 Recovery Analysis

Recovery insights may combine:

- Recent training load.
- Sleep history.
- Resting heart-rate trends.
- Perceived fatigue.
- Muscle soreness.
- Recent activity.

These inputs should inform training adjustments without making unsupported medical conclusions.

---

# 11. Appearance and Personal Care

## 11.1 Objective

The appearance system will help users manage routines that matter to their personal aesthetic.

It should be optional and independent from medical or physical-fitness assessments.

## 11.2 Skin Tracking

Possible features:

- Morning and evening skincare routines.
- Product inventory.
- Sunscreen use.
- Irritation and sensitivity logs.
- Skin dryness and blemish observations.
- Optional standardized photographs.
- Routine adherence.

## 11.3 Grooming and Body Care

Potential features include:

- Haircare routines.
- Facial hair and body hair maintenance.
- Grooming reminders.
- Product replacement schedules.
- Notes on product compatibility.

## 11.4 Posture and Mobility

An additional section could track:

- Mobility exercises.
- Stretching.
- Functional movement.
- Posture-related comfort.
- Range-of-motion assessments.

Future camera-assisted movement analysis may provide feedback, but should not claim medical-grade accuracy without validation.

---

# 12. Personal Intelligence Engine

## 12.1 Vision

The intelligence system will transform FORM from a collection of trackers into an adaptive personal planning platform.

It should learn from longitudinal measurements while remaining transparent about limitations.

## 12.2 Three-Layer Architecture

### Layer One: Deterministic Calculations

Use testable, conventional calculations for:

- Nutrient totals.
- Reference-range comparisons.
- Rolling averages.
- Training volume.
- Activity totals.
- Weight trends.
- Sleep duration.
- Measurement changes.

This layer must not rely on a language model.

### Layer Two: Pattern Detection

Use statistical analysis to identify:

- Repeated nutrition gaps.
- Long-term physical-activity changes.
- Changes in training performance.
- Consistent sleep patterns.
- Measurement trends.
- Data gaps and unreliable observations.

Initially, this can be implemented using conventional statistical methods.

More sophisticated predictive models may be added after enough validated data exists.

### Layer Three: Personalized Coaching

The coaching engine translates validated findings into understandable recommendations.

Every recommendation should include:

- The observation.
- The data period.
- Supporting measurements.
- Relevant uncertainty.
- The proposed action.
- Why the action may be useful.
- An option to accept, modify, or dismiss it.

## 12.3 Example Recommendation

**Observation:** Recorded training performance has improved while body weight has remained relatively stable.

**Interpretation:** This pattern may be consistent with strength improvement or body recomposition, but it is not sufficient to prove a specific body-composition change.

**Recommendation:** Continue the current training plan if it remains comfortable and aligned with your goals.

**Supporting evidence:** Recent weight trend and resistance-training history.

## 12.4 Personal Health Assistant

An optional conversational interface could let users ask:

- "How has my sleep changed this month?"
- "Which vitamins am I consistently missing?"
- "Show the relationship between activity and resting heart rate."
- "How has my waist measurement changed since I started?"
- "Help me plan meals that better meet my nutrition targets."
- "Can I make my training routine more manageable?"

The assistant should retrieve relevant measurements from a controlled data layer.

It must not invent measurements, food entries, medical interpretations, or sources.

The core application must function without a paid language-model service.

## 12.5 Decision Support, Not a Universal Health Score

FORM should avoid reducing health into one universal number.

Instead, the system should provide domain-specific summaries for:

- Nutritional coverage.
- Activity.
- Training progression.
- Recovery.
- Cardiovascular measurements.
- Physique goals.

Clinical observations should remain distinct from aesthetic preferences.

A user should be able to achieve an appearance objective without the software implying that this changes their medical health status.

---

# 13. Longitudinal Analytics

## 13.1 Time Horizons

Every major metric should support:

- Daily views.
- Weekly views.
- Monthly views.
- Quarterly views.
- Annual views.
- Custom date ranges.

## 13.2 Comparison Tools

The intelligence dashboard should allow users to compare:

- Weight against training performance.
- Training volume against recovery.
- Sleep duration against perceived energy.
- Activity levels against resting heart rate.
- Nutrient intake across different periods.
- Body measurements against selected goals.

All comparisons must explain that correlation does not necessarily establish causation.

## 13.3 Reports

FORM should generate:

**Weekly Review**

- Significant changes.
- Training completion.
- Activity summary.
- Nutrition coverage.
- Sleep trends.
- Suggested priorities.

**Monthly Physique Review**

- Measurement changes.
- Optional photographs.
- Training progression.
- Goal revisions.

**Quarterly Health Review**

- Cardiovascular measurement trends.
- Long-term activity consistency.
- Nutritional patterns.
- Recovery patterns.
- Data quality assessment.

Reports should be exportable as PDF and machine-readable data.

---

# 14. Technical Architecture

## 14.1 Recommended Stack

| Layer                      | Technology                          |
| -------------------------- | ----------------------------------- |
| Mobile application         | React Native                        |
| Language                   | TypeScript                          |
| App framework              | Expo with native development builds |
| Navigation                 | Expo Router                         |
| Local persistence          | SQLite                              |
| Secure key storage         | Platform secure storage             |
| Android health integration | Health Connect                      |
| Optional Samsung extension | Samsung Health Data SDK             |
| iOS health integration     | HealthKit                           |
| Nutrition composition      | USDA FoodData Central               |
| Background jobs            | Android WorkManager                 |
| Visualization              | React Native charting library       |
| State management           | Zustand or equivalent               |
| Data validation            | Zod or equivalent                   |
| Remote synchronization     | Optional backend, introduced later  |

The first version should not require an account or mandatory cloud services.

## 14.2 Application Architecture

Divide the application into independent modules:

**Presentation layer**

Screens, interactive components, design system, charts, and navigation.

**Domain layer**

Business rules for health measurements, nutrition, training, goals, and recommendations.

**Data layer**

SQLite repositories, import adapters, validation, and historical queries.

**Integration layer**

Health Connect, HealthKit, food databases, barcode services, and optional cloud synchronization.

**Intelligence layer**

Trend computation, recommendation rules, uncertainty handling, and optional AI features.

The application should use typed interfaces between these modules.

## 14.3 Native Integration

React Native Health Connect functionality requires a native Android bridge.

The project should use a supported Health Connect library or an internally maintained Kotlin module.

The native implementation should handle:

- SDK availability.
- Permission requests.
- Feature availability.
- Record reads.
- Aggregate queries.
- Incremental synchronization.
- Historical reads.
- Background execution.

A standard Expo Go session is insufficient for custom native Health Connect functionality.

Use a development build and maintain compatibility with the selected Expo SDK version.

## 14.4 Data Ownership

**SQLite should be the primary local datastore.**

The application should retain user-created records locally and import authorized external measurements.

Health Connect should remain an external source, not the only place where FORM's own data exists.

Optional cloud synchronization should come later.

---

# 15. Core Database Design

## 15.1 User and Configuration

**users**

- id
- created_at
- preferred_units
- timezone
- onboarding_status

**user_profiles**

- user_id
- date_of_birth or age category
- height
- relevant reference-profile fields
- activity preferences

**goals**

- id
- user_id
- category
- desired_outcome
- target_type
- target_value, if appropriate
- start_date
- review_date
- active_status

## 15.2 Measurements

**measurements**

- id
- user_id
- metric_type
- value
- canonical_unit
- recorded_at
- start_at
- end_at
- source_id
- external_record_id
- quality_status
- imported_at
- updated_at

**data_sources**

- id
- provider
- device_type
- external_identifier
- integration_version
- last_sync_at

**sync_states**

- id
- source_id
- data_type
- changes_token
- last_successful_sync_at
- last_attempt_at
- error_status

## 15.3 Nutrition

**foods**

- id
- source
- external_food_id
- name
- brand
- serving_information
- database_version

**nutrients**

- id
- canonical_name
- unit
- reference_identifier

**food_nutrients**

- food_id
- nutrient_id
- amount_per_reference_quantity
- known_status
- source_quality

**meal_entries**

- id
- user_id
- meal_type
- timestamp
- food_id
- quantity
- serving_unit

**nutrient_references**

- nutrient_id
- demographic_reference_group
- reference_type
- amount
- unit
- source
- source_version

## 15.4 Training

**exercises**

- id
- name
- movement_category
- target_muscle_groups
- equipment
- instructions

**workout_sessions**

- id
- user_id
- started_at
- completed_at
- workout_type
- perceived_effort
- notes

**exercise_sets**

- id
- workout_session_id
- exercise_id
- repetitions
- resistance
- duration
- distance
- effort
- sequence

## 15.5 Insights and Personal Care

**recommendations**

- id
- user_id
- category
- recommendation_text
- evidence_reference
- confidence_level
- generated_at
- status

**daily_checkins**

- id
- user_id
- date
- energy
- soreness
- perceived_recovery
- notes

**progress_photos**

- id
- user_id
- encrypted_local_reference
- captured_at
- comparison_category

Separate tables should be added for blood-pressure measurement context, recipes, skincare routines, device permissions, and data retention.

## 15.6 Data Integrity Rules

- Use stable unique identifiers.
- Normalize units before calculations.
- Preserve original values and measurement sources.
- Distinguish a missing value from a recorded zero.
- Preserve relevant time zones.
- Support updates and deletions from external systems.
- Prevent duplicate imports.
- Version scientific reference tables.
- Document derived measurements and their formulas.
- Allow manual corrections without silently rewriting source records.

---

# 16. Privacy and Security

## 16.1 Default Operating Model

FORM should operate locally by default.

Users should not need a cloud account to use its primary features.

## 16.2 Security Controls

Implement:

- Encryption for sensitive local records where supported by the selected storage implementation.
- Encrypted progress-photo storage.
- Android Keystore and iOS Keychain for cryptographic secrets.
- Optional biometric app locking.
- Minimal permissions.
- Explicit permission revocation handling.
- Secure export and import.
- Optional encrypted backups.
- Dependency and vulnerability scanning.
- No health data in analytics or crash logs.
- No advertising-based health-data monetization.

## 16.3 Data Transparency

The user should be able to see:

- Which external apps are connected.
- What information each connection provides.
- When each category was last updated.
- Which records are stored locally.
- Which records are backed up.
- Whether any data has been transmitted externally.

## 16.4 Data Deletion

Support both selective and complete deletion.

Users should be able to remove imported records, progress photos, meal history, or the entire FORM dataset.

Deleting FORM's imported copy should not silently erase Samsung Health's original information.

If write synchronization is eventually implemented, the relationship between local deletion and external deletion must be clearly defined.

## 16.5 Public Distribution

Before public release, review applicable privacy regulations, health-data handling obligations, and platform policies.

Google Play requires specific Health Connect permissions declarations and explanations of the associated features.

The project should not assume that every wellness application is automatically subject to the same regulatory obligations as a healthcare provider.

---

# 17. Offline-First Design

FORM's essential functionality must work without internet connectivity.

Offline features should include:

- Viewing locally stored measurements.
- Manual logging.
- Saved food searches.
- Recording meals and workouts.
- Viewing historical trends.
- Computing nutrient totals.
- Viewing saved recommendations.
- Managing personal goals.

Internet connectivity may be required for retrieving new food records, downloading updates, or optional cloud services.

Health Connect itself is a local Android data-sharing system; import availability still depends on Samsung Health having synchronized relevant information.

The application should queue appropriate tasks and recover gracefully when connectivity returns.

---

# 18. Notifications and Routine Automation

## 18.1 Daily Notifications

Optional reminders could include:

- Planned workout.
- Meal logging.
- Hydration check-in.
- Sleep routine.
- Measurement reminders.
- Data synchronization problems.

The system should avoid excessive notifications.

## 18.2 Weekly Review

At a user-selected time, FORM could generate a review of the previous week.

This review should summarize relevant trends and offer a small number of practical priorities.

## 18.3 Monthly Review

A monthly report should provide a more comprehensive assessment of:

- Fitness progression.
- Nutrition consistency.
- Body measurements.
- Activity.
- Recovery.
- Relevant health data.

The review should recognize maintenance and consistency as successful outcomes.

---

# 19. Development Roadmap

## Phase 0 — Product Foundation

**Objective:** Establish a technically stable, visually coherent application.

Deliverables:

- React Native/Expo project.
- Design system.
- Navigation.
- Onboarding.
- Goal configuration.
- Local SQLite database.
- Secure storage.
- Measurement normalization.
- Manual data entry.
- Initial dashboard.
- Data export.

**Completion requirement:** A user can install the application, establish a profile, record measurements, and retain data between sessions without internet access.

## Phase 1 — Samsung Health and Health Connect

**Objective:** Make automated data collection a defining product capability.

Deliverables:

- Native Health Connect integration.
- Connection wizard.
- Permission management.
- Steps import.
- Heart-rate import.
- Sleep import.
- Exercise-session import.
- Weight import.
- Additional supported metrics.
- Background synchronization where permitted.
- Incremental change processing.
- Data-source attribution.
- Duplicate prevention.
- Synchronization diagnostics.

**Completion requirement:** A supported Galaxy Watch measurement can move through Samsung Health and Health Connect into FORM without manual re-entry.

## Phase 2 — Complete Nutrition

**Objective:** Establish the nutrition intelligence platform.

Deliverables:

- USDA food database integration.
- Curated offline food catalog.
- Barcode scanning.
- Food search.
- Serving management.
- Meal logging.
- Recipes.
- Macronutrient analysis.
- Comprehensive micronutrient analysis.
- Dietary reference tables.
- Nutrient completeness reporting.
- Weekly nutrition insights.

**Completion requirement:** Users can log meals, view supported nutrients, and receive accurate reference-based summaries that distinguish missing information from actual low intake.

## Phase 3 — Physique and Training

**Objective:** Build personalized aesthetic and fitness planning.

Deliverables:

- Physique profiles.
- Measurement tracking.
- Progress photographs.
- Exercise library.
- Workout templates.
- Custom workout plans.
- Training logs.
- Progression analysis.
- Movement goals.
- Mobility features.
- Recovery check-ins.

**Completion requirement:** A user can establish an appearance objective, follow a training program, record progress, and review meaningful trends.

## Phase 4 — Health and Recovery

**Objective:** Unify essential wellness and physiological tracking.

Deliverables:

- Blood-pressure module.
- Cardiovascular dashboards.
- Sleep analytics.
- Hydration tracking.
- Recovery analytics.
- Manual vital-sign entry.
- Optional lab-record support.
- Health-history exports.
- Measurement-source confidence indicators.

**Completion requirement:** Supported physiological measurements can be displayed and interpreted within clearly defined informational and clinical safety boundaries.

## Phase 5 — Personal Intelligence

**Objective:** Turn raw data into explainable guidance.

Deliverables:

- Rule-based insight engine.
- Longitudinal statistical analysis.
- Cross-domain comparisons.
- Goal adaptation.
- Automated weekly reviews.
- Monthly progress reports.
- Optional conversational assistant.
- Source-grounded recommendation explanations.
- User feedback on recommendation usefulness.

**Completion requirement:** Recommendations are generated from validated records, reference their evidence, acknowledge uncertainty, and can be dismissed or adjusted.

## Phase 6 — Advanced Platform

**Objective:** Mature FORM into a premium personal health ecosystem.

Potential deliverables:

- iOS HealthKit integration.
- Optional encrypted cross-device synchronization.
- Enhanced nutritional planning.
- Expanded wearables.
- Optional laboratory interoperability.
- Advanced personal trend modeling.
- Improved workout periodization.
- Wear OS companion experiences.
- Optional Samsung-specific SDK features.
- More sophisticated privacy-preserving coaching.

The sixth phase should be driven by validated user needs rather than feature count alone.

---

# 20. Engineering Quality and Testing

## 20.1 Unit Tests

Test:

- Unit conversions.
- Nutrition calculations.
- Serving calculations.
- Nutrient reference selection.
- Rolling averages.
- Measurement normalization.
- Training-volume calculations.
- Data-quality indicators.

## 20.2 Integration Tests

Test:

- Health Connect permissions.
- Permission revocation.
- Initial imports.
- Incremental imports.
- Record modifications.
- Record deletions.
- Duplicate measurements.
- Missing measurements.
- Offline operation.
- Import interruption.
- Expired synchronization tokens.

## 20.3 Device Testing

Use actual Samsung hardware to verify the complete connection.

Tests should include:

- Galaxy Watch recording.
- Samsung Health synchronization.
- Health Connect availability.
- FORM permissions.
- Successful data import.
- App reopening.
- Background restrictions.
- Reboot behavior.
- Battery-saving modes.

The final application must not depend solely on emulator results.

## 20.4 Nutrition Validation

Test food composition against authoritative source records.

Verify:

- Nutrient units.
- Serving conversions.
- Recipe calculations.
- Reference ranges.
- Missing values.
- Upper-limit logic.
- Duplicate ingredients.
- Food database updates.

## 20.5 Accessibility

Support:

- Screen readers.
- Dynamic text sizes.
- High-contrast interfaces.
- Reduced-motion preferences.
- Accessible charts.
- Clear error states.
- Flexible measurement units.

---

# 21. Product Acceptance Criteria

A successful first public release should meet the following standards.

| Requirement         | Acceptance criterion                                    |
| ------------------- | ------------------------------------------------------- |
| Core experience     | Primary features work offline                           |
| Samsung integration | Authorized supported data imports successfully          |
| Data integrity      | Repeated imports do not duplicate records               |
| Transparency        | Every important imported metric identifies its source   |
| Nutrition           | Missing nutrient data is never silently treated as zero |
| Calculations        | Core algorithms pass deterministic reference tests      |
| Privacy             | Sensitive records are protected and exportable          |
| Permissions         | Revoked permissions are respected immediately           |
| Reliability         | Interrupted imports can recover without corrupting data |
| Usability           | Main daily tasks require minimal navigation             |
| Goal planning       | User preferences can be changed without losing history  |
| Reporting           | Users can review and export historical trends           |
| Health safety       | The app does not diagnose or prescribe treatments       |

These criteria should be verified before adding speculative advanced features.

---

# 22. Long-Term Aspirational Features

## 22.1 A Personal Physiological Model

Over time, FORM could develop a continuously updated representation of the user's recorded fitness, nutrition, body measurements, and recovery patterns.

It would not be a literal medical-grade digital twin.

Instead, it would provide transparent forecasts and scenario comparisons based on the user's data.

Examples:

- How might a different weekly training schedule affect projected exercise volume?
- What changes to my current meal plan would improve recorded micronutrient coverage?
- How does my activity consistency change across semesters or work schedules?
- What happens to my planned training volume if I reduce sessions from four days to three?

Forecasts should display uncertainty and never promise precise physical results.

## 22.2 Intelligent Meal Planning

A future meal-planning engine could optimize recipes according to:

- Personal food preferences.
- Dietary restrictions.
- Nutrition targets.
- Grocery budget.
- Preparation time.
- Ingredient availability.
- User-selected fitness priorities.

It could propose meals that improve overall dietary coverage without demanding perfection from individual meals.

## 22.3 Adaptive Training Periodization

The training planner could organize programs into multiweek blocks focused on:

- Foundational strength.
- Muscular development.
- Cardiovascular conditioning.
- Maintenance.
- Recovery.

Programs would evolve according to completed sessions, performance, and feedback.

## 22.4 Wearable Companion

A future Galaxy Watch companion could provide:

- Workout controls.
- Set and repetition logging.
- Session timers.
- Brief daily summaries.
- Convenient check-ins.

Direct physiological sensor access would require separate feasibility and platform-policy review.

## 22.5 Secure Long-Term Health Archive

FORM could become a personal longitudinal record of relevant wellness measurements spanning many years.

The user would be able to inspect trends, export information, and share selected reports with a healthcare professional.

The application should preserve compatibility and exportability as its data model evolves.

---

# 23. Development Priorities

The product vision is intentionally ambitious, but implementation must be disciplined.

**Priority 1: Trustworthy data**

Without correct measurements, source tracking, and safe synchronization, advanced features will not be reliable.

**Priority 2: Effortless daily use**

The application should be useful even when a user has no time to enter information manually.

**Priority 3: Comprehensive nutrition**

Micronutrient analysis and food-data completeness could provide substantial value beyond basic calorie tracking.

**Priority 4: Personalized physique planning**

Appearance goals, body measurements, and adaptive training should work together as one system.

**Priority 5: Meaningful intelligence**

The recommendation engine should be developed after the underlying data infrastructure has been validated.

**Priority 6: Advanced integrations**

Direct Samsung SDK access, cloud synchronization, AI-assisted image analysis, and other ambitious features should follow demonstrated product needs.

---

# 24. Definition of the Finished Product

The long-term success of FORM is not determined by how many individual measurements it can display.

A truly successful version of FORM would:

1. Automatically collect most available activity and physiological measurements.
2. Allow effortless manual tracking of information that devices cannot provide.
3. Understand the user's preferred physique without imposing unrealistic appearance standards.
4. Provide a comprehensive picture of recorded nutritional intake.
5. Support intelligently structured training and physical activity.
6. Identify useful long-term patterns in sleep, recovery, and cardiovascular measurements.
7. Generate personalized, scientifically grounded recommendations.
8. Clearly explain uncertainty and limitations.
9. Protect sensitive personal data.
10. Remain valuable over months and years of use.

## The Ultimate Vision

**FORM should evolve from an application that records the body into an application that helps its user understand and care for the body.**

Its most important innovation will not be a single sensor, a calorie target, a body-composition chart, or an AI assistant.

It will be the intelligent combination of all those capabilities into one coherent experience.

The user should be able to open FORM and understand where they are, how they have changed, and which realistic actions would best support their personal goals.

The experience should feel individualized, technically sophisticated, visually exceptional, and fundamentally respectful of the user's health and autonomy.

**FORM — Understand your body. Shape your routine. Own your progress.**

---

# 25. Authoritative Implementation References

**Samsung Health integration**

- Samsung Health and Health Connect: https://developer.samsung.com/health/health-connect-faq.html
- Samsung synchronization guide: https://developer.samsung.com/health/blog/en/accessing-samsung-health-data-through-health-connect
- Samsung Health Data SDK: https://developer.samsung.com/health/data/guide/introduction.html

**Android development**

- Health Connect documentation: https://developer.android.com/health-and-fitness/health-connect
- Supported data types: https://developer.android.com/health-and-fitness/health-connect/data-types
- Synchronization guidance: https://developer.android.com/health-and-fitness/health-connect/sync-data
- Expo native development: https://docs.expo.dev/workflow/customizing/

**Nutrition**

- USDA FoodData Central: https://fdc.nal.usda.gov/
- FoodData Central API: https://fdc.nal.usda.gov/api-guide/
- NIH Nutrient Recommendations: https://ods.od.nih.gov/healthinformation/nutrientrecommendations.aspx

**General health**

- CDC adult physical activity: https://www.cdc.gov/physical-activity-basics/guidelines/adults.html
- CDC sleep recommendations: https://www.cdc.gov/sleep/about/
