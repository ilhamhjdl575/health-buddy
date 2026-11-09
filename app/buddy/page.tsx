import { connection } from "next/server";
import { BuddyDashboard } from "@/app/_components/buddy-dashboard";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";
import { getMyAcceptedJobs, getMyTodayJobs, getPendingAssignments } from "@/lib/buddy/assignments";

export const instant = false;

export default async function BuddyHomePage() {
  await connection();
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED") return null;
  const supabase = await createClient();
  const [{ data: profile }, pending, accepted, today] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", current.profileId).single(),
    getPendingAssignments(),
    getMyAcceptedJobs(),
    getMyTodayJobs(),
  ]);
  const activeJobs = accepted.filter((job) => job.requestStatus !== "COMPLETED");
  const nextJob = [...activeJobs].sort((a, b) => `${a.serviceDate}T${a.startTime}`.localeCompare(`${b.serviceDate}T${b.startTime}`))[0] ?? null;
  const name = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "Buddy";
  return <BuddyDashboard name={name} pendingCount={pending.success ? pending.assignments.length : 0} acceptedCount={activeJobs.length} todayCount={today.length} nextJob={nextJob} />;
}
