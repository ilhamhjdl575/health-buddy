import Link from "next/link";
import { getAcceptedJobDetails } from "@/app/_lib/accepted-job-details";
import { myJobs, statusLabels } from "@/app/_lib/my-jobs";

export default function MyJobsPage() {
  return (
    <section className="mx-auto max-w-5xl">
      <h1 className="text-3xl font-bold text-slate-950">งานของฉัน</h1>
      <p className="mt-3 text-lg leading-8 text-slate-700">งานที่คุณรับแล้วและกำลังดูแล</p>
      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {myJobs.map((job) => {
          const details = getAcceptedJobDetails(job.id);
          if (!details) return null;
          return <article className="rounded-3xl border-2 border-blue-100 bg-white p-5 shadow-sm" key={job.id}>
            <p className="text-base font-bold text-blue-800">รหัสงาน {job.id}</p>
            <h2 className="mt-2 text-2xl font-bold text-slate-950">{job.helpType}</h2>
            <p className="mt-3 text-lg font-semibold text-slate-800">{job.date}, {job.time}</p>
            <dl className="mt-5 space-y-3 text-lg">
              <div><dt className="font-semibold text-slate-600">ผู้รับบริการ</dt><dd className="font-bold">{details.recipientName}</dd></div>
              <div><dt className="font-semibold text-slate-600">จุดรับ</dt><dd className="font-bold">{details.pickup}</dd></div>
              <div><dt className="font-semibold text-slate-600">จุดหมาย</dt><dd className="font-bold">{details.destination}</dd></div>
              <div><dt className="font-semibold text-slate-600">การเดินและการเคลื่อนไหว</dt><dd className="font-bold">{details.mobilityRequirement}</dd></div>
              <div><dt className="font-semibold text-slate-600">สถานะ</dt><dd className="font-bold text-blue-900">{statusLabels[job.status]}</dd></div>
            </dl>
            <Link className="mt-6 flex min-h-14 items-center justify-center rounded-xl bg-blue-700 px-5 text-lg font-bold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-800" href={`/buddy/my-jobs/${job.id}`}>ดูรายละเอียดงาน</Link>
          </article>;
        })}
      </div>
    </section>
  );
}
