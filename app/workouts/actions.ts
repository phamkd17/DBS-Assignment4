"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabase } from "@/lib/supabase";
import { getExercise } from "@/lib/wger";
import type { PlannedExercise } from "@/lib/types";

// Server Actions can be called with a direct POST, not just from our UI, so each one checks sign-in first.
// Row-level security is the final check: even if this code had a bug, Supabase only touches the user's own rows.
async function signedInClient() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return createSupabase();
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

export async function startWorkout(formData: FormData) {
  const supabase = await signedInClient();
  // The browser sends its local date, so a workout at 9 pm in Chicago isn't filed under tomorrow (UTC).
  const localDate = String(formData.get("performed_on") ?? "");
  const { data, error } = await supabase
    .from("workouts")
    .insert({ name: "Workout", ...(DATE.test(localDate) && { performed_on: localDate }) })
    .select("id")
    .single();
  if (error) throw new Error("Could not start the workout. Please try again.");
  redirect(`/workouts/${data.id}`);
}

export async function addExercise(workoutId: string, exerciseId: number): Promise<{ error?: string }> {
  const supabase = await signedInClient();

  const { data: workout } = await supabase.from("workouts").select("exercises").eq("id", workoutId).maybeSingle();
  if (!workout) return { error: "Workout not found." };
  const planned = workout.exercises as PlannedExercise[];
  if (planned.some((e) => e.exercise_id === exerciseId)) return {};

  // Look the exercise up on the server instead of trusting a name sent by the browser.
  let exercise;
  try {
    exercise = await getExercise(exerciseId);
  } catch {
    return { error: "The exercise library is unavailable right now. Try again in a minute." };
  }
  if (!exercise) return { error: "That exercise is no longer in the library." };

  const snapshot: PlannedExercise = {
    exercise_id: exercise.id,
    name: exercise.name,
    category: exercise.category,
    muscles: exercise.muscles,
  };
  const { error } = await supabase
    .from("workouts")
    .update({ exercises: [...planned, snapshot] })
    .eq("id", workoutId);
  if (error) return { error: "Could not add the exercise. Please try again." };
  refresh();
  return {};
}

export type SetFormState = { error?: string; savedAt?: number };

export async function addSet(_prev: SetFormState, formData: FormData): Promise<SetFormState> {
  const supabase = await signedInClient();

  const workoutId = String(formData.get("workout_id"));
  const exerciseId = Number(formData.get("exercise_id"));
  const weightText = String(formData.get("weight_lb") ?? "").trim();
  const reps = Number(formData.get("reps"));

  if (!Number.isInteger(reps) || reps < 1 || reps > 1000) return { error: "Reps must be a whole number from 1 to 1000." };
  const weight = weightText === "" ? null : Number(weightText);
  if (weight !== null && (!Number.isFinite(weight) || weight < 0 || weight > 2000)) {
    return { error: "Weight must be between 0 and 2000 lb, or empty for bodyweight." };
  }

  // The exercise snapshot comes from the workout's own plan, so logging a set never waits on wger.
  const { data: workout } = await supabase.from("workouts").select("exercises").eq("id", workoutId).maybeSingle();
  const exercise = (workout?.exercises as PlannedExercise[] | undefined)?.find((e) => e.exercise_id === exerciseId);
  if (!exercise) return { error: "Add this exercise to the workout first." };

  const { error } = await supabase.from("workout_sets").insert({
    workout_id: workoutId,
    exercise_id: exercise.exercise_id,
    exercise_name: exercise.name,
    category: exercise.category,
    muscles: exercise.muscles,
    weight_lb: weight === null ? null : Math.round(weight * 10) / 10,
    reps,
  });
  if (error) return { error: "Could not save the set. Please try again." };
  refresh();
  return { savedAt: Date.now() };
}

export async function deleteSet(setId: string) {
  const supabase = await signedInClient();
  await supabase.from("workout_sets").delete().eq("id", setId);
  refresh();
}
