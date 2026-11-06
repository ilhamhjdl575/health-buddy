"use client";

import Link from "next/link";
import { useState } from "react";

type BookingStatus = "WAITING" | "ACCEPTED" | "COMPLETED";

interface UserBooking {
  id: string;
  serviceTitle: string;
  date: string;
  time: string;
  destination: string;
  pickup: string;
  status: BookingStatus;
  statusText: string;
  buddyName?: string;
  buddyPhone?: string;
}

const mockBookings: UserBooking[] = [
  {
    id: "BK-801",
    serviceTitle: "เดินทางไปโรงพยาบาลยะลา",
    date: "พรุ่งนี้, 10 พ.ย. 2026",
    time: "08:00 น.",
    pickup: "25 ถนนสุขใจ เขตเทศบาลเมืองยะลา",
    destination: "โรงพยาบาลยะลา (แผนกผู้ป่วยนอก)",
    status: "ACCEPTED",
    statusText: "อสม. รับงานแล้ว",
    buddyName: "อสม. อาหมัด",
    buddyPhone: "089-123-4567",
  },
  {
    id: "BK-802",
    serviceTitle: "นัดหมายพบแพทย์",
    date: "14 พ.ย. 2026",
    time: "10:30 น.",
    pickup: "25 ถนนสุขใจ เขตเทศบาลเมืองยะลา",
    destination: "คลินิกชุมชนอบอุ่น",
    status: "WAITING",
    statusText: "กำลังหา อสม. ในพื้นที่",
  },
  {
    id: "BK-799",
    serviceTitle: "ช่วยสื่อสารและประสานงานยา",
    date: "3 พ.ย. 2026",
    time: "09:00 น.",
    pickup: "25 ถนนสุขใจ เขตเทศบาลเมืองยะลา",
    destination: "ศูนย์บริการสาธารณสุขยะลา",
    status: "COMPLETED",
    statusText: "เสร็จสิ้นเรียบร้อย",
    buddyName: "อสม. ฟาติมะห์",
  },
];

interface FilterOption {
  id: string;
  label: string;
  statuses?: BookingStatus[];
  icon: (props: { className?: string }) => React.ReactNode;
}

const filterOptions: FilterOption[] = [
  {
    id: "all",
    label: "ทั้งหมด",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  {
    id: "active",
    label: "รอดำเนินการ",
    statuses: ["WAITING", "ACCEPTED"],
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    id: "completed",
    label: "เสร็จสิ้นแล้ว",
    statuses: ["COMPLETED"],
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    ),
  },
];

export function UserBookingsView() {
  const [activeTab, setActiveTab] = useState("all");

  const currentTab = filterOptions.find((tab) => tab.id === activeTab);
  const visibleBookings = currentTab?.statuses
    ? mockBookings.filter((b) => currentTab.statuses?.includes(b.status))
    : mockBookings;

  return (
    <div className="mx-auto max-w-3xl space-y-7 pb-8">
      {/* Page Title for Elderly */}
      <div>
        <p className="text-base font-bold text-teal-800 sm:text-lg">Health Buddy</p>
        <h1 className="mt-1 text-3xl font-black text-slate-950 sm:text-4xl">
          การจองของฉัน
        </h1>
        <p className="mt-2 text-lg text-slate-700 sm:text-xl">
          รายการคำขอความช่วยเหลือที่คุณลุงคุณป้าเคยแจ้งไว้
        </p>
      </div>

      {/* Select Tab Bar - High Accessibility for Elderly */}
      <div className="rounded-3xl border-2 border-teal-200/90 bg-teal-50/80 p-2 sm:p-2.5">
        <div
          role="tablist"
          aria-label="เลือกประเภทรายการจอง"
          className="flex gap-2 overflow-x-auto scrollbar-none"
        >
          {filterOptions.map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            const count = tab.statuses
              ? mockBookings.filter((b) => tab.statuses?.includes(b.status)).length
              : mockBookings.length;

            return (
              <button
                key={tab.id}
                role="tab"
                type="button"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`group flex min-h-16 flex-1 shrink-0 items-center justify-center gap-2.5 rounded-2xl px-4 py-3 text-base font-extrabold transition-all duration-150 focus-visible:outline-4 focus-visible:outline-teal-800 active:scale-[0.98] sm:text-lg ${
                  isActive
                    ? "bg-teal-800 text-white shadow-md ring-2 ring-teal-700"
                    : "border-2 border-teal-200/80 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-100/60"
                }`}
              >
                <Icon
                  className={`size-6 shrink-0 transition-colors ${
                    isActive ? "text-white" : "text-teal-700"
                  }`}
                />
                <span className="whitespace-nowrap">{tab.label}</span>
                <span
                  className={`inline-flex min-w-6 items-center justify-center rounded-full px-2 py-0.5 text-xs font-black sm:text-sm ${
                    isActive
                      ? "bg-teal-950 text-teal-200 border border-teal-600"
                      : "bg-teal-100 text-teal-900"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Bookings Card List */}
      <div className="space-y-5">
        {visibleBookings.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-xl font-bold text-slate-700">ไม่มีรายการในหมวดนี้</p>
            <button
              type="button"
              onClick={() => setActiveTab("all")}
              className="mt-4 inline-flex min-h-12 items-center rounded-xl bg-teal-800 px-5 text-base font-bold text-white hover:bg-teal-700"
            >
              ดูรายการทั้งหมด
            </button>
          </div>
        ) : (
          visibleBookings.map((booking) => {
            const isAccepted = booking.status === "ACCEPTED";
            const isWaiting = booking.status === "WAITING";
            const isCompleted = booking.status === "COMPLETED";

            return (
              <article
                key={booking.id}
                className="rounded-3xl border-2 border-teal-200/90 bg-white p-6 shadow-sm transition hover:border-teal-400 sm:p-7"
              >
                {/* Status Header */}
                <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-4">
                  <span className="font-mono text-sm font-bold text-slate-500">
                    รหัส {booking.id}
                  </span>
                  <span
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1 text-sm font-extrabold sm:text-base ${
                      isAccepted
                        ? "bg-teal-100 text-teal-950 border border-teal-300"
                        : isWaiting
                        ? "bg-amber-100 text-amber-950 border border-amber-300"
                        : "bg-slate-100 text-slate-700 border border-slate-200"
                    }`}
                  >
                    <span
                      className={`size-2.5 rounded-full ${
                        isAccepted
                          ? "bg-teal-600"
                          : isWaiting
                          ? "bg-amber-500 animate-pulse"
                          : "bg-slate-400"
                      }`}
                      aria-hidden="true"
                    />
                    <span>{booking.statusText}</span>
                  </span>
                </div>

                {/* Service Title */}
                <h2 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">
                  {booking.serviceTitle}
                </h2>

                {/* Date & Time Info in Big Font */}
                <div className="mt-4 rounded-2xl bg-teal-50/80 p-4 border border-teal-100">
                  <p className="text-sm font-bold text-teal-800">วันและเวลานัดหมาย</p>
                  <p className="mt-1 text-xl font-black text-slate-950 sm:text-2xl">
                    {booking.date} เวลา {booking.time}
                  </p>
                </div>

                {/* Destination & Pickup */}
                <dl className="mt-4 space-y-2 text-base sm:text-lg">
                  <div>
                    <dt className="font-bold text-slate-500">จุดรับ:</dt>
                    <dd className="font-bold text-slate-900">{booking.pickup}</dd>
                  </div>
                  <div>
                    <dt className="font-bold text-slate-500">จุดหมาย:</dt>
                    <dd className="font-bold text-slate-900">{booking.destination}</dd>
                  </div>
                </dl>

                {/* Buddy Info if assigned */}
                {booking.buddyName && (
                  <div className="mt-5 flex flex-col gap-3 rounded-2xl border-2 border-teal-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-xs font-bold text-teal-800 uppercase tracking-wider">
                        อสม. ผู้รับดูแลเคสนี้
                      </p>
                      <p className="text-xl font-black text-slate-950">{booking.buddyName}</p>
                    </div>

                    {booking.buddyPhone && (
                      <a
                        href={`tel:${booking.buddyPhone}`}
                        className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-teal-800 px-5 text-base font-extrabold text-white shadow-xs hover:bg-teal-700 active:scale-[0.98]"
                      >
                        <svg className="size-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>โทรหา อสม. ({booking.buddyPhone})</span>
                      </a>
                    )}
                  </div>
                )}

                {/* Follow up action if completed */}
                {isCompleted && (
                  <div className="mt-5">
                    <Link
                      href="/follow-up"
                      className="flex min-h-12 items-center justify-center rounded-xl border-2 border-teal-700 bg-white px-5 text-base font-extrabold text-teal-900 hover:bg-teal-50"
                    >
                      แจ้งผลการรับบริการ / ประเมินความพึงพอใจ →
                    </Link>
                  </div>
                )}
              </article>
            );
          })
        )}
      </div>

      {/* Button to request more help */}
      <div className="pt-2 text-center">
        <Link
          href="/booking"
          className="inline-flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-amber-400 px-6 text-xl font-black text-slate-950 shadow-md transition hover:bg-amber-500 focus-visible:outline-4 focus-visible:outline-teal-700 active:scale-[0.98]"
        >
          <span>ขอความช่วยเหลือใหม่ +</span>
        </Link>
      </div>
    </div>
  );
}

