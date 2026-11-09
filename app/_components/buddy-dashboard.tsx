import Link from "next/link";
import type { MyJobSummary } from "@/lib/buddy/assignments";
import { SERVICE_LABELS, type ServiceType } from "@/app/_lib/services";

const menuItems = [
  { label: "งานที่เปิดรับ", href: "/buddy/open-jobs" },
  { label: "งานของฉัน", href: "/buddy/my-jobs" },
  { label: "งานวันนี้", href: "/buddy/today" },
  { label: "เวลาพร้อมรับงาน", href: "/buddy/availability" },
  { label: "ประวัติงาน", href: "/buddy/history" },
  { label: "ติดตามผล", href: "/buddy/follow-up" },
  { label: "ข้อมูลส่วนตัว", href: "/buddy/profile" },
];

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "รอการตอบรับ",
  OPEN: "เปิดรับงาน",
  MATCHING: "รอการตอบรับ",
  ACCEPTED: "รับงานแล้ว",
  ON_THE_WAY: "กำลังเดินทาง",
  ARRIVED: "ถึงจุดรับแล้ว",
  IN_PROGRESS: "กำลังช่วยเหลือ",
  COMPLETED: "เสร็จสิ้นงาน",
  CANCELLED: "ยกเลิกแล้ว",
};

export function BuddyDashboard({ name, pendingCount, acceptedCount, todayCount, nextJob }: {
  name: string;
  pendingCount: number;
  acceptedCount: number;
  todayCount: number;
  nextJob: MyJobSummary | null;
}) {
  const summaryItems = [
    { label: "งานที่รอการตอบรับ", count: pendingCount, href: "/buddy/open-jobs" },
    { label: "งานของฉัน", count: acceptedCount, href: "/buddy/my-jobs" },
    { label: "งานของฉันวันนี้", count: todayCount, href: "/buddy/today" },
  ];
  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-6">
      <section aria-labelledby="buddy-welcome-title">
        <p className="text-lg font-bold text-blue-800">Health Buddy สำหรับผู้ดูแลชุมชน</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl" id="buddy-welcome-title">สวัสดีคุณ {name}</h1>
        <p className="mt-3 text-xl text-slate-700">ดูงานและการช่วยเหลือของคุณวันนี้</p>
      </section>

      <section aria-labelledby="today-summary-title">
        <h2 className="text-2xl font-bold text-slate-950" id="today-summary-title">สรุปงานวันนี้</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {summaryItems.map((item) => (
            <Link className="rounded-2xl border-2 border-blue-100 bg-white p-5 shadow-sm hover:border-blue-400 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href={item.href} key={item.href}>
              <p className="text-base font-semibold text-slate-600">{item.label}</p>
              <p className="mt-2 text-4xl font-bold text-blue-900">{item.count}</p>
              <span className="mt-3 inline-block text-base font-bold text-blue-800">ดูรายละเอียด</span>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="next-job-title" className="rounded-3xl border border-blue-200 bg-blue-50 p-6">
        <h2 className="text-2xl font-bold text-slate-950" id="next-job-title">งานถัดไป</h2>
        {nextJob ? <dl className="mt-5 grid gap-4 text-lg sm:grid-cols-2">
          <div><dt className="font-semibold text-slate-600">วันและเวลา</dt><dd className="mt-1 text-xl font-bold">{nextJob.serviceDate}, {nextJob.startTime}{nextJob.endTime ? ` - ${nextJob.endTime}` : ""}</dd></div>
          <div><dt className="font-semibold text-slate-600">ประเภทงาน</dt><dd className="mt-1 text-xl font-bold">{SERVICE_LABELS[nextJob.serviceType as ServiceType] ?? nextJob.serviceType}</dd></div>
          <div><dt className="font-semibold text-slate-600">ผู้รับบริการ</dt><dd className="mt-1 text-xl font-bold">{nextJob.recipientName}</dd></div>
          <div><dt className="font-semibold text-slate-600">สถานะ</dt><dd className="mt-1 text-xl font-bold">{STATUS_LABELS[nextJob.requestStatus] ?? nextJob.requestStatus}</dd></div>
        </dl> : <p className="mt-4 text-lg text-slate-700">ยังไม่มีงานที่ตอบรับไว้</p>}
      </section>

      <section aria-labelledby="buddy-menu-title">
        <h2 className="text-2xl font-bold text-slate-950" id="buddy-menu-title">เมนูสำหรับผู้ดูแล</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => <Link className="flex min-h-16 items-center rounded-2xl border-2 border-slate-200 bg-white px-5 text-xl font-bold text-slate-900 shadow-sm hover:border-blue-500 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href={item.href} key={item.href}>{item.label}</Link>)}
        </div>
      </section>
    </div>
  );
}
