import "server-only";

import { redirect } from "next/navigation";
import { getCurrentProfile } from "./get-current-profile";
import { ROLE_HOME_PATH } from "@/app/_lib/auth";
import type { UserRole } from "./types";

/**
 * Public routes that never require authentication.
 */
export const PUBLIC_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/register",
  "/splash",
  "/emergency",
  "/auth/callback",
  "/auth-check",
  "/system-check",
] as const;

/**
 * USER protected routes.
 */
export const USER_ROUTES = [
  "/user",
  "/booking",
  "/my-bookings",
  "/mobility",
  "/profile",
] as const;

/**
 * Checks if a given pathname is a public route.
 */
export function isPublicRoute(pathname: string): boolean {
  if (pathname === "/") return true;
  return PUBLIC_ROUTES.some((route) => {
    if (route === "/") return false;
    return pathname === route || pathname.startsWith(`${route}/`);
  });
}

/**
 * Checks if a given pathname belongs to USER protected routes.
 */
export function isUserRoute(pathname: string): boolean {
  return USER_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

/**
 * Checks if a given pathname belongs to BUDDY protected routes.
 */
export function isBuddyRoute(pathname: string): boolean {
  return pathname === "/buddy" || pathname.startsWith("/buddy/");
}

/**
 * Determines whether strict authentication route enforcement is enabled.
 * Default in prototype development is mock-compatible mode (allows guest exploration).
 * When NEXT_PUBLIC_AUTH_MODE=strict or ENFORCE_AUTH_ROUTE_PROTECTION=true, strict login is required.
 */
export function isStrictAuthEnforced(): boolean {
  return true;
}

/**
 * Enforces role-based route access for Server Components.
 *
 * Rules:
 * 1. If path is public (e.g. /emergency): access is always allowed.
 * 2. If user has an active Supabase session:
 *    - If profile is missing (PROFILE_REQUIRED): redirects to /signup.
 *    - If role matches allowedRole: allows access.
 *    - If role does not match: redirects to that role's home path (/user or /buddy).
 * 3. If user has NO active session:
 *    - In strict auth mode: redirects to /login.
 *    - In development mock mode: allows guest access for prototype testing.
 */
export async function requireRole(allowedRole: UserRole, currentPath?: string) {
  if (currentPath && isPublicRoute(currentPath)) {
    return null;
  }

  const profileResult = await getCurrentProfile();

  if (profileResult.status === "PROFILE_REQUIRED") {
    redirect("/signup");
  }

  if (profileResult.status === "AUTHENTICATED") {
    if (profileResult.role !== allowedRole) {
      redirect(ROLE_HOME_PATH[profileResult.role]);
    }
    return profileResult;
  }

  // Unauthenticated guest
  if (isStrictAuthEnforced()) {
    redirect("/login");
  }

  return null;
}
