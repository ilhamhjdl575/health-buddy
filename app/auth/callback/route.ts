import { NextResponse } from "next/server";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { getProfileForAuthUser } from "@/lib/profile/get-profile";
import { ROLE_HOME_PATH } from "@/app/_lib/auth";

/**
 * Handles OAuth callback from Supabase Auth after Google sign-in.
 *
 * Flow:
 * 1. Checks for OAuth error or cancelled consent.
 * 2. Checks for `code` parameter.
 * 3. Exchanges code for session via Supabase server client (PKCE).
 * 4. Resolves user from Supabase Auth.
 * 5. Queries profiles table to verify profile existence and role:
 *    - No profile: redirects to /signup (onboarding).
 *    - Profile with role USER: redirects to /user.
 *    - Profile with role BUDDY: redirects to /buddy.
 *
 * Security rules:
 * - Never trusts role from query string or Google email domain.
 * - Never creates a profile row or assigns a role automatically.
 * - Never returns raw server errors or secrets to the UI.
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const flowId = searchParams.get("sb_flow_id");
  const errorParam = searchParams.get("error");

  // 1. If Google / Supabase returned an OAuth error or consent was cancelled
  if (errorParam) {
    return NextResponse.redirect(`${origin}/login?error=oauth_error`);
  }

  // 2. Missing authorization code
  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`);
  }

  // 3. Check Supabase environment configuration
  if (!getSupabaseConfigStatus().ready) {
    return NextResponse.redirect(`${origin}/login?error=service_unavailable`);
  }

  try {
    const supabase = await createClient();

    // 4. Exchange code for session via server client
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(
      code,
      flowId ? { flowId } : undefined,
    );
    if (exchangeError) {
      console.error("[auth/callback] PKCE code exchange failed", {
        name: exchangeError.name,
        status: exchangeError.status,
      });
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // 5. Retrieve authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(`${origin}/login?error=auth_failed`);
    }

    // 6. Check existing profile in database
    const profileResolution = await getProfileForAuthUser(user.id);

    // Profile exists: redirect to verified home path
    if (profileResolution.status === "PROFILE_COMPLETED") {
      const destination = ROLE_HOME_PATH[profileResolution.profile.role];
      return NextResponse.redirect(`${origin}${destination}`);
    }

    // No profile row exists yet: redirect to onboarding signup
    if (profileResolution.status === "PROFILE_REQUIRED") {
      return NextResponse.redirect(`${origin}/signup`);
    }

    // Do not misclassify a database outage as a missing profile.
    return NextResponse.redirect(`${origin}/login?error=service_unavailable`);
  } catch {
    return NextResponse.redirect(`${origin}/login?error=server_error`);
  }
}
