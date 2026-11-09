import { connection } from "next/server";
import { Suspense } from "react";
import { BuddyHistoryView } from "@/app/_components/buddy-history-view";
import { getMyCompletedJobs } from "@/lib/buddy/history";

export const instant = false;

async function Content() {
  await connection();
  const result = await getMyCompletedJobs();
  if (!result.success) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        {result.error}
      </p>
    );
  }
  return <BuddyHistoryView jobs={result.jobs} />;
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<p className="text-slate-600">กำลังโหลดประวัติงาน...</p>}>
      <Content />
    </Suspense>
  );
}
