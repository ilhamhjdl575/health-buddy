import "server-only";

import { getCurrentUser } from "./get-user";
import { getProfileForAuthUser } from "@/lib/profile/get-profile";
import type { UserRole } from "./types";

export type CurrentProfileResult =
  | {
      status: "AUTHENTICATED";
      userId: string;
      profileId: string;
      role: UserRole;
    }
  | {
      status: "PROFILE_REQUIRED";
      userId: string;
    }
  | {
      status: "UNAUTHENTICATED";
    }
  | {
      status: "SERVICE_UNAVAILABLE";
      error?: string;
    };

/**
 * Resolves the authenticated user and their verified role from the database.
 * Never trusts client input, query parameters, or localStorage.
 */
export async function getCurrentProfile(): Promise<CurrentProfileResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { status: "UNAUTHENTICATED" };
  }

  const profileResolution = await getProfileForAuthUser(user.id);

  if (profileResolution.status === "PROFILE_COMPLETED") {
    return {
      status: "AUTHENTICATED",
      userId: user.id,
      profileId: profileResolution.profile.id,
      role: profileResolution.profile.role,
    };
  }

  if (profileResolution.status === "PROFILE_REQUIRED") {
    return {
      status: "PROFILE_REQUIRED",
      userId: user.id,
    };
  }

  return {
    status: "SERVICE_UNAVAILABLE",
    error: profileResolution.status === "SERVICE_UNAVAILABLE" ? profileResolution.error : undefined,
  };
}
