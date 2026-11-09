import { connection } from "next/server";
import { Suspense } from "react";
import { getMyTodayJobs } from "@/lib/buddy/assignments";
import { BuddyTodayView } from "@/app/_components/buddy-today-view";

export const instant = false;

async function TodayJobsContent() {
  await connection();
  const jobs = await getMyTodayJobs();
  return <BuddyTodayView jobs={jobs} />;
}

export default function TodayPage() {
  return (
    <Suspense fallback={<p className="p-4 text-slate-600">กำลังโหลดงานวันนี้...</p>}>
      <TodayJobsContent />
    </Suspense>
  );
}
