"use client";

import Link from "next/link";
import { useState } from "react";
import { caseStatusLabels, type AdminCase } from "@/app/_lib/admin-cases";

export function AdminCaseDetail({ caseItem }: { caseItem: AdminCase }) {
  const [message, setMessage] = useState("");
  const showMatchingActions = caseItem.status === "MATCHING" || caseItem.status === "NO_BUDDY_FOUND";

  return (
    <section className="mx-auto max-w-4xl rounded-3xl border border-slate-200/90 bg-white p-6 shadow-sm sm:p-8">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-teal-800 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">
            รหัสเคส {caseItem.id}
          </span>
          <h1 className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl">
            รายละเอียดเคส: {caseItem.helpType}
          </h1>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-sm font-bold text-teal-900">
          <span className="size-2 rounded-full bg-teal-600" aria-hidden="true" />
          {caseStatusLabels[caseItem.status]}
        </span>
      </div>

      {/* Case Details Grid */}
      <dl className="mt-6 grid gap-5 text-sm sm:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <dt className="font-semibold text-slate-500">ประเภทงาน</dt>
          <dd className="mt-1 text-lg font-bold text-slate-900">{caseItem.helpType}</dd>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <dt className="font-semibold text-slate-500">วันและเวลานัดหมาย</dt>
          <dd className="mt-1 text-lg font-bold text-slate-900">{caseItem.date}, {caseItem.time}</dd>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <dt className="font-semibold text-slate-500">ผู้รับบริการ</dt>
          <dd className="mt-1 text-lg font-bold text-slate-900">{caseItem.recipient.name} ({caseItem.recipient.age} ปี)</dd>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <dt className="font-semibold text-slate-500">เบอร์โทรศัพท์ติดต่อ</dt>
          <dd className="mt-1 text-lg font-bold text-slate-900">{caseItem.recipient.phone}</dd>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <dt className="font-semibold text-slate-500">จุดรับ</dt>
          <dd className="mt-1 text-base font-bold text-slate-900">{caseItem.recipient.pickup}</dd>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <dt className="font-semibold text-slate-500">จุดหมายปลายทาง</dt>
          <dd className="mt-1 text-base font-bold text-slate-900">{caseItem.recipient.destination}</dd>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <dt className="font-semibold text-slate-500">ข้อมูลการเคลื่อนไหว</dt>
          <dd className="mt-1 text-base font-bold text-slate-900">{caseItem.recipient.mobility}</dd>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
          <dt className="font-semibold text-slate-500">อสม. ที่รับงาน</dt>
          <dd className="mt-1 text-base font-bold text-teal-800">{caseItem.buddy ?? "ยังไม่มี อสม. รับงาน"}</dd>
        </div>
      </dl>

      {/* Timeline */}
      <section className="mt-8 border-t border-slate-100 pt-6">
        <h2 className="text-xl font-bold text-slate-950">ลำดับเหตุการณ์การดำเนินงาน</h2>
        <ol className="mt-4 space-y-4 border-l-2 border-teal-200 pl-5">
          {caseItem.timeline.map((event, index) => (
            <li key={`${event.status}-${index}`} className="relative">
              <span className="absolute -left-[27px] top-1.5 size-3 rounded-full border-2 border-white bg-teal-600" aria-hidden="true" />
              <p className="font-bold text-slate-900">{caseStatusLabels[event.status]}</p>
              <p className="text-xs text-slate-500">{event.dateTime}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Action buttons */}
      {showMatchingActions && (
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <button
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl bg-teal-800 px-5 text-base font-bold text-white shadow-xs transition-colors hover:bg-teal-700 active:scale-[0.99]"
            onClick={() => setMessage("ระบบบันทึกความจำนงแล้ว — จะเชื่อมกับระบบจับคู่จริงในขั้นตอนถัดไป")}
            type="button"
          >
            ช่วยเลือก อสม.
          </button>
          <button
            className="flex min-h-12 flex-1 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-base font-bold text-slate-800 shadow-xs transition-colors hover:border-teal-300 hover:bg-teal-50 active:scale-[0.99]"
            onClick={() => setMessage("ระบบส่งสัญญาณค้นหา อสม. เพิ่มเติมแล้ว")}
            type="button"
          >
            ลองค้นหาใหม่
          </button>
        </div>
      )}

      {caseItem.buddy && (
        <div className="mt-8">
          <button
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-base font-bold text-slate-800 shadow-xs transition-colors hover:border-teal-300 hover:bg-teal-50 active:scale-[0.99]"
            onClick={() => setMessage("ฟังก์ชันการเปลี่ยน อสม. จะเปิดใช้งานเมื่อเชื่อมต่อระบบจับคู่จริง")}
            type="button"
          >
            เปลี่ยน อสม.
          </button>
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold text-teal-900" role="status">
          {message}
        </div>
      )}

      {/* Back button */}
      <div className="mt-8 border-t border-slate-100 pt-6">
        <Link
          className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-bold text-slate-700 hover:bg-slate-100 transition-colors"
          href="/admin/cases"
        >
          ← กลับไปเคสทั้งหมด
        </Link>
      </div>
    </section>
  );
}
