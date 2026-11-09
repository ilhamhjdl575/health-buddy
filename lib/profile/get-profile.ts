import "server-only";

import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME_PATH } from "@/app/_lib/auth";
import type { ProfileResolution, ProfileRecord } from "./types";

/**
 * Resolves the profile state for an authenticated user.
 * - If user has no profile record: returns { status: "PROFILE_REQUIRED", authUserId }
 * - If user has a profile record: returns { status: "PROFILE_COMPLETED", profile, redirectPath }
 *
 * Does NOT perform redirects automatically.
 */
export async function getProfileForAuthUser(
  authUserId: string,
): Promise<ProfileResolution> {
  if (!authUserId) {
    return { status: "UNAUTHENTICATED" };
  }

  const config = getSupabaseConfigStatus();
  if (!config.ready) {
    return { status: "SERVICE_UNAVAILABLE", error: "Supabase configuration missing" };
  }

  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (error) {
      return { status: "SERVICE_UNAVAILABLE", error: error.message };
    }

    if (!data) {
      return {
        status: "PROFILE_REQUIRED",
        authUserId,
      };
    }

    const profile = data as ProfileRecord;
    const redirectPath = ROLE_HOME_PATH[profile.role];

    return {
      status: "PROFILE_COMPLETED",
      profile,
      redirectPath,
    };
  } catch (err) {
    return {
      status: "SERVICE_UNAVAILABLE",
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
