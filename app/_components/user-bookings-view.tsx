import Link from "next/link";
import { SERVICE_LABELS } from "@/app/_lib/services";
import type { BookingListItem } from "@/lib/booking/actions";

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "รอการตอบรับ",
  OPEN: "รอเลือกผู้ดูแล",
  MATCHING: "รอผู้ดูแลยืนยัน",
  ACCEPTED: "ผู้ดูแลรับงานแล้ว",
  ON_THE_WAY: "ผู้ดูแลกำลังเดินทาง",
  ARRIVED: "ผู้ดูแลถึงจุดรับแล้ว",
  IN_PROGRESS: "กำลังให้ความช่วยเหลือ",
  COMPLETED: "เสร็จสิ้น",
};

const STATUS_BADGE_CLASSES: Record<string, string> = {
  OPEN: "bg-amber-100 text-amber-900 border-amber-300",
  MATCHING: "bg-blue-100 text-blue-900 border-blue-300",
  ACCEPTED: "bg-indigo-100 text-indigo-900 border-indigo-300",
  ON_THE_WAY: "bg-purple-100 text-purple-900 border-purple-300",
  ARRIVED: "bg-cyan-100 text-cyan-900 border-cyan-300",
  IN_PROGRESS: "bg-emerald-100 text-emerald-900 border-emerald-300",
  COMPLETED: "bg-slate-100 text-slate-800 border-slate-300",
};

export function UserBookingsView({ bookings }: { bookings: BookingListItem[] }) {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-950">การจองของฉัน</h1>
        <p className="mt-1 text-base text-slate-600">รายการคำขอรับบริการและสถานะการช่วยเหลือ</p>
      </div>

      {bookings.length ? (
        <div className="space-y-4">
          {bookings.map((b) => {
            const badgeClass = STATUS_BADGE_CLASSES[b.status] ?? "bg-slate-100 text-slate-800 border-slate-300";
            const label = STATUS_LABELS[b.status] ?? b.status;

            return (
              <article
                key={b.id}
                className="rounded-2xl border-2 border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="text-xl font-bold text-slate-900">
                    {SERVICE_LABELS[b.serviceType] ?? b.serviceType}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full border px-3 py-1 text-sm font-bold ${badgeClass}`}
                  >
                    {label}
                  </span>
                </div>

                <div className="mt-3 space-y-1 text-base text-slate-700">
                  <p>
                    <span className="font-semibold text-slate-500">ผู้รับบริการ:</span> {b.recipientName}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">วันและเวลานัดหมาย:</span> {b.serviceDate} {b.startTime}
                    {b.endTime ? ` - ${b.endTime}` : ""}
                  </p>
                  <p>
                    <span className="font-semibold text-slate-500">จุดรับ:</span> {b.pickupAddress}
                  </p>
                  {b.destinationAddress && (
                    <p>
                      <span className="font-semibold text-slate-500">จุดหมาย:</span> {b.destinationAddress}
                    </p>
                  )}
                </div>

                {b.status === "OPEN" && (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <Link
                      href={`/my-bookings/${b.id}/select-buddy`}
                      className="inline-flex min-h-11 items-center justify-center rounded-xl bg-teal-700 px-5 text-base font-bold text-white hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                    >
                      เลือกผู้ดูแล
                    </Link>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <p className="text-lg text-slate-600">ยังไม่มีรายการจอง</p>
          <Link
            href="/booking"
            className="mt-4 inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-5 text-base font-bold text-white hover:bg-blue-800"
          >
            สร้างการจองใหม่
          </Link>
        </div>
      )}
    </section>
  );
}
