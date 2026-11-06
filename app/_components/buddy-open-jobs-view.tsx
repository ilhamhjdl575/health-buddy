"use client";

import Link from "next/link";
import { useState } from "react";
import { openJobs, type OpenJob } from "@/app/_lib/open-jobs";

export function BuddyOpenJobsView() {
  const [selectedType, setSelectedType] = useState<string>("ทั้งหมด");

  const categories = ["ทั้งหมด", "เดินทาง", "นัดหมาย", "ช่วยสื่อสาร"];

  const filteredJobs = selectedType === "ทั้งหมด"
    ? openJobs
    : openJobs.filter((job) => job.helpType === selectedType);

  const getCount = (cat: string) => {
    if (cat === "ทั้งหมด") return openJobs.length;
    return openJobs.filter((job) => job.helpType === cat).length;
  };

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">งานที่เปิดรับ</h1>
          <p className="mt-1 text-base text-slate-600">
            รายการคำขอจากผู้สูงอายุในพื้นที่ที่กำลังรอ อสม. เข้าไปช่วยเหลือ
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-bold text-blue-900 self-start sm:self-auto">
          <span className="size-2 rounded-full bg-blue-600 animate-pulse" aria-hidden="true" />
          <span>มีงานเปิดรับ {filteredJobs.length} รายการ</span>
        </div>
      </div>

      {/* Select Tab Bar */}
      <div className="rounded-2xl border border-blue-200/90 bg-blue-50/70 p-2 shadow-2xs">
        <div
          role="tablist"
          aria-label="ตัวกรองประเภทงาน"
          className="flex gap-2 overflow-x-auto scrollbar-none"
        >
          {categories.map((cat) => {
            const isActive = selectedType === cat;
            const count = getCount(cat);

            return (
              <button
                key={cat}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setSelectedType(cat)}
                className={`group flex min-h-12 shrink-0 items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98] ${
                  isActive
                    ? "bg-blue-700 text-white shadow-xs ring-1 ring-blue-600"
                    : "border border-blue-200 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-100/50 hover:text-blue-950"
                }`}
              >
                <span>{cat}</span>
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

      {/* Jobs Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <article
            key={job.id}
            className="flex flex-col justify-between rounded-3xl border-2 border-blue-100 bg-white p-5 shadow-xs transition hover:border-blue-300 hover:shadow-md"
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    รหัสงาน {job.id}
                  </span>
                  <h2 className="mt-1 text-2xl font-black text-slate-950">{job.helpType}</h2>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-800">
                  <span className="size-1.5 rounded-full bg-blue-600" aria-hidden="true" />
                  เปิดรับงาน
                </span>
              </div>

              <dl className="mt-4 space-y-2.5 text-sm text-slate-700">
                <div className="flex items-start gap-2">
                  <svg className="size-4 shrink-0 text-slate-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 14" />
                  </svg>
                  <div>
                    <dt className="sr-only">วันและเวลา</dt>
                    <dd className="font-bold text-slate-900">{job.date}, {job.time}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <svg className="size-4 shrink-0 text-slate-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <dt className="sr-only">พื้นที่</dt>
                    <dd className="font-medium text-slate-800">{job.area}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <svg className="size-4 shrink-0 text-slate-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="5" r="2" />
                    <path d="m9 20 3-6 3 6" />
                    <path d="m6 8 6 2 6-2" />
                    <path d="M12 10v4" />
                  </svg>
                  <div>
                    <dt className="sr-only">การเคลื่อนไหว</dt>
                    <dd className="font-medium text-slate-800">{job.mobilityRequirement}</dd>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <svg className="size-4 shrink-0 text-slate-400 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="2" y1="12" x2="22" y2="12" />
                  </svg>
                  <div>
                    <dt className="sr-only">ระยะทาง</dt>
                    <dd className="font-semibold text-blue-900">ห่างออกไปประมาณ {job.distance}</dd>
                  </div>
                </div>
              </dl>
            </div>

            <Link
              className="mt-6 flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 text-base font-bold text-white transition hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98]"
              href={`/buddy/open-jobs/${job.id}`}
            >
              ดูรายละเอียดงาน →
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}

