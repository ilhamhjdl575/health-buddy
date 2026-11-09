import { connection } from "next/server";
import { BuddyOpenJobsView } from "@/app/_components/buddy-open-jobs-view";
import { getPendingAssignments } from "@/lib/buddy/assignments";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { RealtimeRefresh } from "@/app/_components/realtime-refresh";

export const instant = false;

async function OpenJobsContent() {
  await connection();
  const result = await getPendingAssignments();
  const profile = await getCurrentProfile();
  if (!result.success) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        {result.error}
      </p>
    );
  }
  return (
    <>
      {profile.status === "AUTHENTICATED" && (
        <RealtimeRefresh
          channel={`pending:${profile.profileId}`}
          table="job_assignments"
          filter={`buddy_id=eq.${profile.profileId}`}
        />
      )}
      <BuddyOpenJobsView assignments={result.assignments} />
    </>
  );
}

export default function OpenJobsPage() {
  return (
    <Suspense fallback={<p className="text-slate-600">กำลังโหลดงาน...</p>}>
      <OpenJobsContent />
    </Suspense>
  );
}
