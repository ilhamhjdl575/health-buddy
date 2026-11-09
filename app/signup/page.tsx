import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { ROLE_HOME_PATH } from "@/app/_lib/auth";
import { SignupView } from "@/app/_components/signup-view";

export const metadata = {
  title: "สมัครสมาชิก | Health Buddy",
  description: "สมัครสมาชิก Health Buddy เลือกระหว่างผู้รับบริการหรือผู้ดูแลชุมชน",
};

async function ExistingProfileRedirect() {
  // Access dynamic request connection so Supabase session check runs per-request
  await connection();

  // If the authenticated user already has a complete profile, redirect to their role dashboard
  // to prevent duplicate onboarding submissions.
  const profileResult = await getCurrentProfile();
  if (profileResult.status === "AUTHENTICATED") {
    redirect(ROLE_HOME_PATH[profileResult.role]);
  }

  return null;
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <ExistingProfileRedirect />
      <SignupView />
    </Suspense>
  );
}
