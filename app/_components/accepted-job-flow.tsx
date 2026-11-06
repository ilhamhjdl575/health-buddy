"use client";

import Link from "next/link";
import { useState } from "react";
import { getAcceptedJobDetails } from "@/app/_lib/accepted-job-details";
import type { OpenJob } from "@/app/_lib/open-jobs";

export function AcceptedJobFlow({ job }: { job: OpenJob }) {
  const [accepted, setAccepted] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const privateDetails = accepted ? getAcceptedJobDetails(job.id) : undefined;

  return (
    <section className="mx-auto max-w-3xl rounded-3xl border-2 border-blue-100 bg-white p-6 shadow-sm sm:p-8">
      <p className="text-lg font-bold text-blue-800">รหัสงาน {job.id}</p>
      <h1 className="mt-2 text-3xl font-bold text-slate-950">รายละเอียดงานที่เปิดรับ</h1>
      <p className="mt-3 text-lg leading-8 text-slate-700">ข้อมูลสำหรับช่วยตัดสินใจรับงานเท่านั้น</p>

      <dl className="mt-7 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-lg">
        <div className="py-4"><dt className="font-semibold text-slate-600">ประเภทความช่วยเหลือ</dt><dd className="mt-1 text-xl font-bold">{job.helpType}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">วันที่</dt><dd className="mt-1 text-xl font-bold">{job.date}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">เวลา</dt><dd className="mt-1 text-xl font-bold">{job.time}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">พื้นที่โดยประมาณ</dt><dd className="mt-1 text-xl font-bold">{job.area}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">ระยะทางโดยประมาณ</dt><dd className="mt-1 text-xl font-bold">{job.distance}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">การเดินและการเคลื่อนไหว</dt><dd className="mt-1 text-xl font-bold">{job.mobilityRequirement}</dd></div>
        <div className="py-4"><dt className="font-semibold text-slate-600">สถานะงาน</dt><dd className="mt-1 text-xl font-bold">{accepted ? "รับงานแล้ว" : "เปิดรับงาน"}</dd></div>
      </dl>

      {!accepted ? (
        <div className="mt-7">
          <p className="text-lg font-semibold text-slate-800">เมื่อกดรับงานแล้ว จะแสดงข้อมูลและเบอร์โทรติดต่อผู้รับบริการ</p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <button className="min-h-16 rounded-2xl bg-blue-700 px-7 text-xl font-bold text-white shadow-sm hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-blue-800" onClick={() => { setAccepted(true); setSkipped(false); }} type="button">กดรับงานนี้</button>
            <button className="min-h-16 rounded-2xl border-2 border-slate-500 bg-white px-7 text-xl font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-slate-700" onClick={() => setSkipped(true)} type="button">ยังไม่สะดวกรับงาน</button>
          </div>
          {skipped ? <p className="mt-4 rounded-xl border border-slate-300 bg-slate-50 p-4 text-lg font-bold text-slate-800" role="status">ข้ามงานนี้แล้ว (ยังไม่ได้รับงาน)</p> : null}
        </div>
      ) : null}

      {accepted && privateDetails ? (
        <section aria-labelledby="service-details-title" className="mt-8 rounded-3xl border-2 border-teal-200 bg-teal-50 p-5 sm:p-6">
          <h2 className="text-2xl font-bold text-teal-950" id="service-details-title">ข้อมูลผู้ขอความช่วยเหลือ</h2>
          <p className="mt-3 text-lg leading-8 text-slate-800">คุณรับงานนี้เรียบร้อยแล้ว แสดงข้อมูลติดต่อสำหรับการลงพื้นที่ช่วยเหลือ</p>
          <dl className="mt-6 divide-y divide-teal-200 rounded-2xl bg-white px-5 text-lg">
            <div className="py-4"><dt className="font-semibold text-slate-600">ชื่อผู้รับบริการ</dt><dd className="mt-1 text-xl font-bold">{privateDetails.recipientName}</dd></div>
            <div className="py-4"><dt className="font-semibold text-slate-600">อายุ</dt><dd className="mt-1 text-xl font-bold">{privateDetails.age} ปี</dd></div>
            <div className="py-4"><dt className="font-semibold text-slate-600">จุดรับ</dt><dd className="mt-1 text-xl font-bold">{privateDetails.pickup}</dd></div>
            <div className="py-4"><dt className="font-semibold text-slate-600">จุดหมาย</dt><dd className="mt-1 text-xl font-bold">{privateDetails.destination}</dd></div>
            <div className="py-4"><dt className="font-semibold text-slate-600">การเดินและการเคลื่อนไหว</dt><dd className="mt-1 text-xl font-bold">{privateDetails.mobilityRequirement}</dd></div>
            <div className="py-4"><dt className="font-semibold text-slate-600">ญาติหรือผู้ติดต่อฉุกเฉิน</dt><dd className="mt-1 text-xl font-bold">{privateDetails.emergencyContactName} · {privateDetails.emergencyContactRelation}</dd></div>
          </dl>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <a className="flex min-h-14 items-center justify-center rounded-xl bg-teal-700 px-5 text-lg font-bold text-white hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-800" href={`tel:${privateDetails.phone.replaceAll("-", "")}`}>โทรหาผู้รับบริการ</a>
            <a className="flex min-h-14 items-center justify-center rounded-xl border-2 border-teal-700 bg-white px-5 text-lg font-bold text-teal-800 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href={`tel:${privateDetails.emergencyContactPhone.replaceAll("-", "")}`}>โทรหาญาติ / ผู้ติดต่อฉุกเฉิน</a>
          </div>
          <Link className="mt-4 flex min-h-14 items-center justify-center rounded-xl border-2 border-blue-700 bg-white px-5 text-lg font-bold text-blue-800 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700" href="/buddy/my-jobs">ไปที่หน้ารายการงานของฉัน</Link>
        </section>
      ) : null}
    </section>
  );
}
