import "server-only";

import type { User } from "@supabase/supabase-js";
import { connection } from "next/server";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

/**
 * Returns the currently authenticated user from Supabase, or null if unauthenticated or not configured.
 * Does not redirect.
 */
export async function getCurrentUser(): Promise<User | null> {
  await connection();

  const config = getSupabaseConfigStatus();
  if (!config.ready) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return null;
    }

    return user;
  } catch {
    return null;
  }
}
