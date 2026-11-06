"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const helpTypes = [
  "โทร / ช่วยติดต่อ",
  "นัดหมาย",
  "เดินทาง",
  "ช่วยสื่อสาร",
  "ประสานงาน",
  "นำทาง",
  "ติดตามผล",
] as const;

function getToday() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function subscribeToDate() {
  return () => {};
}

const bookingSchema = z.object({
  helpType: z.enum(helpTypes, { error: "กรุณาเลือกประเภทความช่วยเหลือ" }),
  requestedDate: z
    .string()
    .min(1, "กรุณาเลือกวันที่")
    .refine((date) => date >= getToday(), "กรุณาเลือกวันที่วันนี้หรือวันถัดไป"),
  startTime: z.string().min(1, "กรุณาเลือกเวลาเริ่มรับบริการ"),
  endTime: z.string().optional(),
  pickup: z.string().trim().min(1, "กรุณากรอกจุดรับ"),
  destination: z.string().trim().optional(),
  details: z.string().trim().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

const quickServiceTypes = {
  call: "โทร / ช่วยติดต่อ",
  appointment: "นัดหมาย",
  travel: "เดินทาง",
} as const;

const mobilityItems = ["ใช้รถเข็น: ไม่", "ใช้ไม้เท้า: ใช่", "ต้องมีผู้ช่วยเดิน: ไม่"];

function formatDate(date: string) {
  return new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", year: "numeric" }).format(
    new Date(`${date}T00:00:00`),
  );
}

export function BookingForm({ initialService }: { initialService?: string }) {
  const [preview, setPreview] = useState<BookingFormValues | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const today = useSyncExternalStore(subscribeToDate, getToday, () => "");
  const initialHelpType = initialService && initialService in quickServiceTypes
    ? quickServiceTypes[initialService as keyof typeof quickServiceTypes]
    : undefined;

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<BookingFormValues>({
    defaultValues: { helpType: initialHelpType },
    resolver: zodResolver(bookingSchema),
  });

  const inputClassName = "mt-2 min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-3 focus:ring-teal-100";

  if (isSubmitted) {
    return (
      <section aria-live="polite" className="max-w-3xl rounded-3xl border-2 border-teal-200 bg-white p-6 text-center shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold text-teal-900">รับข้อมูลคำขอแล้ว</h1>
        <p className="mt-4 text-lg leading-8 text-slate-700">นี่เป็นการจำลองการส่งคำขอ ข้อมูลยังไม่ได้บันทึกหรือส่งให้ อสม.</p>
        <button className="mt-8 min-h-14 rounded-xl bg-teal-700 px-6 text-lg font-bold text-white hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700" onClick={() => { reset(); setIsSubmitted(false); }} type="button">สร้างคำขอใหม่</button>
      </section>
    );
  }

  if (preview) {
    return (
      <section className="max-w-3xl rounded-3xl border-2 border-teal-200 bg-white p-6 shadow-sm sm:p-10">
        <h1 className="text-3xl font-bold text-slate-950">ตรวจสอบคำขอ</h1>
        <p className="mt-3 text-lg text-slate-700">กรุณาตรวจสอบข้อมูลก่อนยืนยัน</p>
        <dl className="mt-8 divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-slate-50 px-5">
          <div className="py-4"><dt className="font-semibold text-slate-600">ประเภท</dt><dd className="mt-1 text-xl font-bold">{preview.helpType}</dd></div>
          <div className="py-4"><dt className="font-semibold text-slate-600">วันที่</dt><dd className="mt-1 text-xl font-bold">{formatDate(preview.requestedDate)}</dd></div>
          <div className="py-4"><dt className="font-semibold text-slate-600">เวลา</dt><dd className="mt-1 text-xl font-bold">{preview.startTime}{preview.endTime ? ` - ${preview.endTime}` : ""}</dd></div>
          <div className="py-4"><dt className="font-semibold text-slate-600">จุดรับ</dt><dd className="mt-1 text-xl font-bold">{preview.pickup}</dd></div>
          {preview.destination ? <div className="py-4"><dt className="font-semibold text-slate-600">จุดหมาย</dt><dd className="mt-1 text-xl font-bold">{preview.destination}</dd></div> : null}
          {preview.details ? <div className="py-4"><dt className="font-semibold text-slate-600">รายละเอียดเพิ่มเติม</dt><dd className="mt-1 text-lg">{preview.details}</dd></div> : null}
          <div className="py-4"><dt className="font-semibold text-slate-600">ข้อจำกัดการเคลื่อนไหว</dt><dd className="mt-1 text-lg">ใช้ไม้เท้า</dd></div>
        </dl>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row-reverse">
          <button className="min-h-14 rounded-xl bg-teal-700 px-6 text-lg font-bold text-white hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700" onClick={() => setIsSubmitted(true)} type="button">ยืนยันคำขอ</button>
          <button className="min-h-14 rounded-xl border-2 border-teal-700 bg-white px-6 text-lg font-bold text-teal-800 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700" onClick={() => setPreview(null)} type="button">กลับไปแก้ไข</button>
        </div>
      </section>
    );
  }

  return (
    <form className="max-w-3xl rounded-3xl border border-teal-100 bg-white p-5 shadow-sm sm:p-8" noValidate onSubmit={handleSubmit(setPreview)}>
      <h1 className="text-3xl font-bold text-slate-950">ขอความช่วยเหลือ</h1>
      <p className="mt-3 text-lg leading-7 text-slate-700">เลือกข้อมูลที่ต้องการ แล้วกดตรวจสอบคำขอ</p>

      <fieldset className="mt-9">
        <legend className="text-xl font-bold text-slate-950">ต้องการความช่วยเหลือเรื่องใด?</legend>
        <p className="mt-1 text-base text-slate-600">เลือกได้ 1 ข้อ</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {helpTypes.map((type) => (
            <label className="flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-2 border-slate-300 px-4 py-3 text-lg font-semibold text-slate-900 has-[:checked]:border-teal-700 has-[:checked]:bg-teal-50 has-[:checked]:ring-2 has-[:checked]:ring-teal-200" key={type}>
              <input className="size-6 accent-teal-700" defaultChecked={type === initialHelpType} type="radio" value={type} {...register("helpType")} />
              <span>{type}</span>
            </label>
          ))}
        </div>
        {errors.helpType ? <p className="mt-3 text-lg font-semibold text-red-700" role="alert">{errors.helpType.message}</p> : null}
      </fieldset>

      <div className="mt-9 grid gap-6 sm:grid-cols-2">
        <div>
          <label className="text-xl font-bold text-slate-950" htmlFor="requestedDate">วันที่ต้องการรับบริการ</label>
          <input aria-describedby={errors.requestedDate ? "requestedDate-error" : undefined} className={inputClassName} id="requestedDate" min={today} type="date" {...register("requestedDate")} />
          {errors.requestedDate ? <p className="mt-2 text-lg font-semibold text-red-700" id="requestedDate-error" role="alert">{errors.requestedDate.message}</p> : null}
        </div>
        <div>
          <label className="text-xl font-bold text-slate-950" htmlFor="startTime">เวลาเริ่มรับบริการ</label>
          <input aria-describedby={errors.startTime ? "startTime-error" : undefined} className={inputClassName} id="startTime" type="time" {...register("startTime")} />
          {errors.startTime ? <p className="mt-2 text-lg font-semibold text-red-700" id="startTime-error" role="alert">{errors.startTime.message}</p> : null}
        </div>
      </div>

      <div className="mt-6">
        <label className="text-xl font-bold text-slate-950" htmlFor="endTime">เวลาสิ้นสุดโดยประมาณ <span className="font-normal text-slate-600">(ถ้ามี)</span></label>
        <input className={inputClassName} id="endTime" type="time" {...register("endTime")} />
      </div>

      <div className="mt-9">
        <label className="text-xl font-bold text-slate-950" htmlFor="pickup">จุดรับ</label>
        <input aria-describedby={errors.pickup ? "pickup-error" : undefined} className={inputClassName} id="pickup" type="text" {...register("pickup")} />
        {errors.pickup ? <p className="mt-2 text-lg font-semibold text-red-700" id="pickup-error" role="alert">{errors.pickup.message}</p> : null}
      </div>

      <div className="mt-6">
        <label className="text-xl font-bold text-slate-950" htmlFor="destination">จุดหมาย <span className="font-normal text-slate-600">(ถ้ามี)</span></label>
        <input className={inputClassName} id="destination" type="text" {...register("destination")} />
      </div>

      <div className="mt-6">
        <label className="text-xl font-bold text-slate-950" htmlFor="details">มีรายละเอียดที่อยากแจ้ง อสม. เพิ่มเติมหรือไม่ <span className="font-normal text-slate-600">(ถ้ามี)</span></label>
        <textarea className={`${inputClassName} min-h-32 py-3`} id="details" {...register("details")} />
      </div>

      <section aria-labelledby="mobility-title" className="mt-9 rounded-2xl border-2 border-teal-100 bg-teal-50 p-5">
        <h2 className="text-xl font-bold text-teal-950" id="mobility-title">ข้อมูลการเคลื่อนไหว</h2>
        <ul className="mt-3 space-y-2 text-lg text-slate-800">{mobilityItems.map((item) => <li key={item}>{item}</li>)}</ul>
        <Link className="mt-5 inline-flex min-h-12 items-center rounded-xl border-2 border-teal-700 bg-white px-4 text-lg font-bold text-teal-800 hover:bg-teal-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-700" href="/mobility">แก้ไขข้อมูลการเคลื่อนไหว</Link>
      </section>

      <button className="mt-9 min-h-16 w-full rounded-2xl bg-teal-700 px-6 text-xl font-bold text-white shadow-sm hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-700" type="submit">ตรวจสอบคำขอ</button>
    </form>
  );
}
