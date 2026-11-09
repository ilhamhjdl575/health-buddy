"use client";

import Link from "next/link";
import type { PendingAssignment } from "@/lib/buddy/assignments";
import { SERVICE_LABELS, type ServiceType } from "@/app/_lib/services";
import { formatDateThai } from "@/app/_lib/buddy-availability";

export function BuddyOpenJobsView({
  assignments,
}: {
  assignments: PendingAssignment[];
}) {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">งานที่เปิดรับ</h1>
          <p className="mt-1 text-base text-slate-600">
            รายการคำขอรับบริการที่รอการยืนยันจากคุณ
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-xl bg-blue-100 px-3.5 py-1.5 text-sm font-bold text-blue-900 border border-blue-200">
            รอตอบรับ {assignments.length} งาน
          </span>
        </div>
      </div>

      {/* Empty State */}
      {assignments.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-slate-300 bg-white p-10 text-center shadow-xs">
          <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <svg
              className="size-8"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-bold text-slate-900">ไม่มีงานที่รอการยืนยันในขณะนี้</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-slate-600">
            เมื่อมีผู้ใช้สูงอายุเลือกคุณเป็นผู้ดูแล คำขอจะแสดงในหน้านี้เพื่อให้คุณตรวจสอบและตอบรับงาน
          </p>
          <div className="mt-6">
            <Link
              href="/buddy/availability"
              className="inline-flex min-h-11 items-center justify-center rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800"
            >
              ตรวจสอบเวลาพร้อมรับงานของคุณ
            </Link>
          </div>
        </div>
      ) : (
        /* Assignments List */
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const serviceLabel =
              SERVICE_LABELS[assignment.serviceType as ServiceType] ?? assignment.serviceType;

            return (
              <article
                key={assignment.assignmentId}
                className="rounded-2xl border-2 border-slate-200 bg-white p-5 sm:p-6 shadow-sm transition hover:border-blue-400 hover:shadow-md"
              >
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <h2 className="text-xl font-bold text-slate-900">{serviceLabel}</h2>
                  <span className="inline-flex items-center rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-xs font-bold text-amber-900">
                    รอการตอบรับ
                  </span>
                </div>

                {/* Card Body Details */}
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm text-slate-700">
                  {/* Date & Time */}
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-slate-600">
                      <svg
                        className="size-4 shrink-0 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="font-semibold text-slate-800">วันที่:</span>
                      <span>{formatDateThai(assignment.serviceDate)}</span>
                    </div>

                    <div className="flex items-center gap-2 text-slate-600">
                      <svg
                        className="size-4 shrink-0 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <span className="font-semibold text-slate-800">เวลา:</span>
                      <span>
                        {assignment.startTime}
                        {assignment.endTime ? ` – ${assignment.endTime} น.` : " น."}
                      </span>
                    </div>
                  </div>

                  {/* Mobility Summary */}
                  {assignment.mobilitySummary && assignment.mobilitySummary.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="font-semibold text-slate-800">ระดับการเคลื่อนไหว:</span>
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {assignment.mobilitySummary.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-semibold text-slate-700"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Action */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
                  <Link
                    href={`/buddy/open-jobs/${assignment.requestId}?assignment=${assignment.assignmentId}`}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 text-sm font-bold text-white transition hover:bg-blue-800 active:scale-[0.98]"
                  >
                    <span>ดูรายละเอียดและตอบรับงาน</span>
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
                      <path d="M5 12h14" />
                      <path d="m12 5 7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
