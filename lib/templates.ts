import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { STARTER_TEMPLATES } from "./starters";

// Gives a new user the starter templates once. The user_settings row is the "already done" marker:
// whichever request flips starters_added to true is the only one that copies, so two tabs opening
// at the same time can't create duplicates.
export async function ensureStarterTemplates(supabase: SupabaseClient) {
  const { data: created, error: insertError } = await supabase
    .from("user_settings")
    .upsert(
      { starters_added: true },
      { onConflict: "user_id", ignoreDuplicates: true },
    )
    .select("user_id");
  if (insertError) {
    console.error("ensureStarterTemplates insert failed:", insertError);
    return;
  }

  let claimed = (created ?? []).length > 0;
  if (!claimed) {
    // A settings row already exists; claim it only if the starters were never added.
    const { data: updated } = await supabase
      .from("user_settings")
      .update({ starters_added: true })
      .eq("starters_added", false)
      .select("user_id");
    claimed = (updated ?? []).length > 0;
  }
  if (!claimed) return;

  const { error } = await supabase.from("templates").insert(STARTER_TEMPLATES);
  if (error) console.error("Copying starter templates failed:", error);
}
