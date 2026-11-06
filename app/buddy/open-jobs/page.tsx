import Link from "next/link";
import { openJobs } from "@/app/_lib/open-jobs";

export default function OpenJobsPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-950">งานที่เปิดรับ</h1>
      <p className="mt-3 text-lg leading-8 text-slate-700">ดูข้อมูลที่จำเป็นก่อนตัดสินใจรับงาน</p>
      <div className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {openJobs.map((job) => (
          <article className="rounded-3xl border-2 border-blue-100 bg-white p-5 shadow-sm" key={job.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-blue-800">รหัสงาน {job.id}</p>
                <h2 className="mt-2 text-2xl font-bold text-slate-950">{job.helpType}</h2>
              </div>
              <span className="rounded-full border border-blue-700 px-3 py-1 text-sm font-bold text-blue-800">เปิดรับงาน</span>
            </div>
            <dl className="mt-5 space-y-3 text-lg">
              <div><dt className="font-semibold text-slate-600">วันและเวลา</dt><dd className="font-bold text-slate-900">{job.date}, {job.time}</dd></div>
              <div><dt className="font-semibold text-slate-600">พื้นที่โดยประมาณ</dt><dd className="font-bold text-slate-900">{job.area}</dd></div>
              <div><dt className="font-semibold text-slate-600">ระยะทางโดยประมาณ</dt><dd className="font-bold text-slate-900">{job.distance}</dd></div>
              <div><dt className="font-semibold text-slate-600">การเดินและการเคลื่อนไหว</dt><dd className="font-bold text-slate-900">{job.mobilityRequirement}</dd></div>
            </dl>
            <Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-blue-700 px-5 text-lg font-bold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-800" href={`/buddy/open-jobs/${job.id}`}>ดูรายละเอียดงาน</Link>
          </article>
        ))}
      </div>
    </section>
  );
}
