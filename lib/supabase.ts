import "server-only";
import { auth } from "@clerk/nextjs/server";
import { createClient } from "@supabase/supabase-js";

// A Supabase client that acts as the signed-in user. Every query carries the user's Clerk session token,
// which Supabase verifies (third-party auth) and exposes to row-level security as auth.jwt().
export async function createSupabase() {
  const { getToken } = await auth();
  return createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    accessToken: async () => (await getToken()) ?? null,
  });
}
