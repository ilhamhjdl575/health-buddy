"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { PendingAssignment } from "@/lib/buddy/assignments";
import { respondAssignment } from "@/lib/buddy/assignments";
import { SERVICE_LABELS, type ServiceType } from "@/app/_lib/services";
import { formatDateThai } from "@/app/_lib/buddy-availability";

export function PendingAssignmentDetail({
  assignment,
}: {
  assignment: PendingAssignment;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleAction = async (accept: boolean) => {
    setError("");
    setBusy(true);
    const res = await respondAssignment(assignment.assignmentId, accept);
    setBusy(false);

    if (!res.success) {
      return setError(res.error);
    }

    if (accept) {
      router.push(`/buddy/my-jobs/${res.requestId}`);
    } else {
      router.push("/buddy/open-jobs");
    }
    router.refresh();
  };

  const serviceLabel =
    SERVICE_LABELS[assignment.serviceType as ServiceType] ?? assignment.serviceType;

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/buddy/open-jobs"
          className="inline-flex items-center gap-2 text-sm font-bold text-blue-800 hover:text-blue-950 transition"
        >
          <svg
            className="size-4"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m15 18-6-6 6-6" />
          </svg>
          <span>กลับไปหน้างานที่เปิดรับ</span>
        </Link>
      </div>

      {/* Main Detail Card */}
      <div className="rounded-2xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700">
              คำขอรับบริการ
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-950 mt-0.5">
              {serviceLabel}
            </h1>
          </div>
          <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3.5 py-1 text-xs font-bold text-amber-900">
            รอการตอบรับ
          </span>
        </div>

        {/* Schedule Info */}
        <div className="grid gap-4 sm:grid-cols-2 rounded-xl bg-slate-50 p-4 border border-slate-200 text-sm">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              วันที่นัดหมาย
            </span>
            <p className="text-base font-bold text-slate-900 mt-1">
              {formatDateThai(assignment.serviceDate)}
            </p>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">
              เวลานัดหมาย
            </span>
            <p className="text-base font-bold text-slate-900 mt-1">
              {assignment.startTime}
              {assignment.endTime ? ` – ${assignment.endTime} น.` : " น."}
            </p>
          </div>
        </div>

        {/* Mobility info if present */}
        {assignment.mobilitySummary && assignment.mobilitySummary.length > 0 && (
          <div className="space-y-2">
            <span className="text-sm font-bold text-slate-800">
              สถานะการเคลื่อนไหวของผู้รับบริการ
            </span>
            <div className="flex flex-wrap gap-2">
              {assignment.mobilitySummary.map((item, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-lg border border-slate-200 bg-white px-3 py-1 text-xs font-bold text-slate-800 shadow-2xs"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Error notification */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-bold text-red-800"
          >
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-3 justify-end">
          <button
            disabled={busy}
            type="button"
            onClick={() => handleAction(false)}
            className="w-full sm:w-auto min-h-12 items-center justify-center rounded-xl border-2 border-red-200 bg-red-50/70 px-6 text-sm font-bold text-red-800 transition hover:bg-red-100 active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "กำลังดำเนินการ..." : "ปฏิเสธงาน"}
          </button>
          <button
            disabled={busy}
            type="button"
            onClick={() => handleAction(true)}
            className="w-full sm:w-auto min-h-12 items-center justify-center rounded-xl bg-emerald-700 px-7 text-sm font-bold text-white shadow-sm transition hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-50"
          >
            {busy ? "กำลังดำเนินการ..." : "ยืนยันรับงาน"}
          </button>
        </div>
      </div>
    </section>
  );
}
