"use client";

import Link from "next/link";
import { useState } from "react";
import { caseStatusLabels, type AdminCase, type CaseStatus } from "@/app/_lib/admin-cases";

interface FilterTab {
  id: string;
  label: string;
  statuses?: CaseStatus[];
  dotColor: string;
  icon: (props: { className?: string }) => React.ReactNode;
}

const filters: FilterTab[] = [
  {
    id: "all",
    label: "ทั้งหมด",
    dotColor: "bg-teal-500",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  {
    id: "matching",
    label: "รอหา อสม.",
    statuses: ["REQUESTED", "MATCHING", "OPEN"],
    dotColor: "bg-amber-500",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "in_progress",
    label: "กำลังดำเนินการ",
    statuses: ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_SERVICE"],
    dotColor: "bg-sky-500",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" />
        <path d="M14 9h4l4 4v4c0 .6-.4 1-1 1h-2" />
        <circle cx="7" cy="18" r="2" />
        <circle cx="17" cy="18" r="2" />
      </svg>
    ),
  },
  {
    id: "follow_up",
    label: "ติดตามผล",
    statuses: ["FOLLOW_UP"],
    dotColor: "bg-indigo-500",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
      </svg>
    ),
  },
  {
    id: "completed",
    label: "เสร็จสิ้น",
    statuses: ["COMPLETED", "CLOSED"],
    dotColor: "bg-emerald-500",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
  {
    id: "issues",
    label: "มีปัญหา",
    statuses: ["CANCELLED", "NO_BUDDY_FOUND"],
    dotColor: "bg-rose-500",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
];

const statusStyles: Record<CaseStatus, { bg: string; text: string; border: string; dot: string }> = {
  REQUESTED: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500" },
  MATCHING: { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200", dot: "bg-amber-500" },
  OPEN: { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200", dot: "bg-teal-500" },
  ACCEPTED: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", dot: "bg-sky-500" },
  ON_THE_WAY: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", dot: "bg-sky-500" },
  ARRIVED: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", dot: "bg-sky-500" },
  IN_SERVICE: { bg: "bg-sky-50", text: "text-sky-800", border: "border-sky-200", dot: "bg-sky-500" },
  COMPLETED: { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200", dot: "bg-emerald-500" },
  FOLLOW_UP: { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200", dot: "bg-indigo-500" },
  CLOSED: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-200", dot: "bg-slate-400" },
  CANCELLED: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", dot: "bg-rose-500" },
  NO_BUDDY_FOUND: { bg: "bg-rose-50", text: "text-rose-800", border: "border-rose-200", dot: "bg-rose-500" },
};

export function AdminCasesList({ cases }: { cases: AdminCase[] }) {
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");

  const currentFilter = filters.find((filter) => filter.label === activeFilter);
  const visibleCases = currentFilter?.statuses
    ? cases.filter((caseItem) => currentFilter.statuses?.includes(caseItem.status))
    : cases;

  const getCount = (tab: FilterTab) => {
    if (!tab.statuses) return cases.length;
    return cases.filter((item) => tab.statuses?.includes(item.status)).length;
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-950">เคสทั้งหมด</h1>
          <p className="mt-1 text-sm text-slate-600 sm:text-base">
            จัดการและติดตามสถานะงานดูแลผู้รับบริการ Health Buddy ทั้งหมดในระบบ
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-xl border border-teal-200 bg-teal-50/80 px-3 py-1.5 text-xs font-semibold text-teal-900 sm:self-auto sm:text-sm">
          <span className="size-2 rounded-full bg-teal-600 animate-pulse" aria-hidden="true" />
          <span>แสดง {visibleCases.length} จาก {cases.length} เคส</span>
        </div>
      </div>

      {/* Select Tab Bar */}
      <div className="rounded-2xl border border-slate-200/90 bg-slate-100/80 p-2 shadow-xs">
        <div
          role="tablist"
          aria-label="ตัวกรองเคส"
          className="flex gap-1.5 overflow-x-auto scrollbar-none"
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter.label;
            const count = getCount(filter);
            const Icon = filter.icon;

            return (
              <button
                key={filter.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFilter(filter.label)}
                type="button"
                className={`group relative flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-teal-700 ${
                  isActive
                    ? "bg-teal-700 text-white shadow-sm ring-1 ring-teal-800/30"
                    : "text-slate-700 hover:bg-white hover:text-teal-950 hover:shadow-2xs"
                }`}
              >
                {/* Status Dot */}
                <span
                  className={`size-2 shrink-0 rounded-full transition-transform ${filter.dotColor} ${
                    isActive ? "ring-2 ring-white/60 scale-110" : ""
                  }`}
                  aria-hidden="true"
                />

                {/* Tab Icon */}
                <Icon
                  className={`size-4 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-slate-400 group-hover:text-teal-700"
                  }`}
                />

                {/* Tab Label */}
                <span className="whitespace-nowrap">{filter.label}</span>

                {/* Counter Badge */}
                <span
                  className={`inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-xs font-bold transition-colors ${
                    isActive
                      ? "bg-teal-900/60 text-teal-100 border border-teal-500/40"
                      : "bg-slate-200 text-slate-700 group-hover:bg-teal-100 group-hover:text-teal-900"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Case cards list or empty state */}
      {visibleCases.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
            <svg className="size-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
          <p className="mt-3 text-lg font-bold text-slate-900">ไม่พบเคสในสถานะ &quot;{activeFilter}&quot;</p>
          <p className="mt-1 text-sm text-slate-500">ลองเลือกแท็บอื่น หรือดูเคสทั้งหมด</p>
          <button
            type="button"
            onClick={() => setActiveFilter("ทั้งหมด")}
            className="mt-4 rounded-xl border border-teal-300 bg-teal-50 px-4 py-2 text-sm font-semibold text-teal-900 hover:bg-teal-100 transition-colors"
          >
            กลับไปแสดงทั้งหมด
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visibleCases.map((caseItem) => {
            const style = statusStyles[caseItem.status] ?? {
              bg: "bg-slate-50",
              text: "text-slate-800",
              border: "border-slate-200",
              dot: "bg-slate-500",
            };

            return (
              <article
                key={caseItem.id}
                className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-teal-300 hover:shadow-md"
              >
                <div>
                  {/* Top status & ID bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                      รหัส {caseItem.id}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-bold ${style.bg} ${style.text} ${style.border}`}
                    >
                      <span className={`size-1.5 rounded-full ${style.dot}`} aria-hidden="true" />
                      <span>{caseStatusLabels[caseItem.status]}</span>
                    </span>
                  </div>

                  {/* Case title */}
                  <h2 className="mt-3 text-xl font-bold text-slate-950">{caseItem.helpType}</h2>

                  {/* Attention banner if exists */}
                  {caseItem.attentionReason && (
                    <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-2.5 text-xs text-amber-900 flex items-start gap-2">
                      <svg className="size-4 shrink-0 text-amber-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="12" />
                        <line x1="12" y1="16" x2="12.01" y2="16" />
                      </svg>
                      <span><strong>ต้องดูแล:</strong> {caseItem.attentionReason}</span>
                    </div>
                  )}

                  {/* Details dl */}
                  <dl className="mt-4 space-y-2 text-sm text-slate-700">
                    <div className="flex items-start gap-2">
                      <svg className="size-4 shrink-0 text-slate-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                      </svg>
                      <div>
                        <dt className="sr-only">วันและเวลา</dt>
                        <dd className="font-medium text-slate-900">{caseItem.date}, {caseItem.time}</dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <svg className="size-4 shrink-0 text-slate-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <div>
                        <dt className="sr-only">พื้นที่</dt>
                        <dd className="text-slate-700">{caseItem.area}</dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <svg className="size-4 shrink-0 text-slate-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <div>
                        <dt className="sr-only">ผู้รับบริการ</dt>
                        <dd className="text-slate-700">
                          {caseItem.recipient.name} ({caseItem.recipient.age} ปี)
                        </dd>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <svg className="size-4 shrink-0 text-slate-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
                      </svg>
                      <div>
                        <dt className="sr-only">อสม. ที่รับงาน</dt>
                        <dd className={caseItem.buddy ? "font-semibold text-teal-800" : "text-slate-500 italic"}>
                          {caseItem.buddy ?? "ยังไม่มี อสม. รับงาน"}
                        </dd>
                      </div>
                    </div>
                  </dl>
                </div>

                {/* Action button */}
                <Link
                  href={`/admin/cases/${caseItem.id}`}
                  className="mt-5 flex min-h-11 items-center justify-center rounded-xl bg-teal-800 px-4 text-sm font-bold text-white shadow-xs transition-colors hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-800 active:scale-[0.99]"
                >
                  ดูรายละเอียดเคส →
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
