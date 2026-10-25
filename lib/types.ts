// The snapshot of a wger exercise stored in workouts.exercises and templates.exercises.
export type PlannedExercise = {
  exercise_id: number;
  name: string;
  category: string;
  muscles: string[];
  image?: string | null; // wger picture URL; missing on exercises added before pictures were stored
};

export type LoggedSet = {
  id: string;
  exercise_id: number;
  weight_lb: number | null;
  reps: number;
  created_at: string;
};
