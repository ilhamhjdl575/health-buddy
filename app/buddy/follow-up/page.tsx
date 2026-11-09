import { connection } from "next/server";
import { BuddyFollowUpView } from "@/app/_components/buddy-follow-up-view";
import { getMyFollowUpCases } from "@/lib/buddy/follow-up";
import { Suspense } from "react";

export const instant = false;

async function Content() {
  await connection();
  const result = await getMyFollowUpCases();
  if (!result.success) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        {result.error}
      </p>
    );
  }
  return <BuddyFollowUpView cases={result.cases} />;
}

export default function BuddyFollowUpPage() {
  return (
    <Suspense fallback={<p className="text-slate-600">กำลังโหลดรายการติดตาม...</p>}>
      <Content />
    </Suspense>
  );
}
