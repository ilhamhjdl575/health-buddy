import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getPendingAssignments, type PendingAssignment } from "@/lib/buddy/assignments";
import { PendingAssignmentDetail } from "@/app/_components/pending-assignment-detail";

export const instant = false;

async function Detail({ params }: { params: Promise<{ jobId: string }> }) {
  await connection();
  const { jobId } = await params;
  const r = await getPendingAssignments();
  const a = r.success ? r.assignments.find((x: PendingAssignment) => x.requestId === jobId) : undefined;
  if (!a) notFound();
  return <PendingAssignmentDetail assignment={a} />;
}

export default function Page({ params }: { params: Promise<{ jobId: string }> }) {
  return (
    <Suspense fallback={<p className="p-4 text-slate-600">กำลังโหลดรายละเอียดงาน...</p>}>
      <Detail params={params} />
    </Suspense>
  );
}
