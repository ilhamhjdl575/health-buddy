"use client";
import Link from "next/link";
import { useState } from "react";
import { caseStatusLabels, type AdminCase, type CaseStatus } from "@/app/_lib/admin-cases";

const filters: { label: string; statuses?: CaseStatus[] }[] = [
  { label: "ทั้งหมด" }, { label: "รอหา อสม.", statuses: ["REQUESTED", "MATCHING", "OPEN"] }, { label: "กำลังดำเนินการ", statuses: ["ACCEPTED", "ON_THE_WAY", "ARRIVED", "IN_SERVICE"] }, { label: "ติดตามผล", statuses: ["FOLLOW_UP"] }, { label: "เสร็จสิ้น", statuses: ["COMPLETED", "CLOSED"] }, { label: "มีปัญหา", statuses: ["CANCELLED", "NO_BUDDY_FOUND"] },
];

export function AdminCasesList({ cases }: { cases: AdminCase[] }) {
  const [activeFilter, setActiveFilter] = useState("ทั้งหมด");
  const currentFilter = filters.find((filter) => filter.label === activeFilter);
  const visibleCases = currentFilter?.statuses ? cases.filter((caseItem) => currentFilter.statuses?.includes(caseItem.status)) : cases;
  return <div className="mx-auto max-w-6xl"><h1 className="text-3xl font-bold text-slate-950">เคสทั้งหมด</h1><div aria-label="ตัวกรองเคส" className="mt-5 flex gap-3 overflow-x-auto pb-2">{filters.map((filter) => <button aria-pressed={activeFilter === filter.label} className={`min-h-12 shrink-0 rounded-xl border-2 px-4 text-lg font-bold focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-900 ${activeFilter === filter.label ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-800 hover:bg-slate-100"}`} key={filter.label} onClick={() => setActiveFilter(filter.label)} type="button">{filter.label}</button>)}</div><p className="mt-4 text-lg text-slate-700">พบ {visibleCases.length} เคส</p><div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{visibleCases.map((caseItem) => <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" key={caseItem.id}><p className="font-bold text-slate-600">รหัสเคส {caseItem.id}</p><h2 className="mt-2 text-2xl font-bold">{caseItem.helpType}</h2><dl className="mt-4 space-y-2 text-lg"><div><dt className="font-semibold text-slate-600">วันและเวลา</dt><dd>{caseItem.date}, {caseItem.time}</dd></div><div><dt className="font-semibold text-slate-600">พื้นที่</dt><dd>{caseItem.area}</dd></div><div><dt className="font-semibold text-slate-600">อสม.</dt><dd>{caseItem.buddy ?? "ยังไม่มี อสม. รับงาน"}</dd></div><div><dt className="font-semibold text-slate-600">สถานะ</dt><dd className="font-bold">{caseStatusLabels[caseItem.status]}</dd></div></dl><Link className="mt-5 flex min-h-12 items-center justify-center rounded-xl bg-slate-900 px-4 text-lg font-bold text-white hover:bg-slate-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-900" href={`/admin/cases/${caseItem.id}`}>ดูเคส</Link></article>)}</div></div>;
}
