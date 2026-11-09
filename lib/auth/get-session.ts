import "server-only";

import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import type { SafeSession } from "@/lib/auth/types";

/**
 * Reads the current session safely.
 * Returns null if no active session or Supabase is not configured.
 * Does not expose raw access_token or refresh_token.
 */
export async function getCurrentSession(): Promise<SafeSession | null> {
  const config = getSupabaseConfigStatus();
  if (!config.ready) {
    return null;
  }

  try {
    const supabase = await createClient();
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return null;
    }

    return {
      userId: session.user.id,
      user: session.user,
      expiresAt: session.expires_at ?? null,
    };
  } catch {
    return null;
  }
}
