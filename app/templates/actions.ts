"use server";

import { auth } from "@clerk/nextjs/server";
import { refresh } from "next/cache";
import { createSupabase } from "@/lib/supabase";
import type { PlannedExercise } from "@/lib/types";

async function signedInClient() {
  const { userId } = await auth();
  if (!userId) throw new Error("Not signed in");
  return createSupabase();
}

export async function renameTemplate(
  templateId: string,
  name: string,
): Promise<{ error?: string }> {
  const supabase = await signedInClient();
  const trimmed = name.trim();
  if (trimmed.length < 1 || trimmed.length > 80)
    return { error: "Names can be 1 to 80 characters." };
  const { error } = await supabase
    .from("templates")
    .update({ name: trimmed })
    .eq("id", templateId);
  if (error) {
    console.error("renameTemplate failed:", error);
    return { error: "Could not rename the template. Please try again." };
  }
  refresh();
  return {};
}

export async function deleteTemplate(
  templateId: string,
): Promise<{ error?: string }> {
  const supabase = await signedInClient();
  // Workouts started from this template keep their own copy of the exercises, so nothing else is affected.
  const { error } = await supabase
    .from("templates")
    .delete()
    .eq("id", templateId);
  if (error) {
    console.error("deleteTemplate failed:", error);
    return { error: "Could not delete the template. Please try again." };
  }
  refresh();
  return {};
}

export async function removeTemplateExercise(
  templateId: string,
  exerciseId: number,
): Promise<{ error?: string }> {
  const supabase = await signedInClient();
  const { data: template } = await supabase
    .from("templates")
    .select("exercises")
    .eq("id", templateId)
    .maybeSingle();
  if (!template) return { error: "Template not found." };
  const exercises = (template.exercises as PlannedExercise[]).filter(
    (e) => e.exercise_id !== exerciseId,
  );
  const { error } = await supabase
    .from("templates")
    .update({ exercises })
    .eq("id", templateId);
  if (error) {
    console.error("removeTemplateExercise failed:", error);
    return { error: "Could not remove the exercise. Please try again." };
  }
  refresh();
  return {};
}
