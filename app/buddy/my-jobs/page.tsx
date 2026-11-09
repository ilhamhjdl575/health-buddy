import { connection } from "next/server";
import { Suspense } from "react";
import { getMyAcceptedJobs } from "@/lib/buddy/assignments";
import { BuddyMyJobsView } from "@/app/_components/buddy-my-jobs-view";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { RealtimeRefresh } from "@/app/_components/realtime-refresh";

export const instant = false;

async function Jobs() {
  await connection();
  const jobs = await getMyAcceptedJobs();
  const profile = await getCurrentProfile();
  return (
    <>
      {profile.status === "AUTHENTICATED" && (
        <RealtimeRefresh
          channel={`my-jobs:${profile.profileId}`}
          table="job_status_history"
          filter={`changed_by=eq.${profile.profileId}`}
          event="INSERT"
        />
      )}
      <BuddyMyJobsView jobs={jobs} />
    </>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p className="p-4 text-slate-600">กำลังโหลดงาน...</p>}>
      <Jobs />
    </Suspense>
  );
}
