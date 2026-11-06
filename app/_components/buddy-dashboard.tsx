"use client";

import Link from "next/link";
import { useState } from "react";

type BuddyStatus = "AVAILABLE" | "OFFLINE";

const summaryItems = [
  { label: "งานที่เปิดรับ", count: "3", href: "/buddy/open-jobs" },
  { label: "งานของฉันวันนี้", count: "1", href: "/buddy/my-jobs" },
  { label: "งานที่กำลังดำเนินการ", count: "0", href: "/buddy/today" },
];

const menuItems = [
  { label: "งานที่เปิดรับ", href: "/buddy/open-jobs" },
  { label: "งานของฉัน", href: "/buddy/my-jobs" },
  { label: "งานวันนี้", href: "/buddy/today" },
  { label: "ตั้งเวลาพร้อมรับงาน", href: "/buddy/availability" },
  { label: "ประวัติงาน", href: "/buddy/history" },
];

export function BuddyDashboard() {
  const [status, setStatus] = useState<BuddyStatus>("AVAILABLE");
  const isAvailable = status === "AVAILABLE";

  return (
    <div className="mx-auto max-w-5xl space-y-7 pb-6">
      <section aria-labelledby="buddy-welcome-title">
        <p className="text-lg font-bold text-blue-800">Health Buddy สำหรับ อสม.</p>
        <h1 className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl" id="buddy-welcome-title">สวัสดี อสม. อาหมัด</h1>
        <p className="mt-3 text-xl text-slate-700">วันนี้พร้อมช่วยเหลือหรือไม่?</p>
      </section>

      <section aria-labelledby="status-title" className="rounded-3xl border-2 border-blue-200 bg-white p-6 shadow-sm sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-950" id="status-title">สถานะความพร้อม</h2>
          <p className="mt-3 text-xl font-bold text-blue-900">{isAvailable ? "พร้อมรับงานช่วยเหลือ" : "พักรับงานชั่วคราว"}</p>
          <p className="mt-2 text-base text-slate-600">เมื่อเปิด &quot;พร้อมรับงาน&quot; ระบบจะส่งการแจ้งเตือนเมื่อมีผู้สูงอายุในพื้นที่ขอความช่วยเหลือ</p>
        </div>
        <button aria-pressed={isAvailable} className={`mt-5 min-h-16 rounded-2xl px-6 text-xl font-bold text-white shadow-sm focus-visible:outline-3 focus-visible:outline-offset-4 sm:mt-0 ${isAvailable ? "bg-slate-700 hover:bg-slate-800 focus-visible:outline-slate-800" : "bg-blue-700 hover:bg-blue-800 focus-visible:outline-blue-800"}`} onClick={() => setStatus(isAvailable ? "OFFLINE" : "AVAILABLE")} type="button">
          {isAvailable ? "กดเพื่อพักรับงาน" : "กดเปิดพร้อมรับงาน"}
        </button>
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
        <dl className="mt-5 grid gap-4 text-lg sm:grid-cols-2">
          <div><dt className="font-semibold text-slate-600">วันและเวลา</dt><dd className="mt-1 text-xl font-bold">10 พ.ย. 2026, 08:00 - 09:00</dd></div>
          <div><dt className="font-semibold text-slate-600">ประเภทงาน</dt><dd className="mt-1 text-xl font-bold">เดินทาง</dd></div>
          <div><dt className="font-semibold text-slate-600">พื้นที่โดยประมาณ</dt><dd className="mt-1 text-xl font-bold">เขตเทศบาลเมืองยะลา</dd></div>
          <div><dt className="font-semibold text-slate-600">การเดิน / การเคลื่อนไหว</dt><dd className="mt-1 text-xl font-bold">ใช้ไม้เท้าช่วยเดิน</dd></div>
          <div><dt className="font-semibold text-slate-600">สถานะ</dt><dd className="mt-1 text-xl font-bold">เปิดรับงาน</dd></div>
        </dl>
      </section>

      <section aria-labelledby="buddy-menu-title">
        <h2 className="text-2xl font-bold text-slate-950" id="buddy-menu-title">เมนูสำหรับ อสม.</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => <Link className="flex min-h-16 items-center rounded-2xl border-2 border-slate-200 bg-white px-5 text-xl font-bold text-slate-900 shadow-sm hover:border-blue-500 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href={item.href} key={item.href}>{item.label}</Link>)}
        </div>
      </section>
    </div>
  );
}
