"use client";

import Link from "next/link";
import { useState } from "react";
import { getAcceptedJobDetails } from "@/app/_lib/accepted-job-details";
import { statusLabels, type MyJob, type MyJobStatus } from "@/app/_lib/my-jobs";

const nextSteps: Record<Exclude<MyJobStatus, "COMPLETED">, { status: MyJobStatus; action: string }> = {
  ACCEPTED: { status: "ON_THE_WAY", action: "เริ่มเดินทาง" },
  ON_THE_WAY: { status: "ARRIVED", action: "ถึงจุดรับแล้ว" },
  ARRIVED: { status: "IN_SERVICE", action: "เริ่มให้ความช่วยเหลือ" },
  IN_SERVICE: { status: "COMPLETED", action: "เสร็จสิ้นงาน" },
};

export function MyJobDetailFlow({ job }: { job: MyJob }) {
  const [status, setStatus] = useState<MyJobStatus>(job.status);
  const [pendingStatus, setPendingStatus] = useState<MyJobStatus | null>(null);
  const details = getAcceptedJobDetails(job.id);
  const nextStep = status === "COMPLETED" ? undefined : nextSteps[status];

  if (!details) {
    return null;
  }

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border-2 border-blue-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-lg font-bold text-blue-800">รหัสงาน {job.id}</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">รายละเอียดงานของฉัน</h1>
      <dl className="mt-7 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-lg">
        <div className="py-4"><dt className="font-semibold text-slate-600">ประเภทงาน</dt><dd className="mt-1 text-xl font-bold">{job.helpType}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">วันและเวลา</dt><dd className="mt-1 text-xl font-bold">{job.date}, {job.time}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">ชื่อผู้รับบริการ</dt><dd className="mt-1 text-xl font-bold">{details.recipientName}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">อายุ</dt><dd className="mt-1 text-xl font-bold">{details.age} ปี</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">จุดรับ</dt><dd className="mt-1 text-xl font-bold">{details.pickup}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">จุดหมาย</dt><dd className="mt-1 text-xl font-bold">{details.destination}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">การเดินและการเคลื่อนไหว</dt><dd className="mt-1 text-xl font-bold">{details.mobilityRequirement}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">ญาติหรือผู้ติดต่อฉุกเฉิน</dt><dd className="mt-1 text-xl font-bold">{details.emergencyContactName} · {details.emergencyContactRelation}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">สถานะปัจจุบัน</dt><dd className="mt-1 text-xl font-bold text-blue-900">{statusLabels[status]}</dd></div>
      </dl>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <a className="flex min-h-14 items-center justify-center rounded-xl bg-teal-700 px-5 text-lg font-bold text-white hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-800" href={`tel:${details.phone.replaceAll("-", "")}`}>โทรหาผู้รับบริการ</a>
        <a className="flex min-h-14 items-center justify-center rounded-xl border-2 border-teal-700 bg-white px-5 text-lg font-bold text-teal-800 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`tel:${details.emergencyContactPhone.replaceAll("-", "")}`}>โทรหาญาติ / ผู้ติดต่อฉุกเฉิน</a>
      </div>

      {nextStep ? <button className="mt-7 min-h-16 w-full rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white shadow-sm hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-blue-800" onClick={() => setPendingStatus(nextStep.status)} type="button">{nextStep.action}</button> : null}

      {pendingStatus && nextStep ? (
        <section aria-labelledby="confirm-status-title" className="mt-6 rounded-2xl border-2 border-blue-300 bg-blue-50 p-5" role="alertdialog">
          <h2 className="text-xl font-bold text-slate-950" id="confirm-status-title">ยืนยันการเปลี่ยนสถานะ</h2>
          <p className="mt-2 text-lg text-slate-800">ต้องการเปลี่ยนสถานะเป็น “{statusLabels[pendingStatus]}” ใช่หรือไม่?</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            <button className="min-h-14 rounded-xl bg-blue-700 px-5 text-lg font-bold text-white hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-800" onClick={() => { setStatus(pendingStatus); setPendingStatus(null); }} type="button">ยืนยัน</button>
            <button className="min-h-14 rounded-xl border-2 border-slate-500 bg-white px-5 text-lg font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-700" onClick={() => setPendingStatus(null)} type="button">ยกเลิก</button>
          </div>
        </section>
      ) : null}

      {status === "COMPLETED" ? <section className="mt-7 rounded-2xl border-2 border-teal-200 bg-teal-50 p-5"><p className="text-xl font-bold text-teal-950">งานนี้เสร็จสิ้นแล้ว</p><p className="mt-2 text-lg text-slate-800">บันทึกการช่วยเหลือเรียบร้อยแล้ว ขอบคุณที่ร่วมดูแลผู้สูงอายุในชุมชน</p><Link className="mt-5 inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-teal-700 bg-white px-5 text-lg font-bold text-teal-800 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/buddy">กลับหน้าหลัก อสม.</Link></section> : null}

      <Link className="mt-7 inline-flex min-h-14 items-center justify-center rounded-xl border-2 border-blue-700 bg-white px-6 text-lg font-bold text-blue-800 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href="/buddy/my-jobs">กลับไปหน้ารวมงานของฉัน</Link>
    </section>
  );
}
