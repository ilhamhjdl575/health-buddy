import Link from "next/link";
import type { MyJobSummary } from "@/lib/buddy/assignments";
import { SERVICE_LABELS, type ServiceType } from "@/app/_lib/services";
import { JOB_STATUS_LABELS } from "@/app/_components/buddy-my-jobs-view";

const STATUS_BADGE_CLASSES: Record<string, string> = {
  ACCEPTED: "bg-indigo-50 text-indigo-800 border-indigo-300",
  ON_THE_WAY: "bg-purple-50 text-purple-800 border-purple-300",
  ARRIVED: "bg-cyan-50 text-cyan-800 border-cyan-300",
  IN_PROGRESS: "bg-emerald-50 text-emerald-800 border-emerald-300",
  COMPLETED: "bg-slate-100 text-slate-700 border-slate-300",
};

export function BuddyTodayView({ jobs }: { jobs: MyJobSummary[] }) {
  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950 sm:text-4xl">งานช่วยเหลือวันนี้</h1>
          <p className="mt-1 text-base text-slate-600">
            ตารางงานที่คุณมีนัดหมายไปช่วยเหลือผู้สูงอายุในวันนี้
          </p>
        </div>
        <div className="inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-3.5 py-1.5 text-sm font-bold text-blue-900 self-start sm:self-auto">
          <span>{jobs.length} งานวันนี้</span>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-blue-200 bg-white p-10 text-center">
          <p className="text-lg font-bold text-slate-700">วันนี้ยังไม่มีนัดหมายงานช่วยเหลือ</p>
          <p className="mt-1 text-sm text-slate-500">
            คุณสามารถตรวจสอบงานที่รับไว้ในวันอื่น หรือค้นหางานใหม่ที่เปิดรับได้
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link
              href="/buddy/my-jobs"
              className="inline-flex min-h-12 items-center rounded-xl bg-blue-700 px-5 text-base font-bold text-white hover:bg-blue-800"
            >
              ดูงานของฉันทั้งหมด
            </Link>
            <Link
              href="/buddy/open-jobs"
              className="inline-flex min-h-12 items-center rounded-xl border-2 border-blue-700 bg-white px-5 text-base font-bold text-blue-800 hover:bg-blue-50"
            >
              ดูงานใหม่ที่เปิดรับ
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => {
            const badgeClass =
              STATUS_BADGE_CLASSES[job.requestStatus] ??
              "bg-slate-100 text-slate-700 border-slate-300";
            const label = JOB_STATUS_LABELS[job.requestStatus] ?? job.requestStatus;

            return (
              <article
                key={job.requestId}
                className="flex flex-col justify-between rounded-3xl border-2 border-blue-100 bg-white p-6 shadow-sm transition hover:border-blue-300 sm:flex-row sm:items-center"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h2 className="text-xl font-black text-slate-950 sm:text-2xl">
                      {SERVICE_LABELS[job.serviceType as ServiceType] ?? job.serviceType}
                    </h2>
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-0.5 text-xs font-bold ${badgeClass}`}
                    >
                      {label}
                    </span>
                  </div>

                  <p className="mt-2 text-base font-bold text-blue-900">
                    เวลานัดหมาย: {job.startTime}
                    {job.endTime ? ` - ${job.endTime}` : ""}
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    <span className="font-semibold text-slate-500">ผู้รับบริการ: </span>
                    <span className="font-bold text-slate-900">{job.recipientName}</span>
                  </p>
                </div>

                <div className="mt-4 sm:mt-0">
                  <Link
                    href={`/buddy/my-jobs/${job.requestId}`}
                    className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 text-base font-bold text-white hover:bg-blue-800 focus-visible:outline-2 focus-visible:outline-blue-700"
                  >
                    เปิดขั้นตอนทำงาน →
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
