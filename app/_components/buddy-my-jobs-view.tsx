"use client";

import Link from "next/link";
import { useState } from "react";
import type { MyJobSummary } from "@/lib/buddy/assignments";
import { SERVICE_LABELS, type ServiceType } from "@/app/_lib/services";

export const JOB_STATUS_LABELS: Record<string, string> = {
  ACCEPTED: "รับงานแล้ว",
  ON_THE_WAY: "กำลังเดินทาง",
  ARRIVED: "ถึงจุดรับแล้ว",
  IN_PROGRESS: "กำลังช่วยเหลือ",
  COMPLETED: "เสร็จสิ้น",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  ACCEPTED: "bg-indigo-50 text-indigo-800 border-indigo-300",
  ON_THE_WAY: "bg-purple-50 text-purple-800 border-purple-300",
  ARRIVED: "bg-cyan-50 text-cyan-800 border-cyan-300",
  IN_PROGRESS: "bg-emerald-50 text-emerald-800 border-emerald-300",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-300",
};

interface FilterTab {
  id: string;
  label: string;
  statuses?: string[];
}

const filterTabs: FilterTab[] = [
  { id: "all", label: "ทั้งหมด" },
  {
    id: "in_progress",
    label: "กำลังดำเนินงาน",
    statuses: ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_PROGRESS"],
  },
  { id: "completed", label: "เสร็จสิ้น", statuses: ["COMPLETED"] },
];

export function BuddyMyJobsView({ jobs }: { jobs: MyJobSummary[] }) {
  const [activeTab, setActiveTab] = useState("all");

  const currentTab = filterTabs.find((t) => t.id === activeTab);
  const visibleJobs = currentTab?.statuses
    ? jobs.filter((job) => currentTab.statuses?.includes(job.requestStatus))
    : jobs;

  const getCount = (tab: FilterTab) => {
    if (!tab.statuses) return jobs.length;
    return jobs.filter((job) => tab.statuses?.includes(job.requestStatus)).length;
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">งานของฉัน</h1>
          <p className="mt-1 text-base text-slate-600">
            รายการงานที่คุณตอบรับแล้วและกำลังดูแลผู้สูงอายุ
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-bold text-blue-900 self-start sm:self-auto">
          <span>รวม {visibleJobs.length} งานในหมวดนี้</span>
        </div>
      </div>

      {/* Select Tab Bar */}
      <div className="rounded-2xl border border-blue-200/90 bg-blue-50/70 p-2 shadow-2xs">
        <div
          role="tablist"
          aria-label="ตัวกรองสถานะงานของฉัน"
          className="flex gap-2 overflow-x-auto scrollbar-none"
        >
          {filterTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const count = getCount(tab);

            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98] ${
                  isActive
                    ? "bg-blue-700 text-white shadow-xs ring-1 ring-blue-600"
                    : "border border-blue-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-100/50 hover:text-blue-950"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`inline-flex items-center justify-center rounded-full px-2 py-0.5 text-xs font-black ${
                    isActive
                      ? "bg-blue-900 text-blue-100 border border-blue-500"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Jobs Grid or Empty State */}
      {visibleJobs.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white p-10 text-center">
          <p className="text-lg font-bold text-slate-700">ไม่มีงานในสถานะนี้</p>
          <button
            type="button"
            onClick={() => setActiveTab("all")}
            className="mt-4 inline-flex min-h-11 items-center rounded-xl bg-blue-700 px-5 text-sm font-bold text-white hover:bg-blue-800"
          >
            ดูงานทั้งหมด
          </button>
        </div>
      ) : (
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          {visibleJobs.map((job) => {
            const badgeClass =
              STATUS_BADGE_CLASSES[job.requestStatus] ??
              "bg-slate-100 text-slate-700 border-slate-300";
            const label = JOB_STATUS_LABELS[job.requestStatus] ?? job.requestStatus;

            return (
              <article
                className="flex flex-col justify-between rounded-3xl border-2 border-blue-100 bg-white p-6 shadow-xs transition hover:border-blue-300 hover:shadow-md"
                key={job.requestId}
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-2xl font-black text-slate-950">
                        {SERVICE_LABELS[job.serviceType as ServiceType] ?? job.serviceType}
                      </h2>
                    </div>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-bold ${badgeClass}`}
                    >
                      {label}
                    </span>
                  </div>

                  <p className="mt-3 text-base font-bold text-blue-900">
                    {job.serviceDate} · {job.startTime}
                    {job.endTime ? ` - ${job.endTime}` : ""}
                  </p>

                  <div className="mt-4 space-y-1 text-sm text-slate-700">
                    <p>
                      <span className="font-semibold text-slate-500">ผู้รับบริการ: </span>
                      <span className="font-bold text-slate-900">{job.recipientName}</span>
                    </p>
                  </div>
                </div>

                <Link
                  className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 text-base font-bold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98]"
                  href={`/buddy/my-jobs/${job.requestId}`}
                >
                  เปิดขั้นตอนทำงาน →
                </Link>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
