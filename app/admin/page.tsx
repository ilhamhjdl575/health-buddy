import Link from "next/link";
import { adminCases, adminSummary, caseStatusLabels } from "@/app/_lib/admin-cases";

export default function AdminDashboardPage() {
  const attentionCases = adminCases.filter((caseItem) => caseItem.attentionReason).slice(0, 4);

  return (
    <section className="mx-auto max-w-6xl space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-teal-600" aria-hidden="true" />
          <p className="text-xs font-bold tracking-wider text-teal-800 uppercase">ระบบจัดการกลาง</p>
        </div>
        <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950">ภาพรวมระบบ</h1>
        <p className="mt-1 text-base text-slate-600">
          สรุปข้อมูลสถานะงานและเคสการดูแลของ Health Buddy ประจำวัน
        </p>
      </div>

      {/* Summary Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {adminSummary.map((item) => (
          <Link
            key={item.status}
            href="/admin/cases"
            className="group rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-teal-300 hover:shadow-md"
          >
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-600 group-hover:text-teal-900 transition-colors">
                {item.label}
              </p>
              <span className="flex size-8 items-center justify-center rounded-lg bg-teal-50 text-teal-700 group-hover:bg-teal-100 transition-colors">
                <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14" />
                  <path d="m12 5 7 7-7 7" />
                </svg>
              </span>
            </div>
            <p className="mt-3 text-4xl font-extrabold text-slate-950 group-hover:text-teal-800 transition-colors">
              {item.count}
            </p>
          </Link>
        ))}
      </div>

      {/* Attention Cases */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-950">เคสที่ต้องดูแลเร่งด่วน</h2>
            <p className="text-sm text-slate-600">เคสที่ยังไม่มี อสม. หรือต้องการการประสานงานพิเศษ</p>
          </div>
          <Link
            href="/admin/cases"
            className="text-sm font-bold text-teal-800 hover:text-teal-950 transition-colors"
          >
            ดูเคสทั้งหมด →
          </Link>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {attentionCases.map((caseItem) => (
            <article
              key={caseItem.id}
              className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-teal-300 hover:shadow-md"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono text-xs font-bold text-slate-500 uppercase tracking-wider">
                    รหัส {caseItem.id}
                  </span>
                  <span className="rounded-full border border-teal-200 bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800">
                    {caseStatusLabels[caseItem.status]}
                  </span>
                </div>

                <h3 className="mt-2 text-xl font-bold text-slate-950">{caseItem.helpType}</h3>

                <p className="mt-2 text-sm text-slate-600">
                  {caseItem.date}, {caseItem.time} · {caseItem.area}
                </p>

                <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50/70 p-3 text-xs text-amber-900 flex items-start gap-2">
                  <svg className="size-4 shrink-0 text-amber-600 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  <span><strong>สาเหตุที่ต้องดูแล:</strong> {caseItem.attentionReason}</span>
                </div>
              </div>

              <Link
                href={`/admin/cases/${caseItem.id}`}
                className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-800 px-4 text-sm font-bold text-white shadow-xs transition-colors hover:bg-teal-700 active:scale-[0.99]"
              >
                ดูรายละเอียดเคส →
              </Link>
            </article>
          ))}
        </div>
      </section>
    </section>
  );
}
