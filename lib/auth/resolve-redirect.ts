"use server";

import { getCurrentProfile } from "./get-current-profile";
import { ROLE_HOME_PATH } from "@/app/_lib/auth";

export type PostLoginRedirectResult = {
  destination: string;
};

/**
 * Server action to resolve the post-login destination based on verified database role.
 *
 * Rules:
 * - If profiles table has row with role USER: redirects to /user.
 * - If profiles table has row with role BUDDY: redirects to /buddy.
 * - If no profile row exists (PROFILE_REQUIRED): redirects to /signup.
 * - Never trusts client input or query strings.
 */
export async function resolvePostLoginRedirect(): Promise<PostLoginRedirectResult> {
  const profileResult = await getCurrentProfile();

  if (profileResult.status === "AUTHENTICATED") {
    return {
      destination: ROLE_HOME_PATH[profileResult.role],
    };
  }

  // Default fallback for new users: onboarding signup
  return {
    destination: "/signup",
  };
}
