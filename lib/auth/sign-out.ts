"use server";

import { redirect } from "next/navigation";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Server action to sign out from Supabase Auth and redirect to /login.
 */
export async function signOut() {
  if (getSupabaseConfigStatus().ready) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // Gracefully continue to redirect if client error occurs
    }
  }

  redirect("/login");
}
