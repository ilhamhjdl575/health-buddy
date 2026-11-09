import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { LoginView } from "@/app/_components/login-view";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { ROLE_HOME_PATH } from "@/app/_lib/auth";

async function SessionRedirect() {
  // Supabase validates session expiry against the current time, so this check
  // must run for the incoming request instead of during prerendering.
  await connection();

  const profileResult = await getCurrentProfile();

  if (profileResult.status === "AUTHENTICATED") {
    redirect(ROLE_HOME_PATH[profileResult.role]);
  }

  if (profileResult.status === "PROFILE_REQUIRED") {
    redirect("/signup");
  }

  return null;
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <SessionRedirect />
      <LoginView />
    </Suspense>
  );
}

