import type { User } from "@supabase/supabase-js";
import type { UserRole, AuthProvider } from "@/app/_lib/auth";

// Re-export strict roles and providers
// STRICT: Only "USER" | "BUDDY" - NO ADMIN, NO PROFESSIONAL
export type { UserRole, AuthProvider };

export type AuthUser = User;

/**
 * Safe representation of a session.
 * Excludes raw access_token and refresh_token to prevent leaking to UI.
 */
export type SafeSession = {
  userId: string;
  user: User;
  expiresAt: number | null;
};
