import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";

/**
 * Initiates Google OAuth authentication via Supabase Auth.
 * Uses browser-based PKCE flow supported by @supabase/ssr.
 *
 * Security rules:
 * - Never requests unnecessary Google API scopes.
 * - Never persists provider tokens or access tokens in localStorage.
 * - Redirects back to /auth/callback for server-side code exchange.
 */
export async function signInWithGoogle() {
  const config = getSupabaseConfigStatus();
  if (!config.ready) {
    return {
      error: new Error(
        "Supabase configuration is missing: " + config.missing.join(", "),
      ),
    };
  }

  try {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback`;

    return await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
      },
    });
  } catch (err) {
    return {
      error: err instanceof Error ? err : new Error("Failed to initiate Google sign-in"),
    };
  }
}
