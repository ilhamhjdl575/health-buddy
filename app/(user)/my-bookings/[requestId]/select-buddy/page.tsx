import { Suspense } from "react";
import { getCandidateBuddies } from "@/lib/matching/actions";
import { CandidateList } from "@/app/_components/candidate-list";
import { requireRole } from "@/lib/auth/route-guard";

export const instant = false;

async function SelectBuddyContent({ params }: { params: Promise<{ requestId: string }> }) {
  const { requestId } = await params;
  const result = await getCandidateBuddies(requestId);
  if (!result.success) return <p className="text-red-800">{result.error}</p>;
  return <CandidateList requestId={requestId} buddies={result.buddies} />;
}

export default async function SelectBuddyPage({ params }: { params: Promise<{ requestId: string }> }) {
  await requireRole("USER", "/my-bookings");
  return (
    <Suspense fallback={<p className="p-4 text-slate-600">กำลังโหลดรายชื่อ Buddy...</p>}>
      <SelectBuddyContent params={params} />
    </Suspense>
  );
}
