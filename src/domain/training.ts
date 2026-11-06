import type { Profile, Workout } from "./model";
export type Exercise = {
  id: string;
  name: string;
  muscle: string;
  equipment: "Bodyweight" | "Dumbbells" | "Gym";
  instructions: string;
  alternative: string;
  timed?: boolean;
};
const entries: Array<
  [string, string, string, Exercise["equipment"], string, string, boolean?]
> = [
  [
    "squat",
    "Bodyweight squat",
    "Legs",
    "Bodyweight",
    "Keep your feet planted. Bend at hips and knees within a comfortable range. Stand with control.",
    "Chair sit-to-stand",
  ],
  [
    "split-squat",
    "Split squat",
    "Legs",
    "Bodyweight",
    "Use a stable split stance and lower with control. Hold a support if needed.",
    "Bodyweight squat",
  ],
  [
    "bridge",
    "Glute bridge",
    "Glutes",
    "Bodyweight",
    "Lie on your back, knees bent. Lift hips without arching your lower back.",
    "Hip hinge",
  ],
  [
    "pushup",
    "Incline push-up",
    "Chest",
    "Bodyweight",
    "Use a stable elevated surface. Keep a straight trunk and lower with control.",
    "Wall push-up",
  ],
  [
    "plank",
    "Plank",
    "Core",
    "Bodyweight",
    "Brace gently, breathe, and keep shoulders over elbows. Stop when form changes.",
    "Dead bug",
    true,
  ],
  [
    "deadbug",
    "Dead bug",
    "Core",
    "Bodyweight",
    "Lie on your back. Move opposite arm and leg slowly while keeping your trunk steady.",
    "Bird dog",
  ],
  [
    "bird-dog",
    "Bird dog",
    "Core",
    "Bodyweight",
    "From hands and knees, extend opposite arm and leg without twisting.",
    "Dead bug",
  ],
  [
    "calf-raise",
    "Calf raise",
    "Calves",
    "Bodyweight",
    "Hold a support and rise onto the balls of your feet. Lower slowly.",
    "Seated calf raise",
  ],
  [
    "walk",
    "Brisk walk",
    "Cardio",
    "Bodyweight",
    "Choose a comfortable route and a pace that allows conversation.",
    "Stationary cycling",
    true,
  ],
  [
    "mobility",
    "Gentle mobility flow",
    "Mobility",
    "Bodyweight",
    "Move shoulders, hips and ankles through comfortable ranges. Do not force painful stretches.",
    "Easy walk",
    true,
  ],
  [
    "db-row",
    "Dumbbell row",
    "Back",
    "Dumbbells",
    "Support your torso and draw the elbow toward your hip. Lower with control.",
    "Seated cable row",
  ],
  [
    "db-press",
    "Dumbbell floor press",
    "Chest",
    "Dumbbells",
    "Lie on the floor with knees bent. Press upward with wrists stacked over elbows.",
    "Incline push-up",
  ],
  [
    "db-squat",
    "Goblet squat",
    "Legs",
    "Dumbbells",
    "Hold one dumbbell close to your chest and squat within your comfortable range.",
    "Bodyweight squat",
  ],
  [
    "db-rdl",
    "Dumbbell Romanian deadlift",
    "Posterior chain",
    "Dumbbells",
    "Keep knees soft and hinge at your hips with a neutral spine. Keep weights close.",
    "Glute bridge",
  ],
  [
    "db-shoulder",
    "Dumbbell shoulder press",
    "Shoulders",
    "Dumbbells",
    "Press from shoulder level without excessive back arch. Use a comfortable grip.",
    "Light lateral raise",
  ],
  [
    "db-lateral",
    "Dumbbell lateral raise",
    "Shoulders",
    "Dumbbells",
    "Use light weights. Raise arms out to the sides within a comfortable range.",
    "Shoulder mobility",
  ],
  [
    "db-curl",
    "Dumbbell curl",
    "Arms",
    "Dumbbells",
    "Keep your elbows steady and curl without swinging.",
    "Cable curl",
  ],
  [
    "leg-press",
    "Leg press",
    "Legs",
    "Gym",
    "Adjust the seat, keep your back supported and avoid locking knees.",
    "Goblet squat",
  ],
  [
    "lat-pull",
    "Lat pulldown",
    "Back",
    "Gym",
    "Pull toward the upper chest with controlled shoulders. Avoid pulling behind your neck.",
    "Dumbbell row",
  ],
  [
    "cable-row",
    "Seated cable row",
    "Back",
    "Gym",
    "Sit tall, pull elbows back and avoid jerking the torso.",
    "Dumbbell row",
  ],
  [
    "chest-press",
    "Machine chest press",
    "Chest",
    "Gym",
    "Adjust handles to chest level and press with controlled motion.",
    "Dumbbell floor press",
  ],
  [
    "leg-curl",
    "Seated leg curl",
    "Hamstrings",
    "Gym",
    "Align the machine pivot with the knee and use a controlled range.",
    "Glute bridge",
  ],
  [
    "cycle",
    "Stationary cycling",
    "Cardio",
    "Gym",
    "Adjust the saddle and start at easy resistance. Increase gradually.",
    "Brisk walk",
    true,
  ],
];
export const exercises: Exercise[] = entries.map(
  ([id, name, muscle, equipment, instructions, alternative, timed]) => ({
    id,
    name,
    muscle,
    equipment,
    instructions,
    alternative,
    timed,
  }),
);
export function plan(profile: Profile, light = false): Exercise[] {
  if (light)
    return exercises.filter((e) =>
      ["walk", "mobility", "deadbug"].includes(e.id),
    );
  const ids =
    profile.equipment === "Gym"
      ? ["leg-press", "lat-pull", "chest-press", "leg-curl", "deadbug"]
      : profile.equipment === "Dumbbells"
        ? ["db-squat", "db-row", "db-press", "db-rdl", "deadbug"]
        : ["squat", "pushup", "bridge", "bird-dog", "plank"];
  return ids
    .slice(0, profile.sessionMinutes < 25 ? 3 : 5)
    .map((id) => exercises.find((e) => e.id === id)!);
}
export const volume = (workout: Workout): number =>
  workout.sets.filter((s) => s.done).reduce((v, s) => v + s.kg * s.reps, 0);
export function progression(exerciseId: string, sessions: Workout[]): string {
  const recent = sessions
    .filter(
      (w) =>
        w.completedAt &&
        w.sets.some((s) => s.exerciseId === exerciseId && s.done),
    )
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, 2);
  if (recent.length < 2)
    return "Log two completed sessions to compare performance.";
  const sets = recent.map((w) =>
    w.sets.filter((s) => s.exerciseId === exerciseId && s.done),
  );
  const easy = sets.every(
    (rows) =>
      rows.length > 0 &&
      rows.every((s) => s.reps >= 12 && s.rpe !== null && s.rpe <= 7),
  );
  return easy
    ? "Both recent sessions reached 12 reps with moderate effort. If comfortable, consider a small increase in resistance."
    : "Build consistency at a comfortable resistance. Adjust for form, soreness and perceived effort.";
}
