"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useSyncExternalStore } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  findOverlappingSlot,
  formatDateThai,
  initialAvailabilitySlots,
  type AvailabilitySlot,
  type BuddyAvailabilityStatus,
} from "@/app/_lib/buddy-availability";

function getToday() {
  const now = new Date();
  const localDate = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localDate.toISOString().slice(0, 10);
}

function subscribeToDate() {
  return () => {};
}

let nextSlotCounter = 3;
function getNextSlotId() {
  const id = `slot-${nextSlotCounter}`;
  nextSlotCounter += 1;
  return id;
}

const slotSchema = z
  .object({
    date: z
      .string()
      .min(1, "กรุณาเลือกวันที่")
      .refine((date) => date >= getToday(), "ห้ามเลือกวันที่ย้อนหลัง"),
    startTime: z.string().min(1, "กรุณากรอกเวลาเริ่ม"),
    endTime: z.string().min(1, "กรุณากรอกเวลาสิ้นสุด"),
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม",
    path: ["endTime"],
  });

type SlotFormData = z.infer<typeof slotSchema>;

export function BuddyAvailabilityManager() {
  const [status, setStatus] = useState<BuddyAvailabilityStatus>("AVAILABLE");
  const [slots, setSlots] = useState<AvailabilitySlot[]>(initialAvailabilitySlots);
  const [editingSlot, setEditingSlot] = useState<AvailabilitySlot | null>(null);
  const [deletingSlot, setDeletingSlot] = useState<AvailabilitySlot | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const today = useSyncExternalStore(subscribeToDate, getToday, () => "");

  const {
    register,
    handleSubmit,
    reset,
    setError,
    clearErrors,
    setValue,
    formState: { errors },
  } = useForm<SlotFormData>({
    resolver: zodResolver(slotSchema),
    defaultValues: {
      date: "",
      startTime: "",
      endTime: "",
    },
  });

  const isAvailable = status === "AVAILABLE";

  const handleOpenAddForm = () => {
    setEditingSlot(null);
    reset({
      date: today || getToday(),
      startTime: "08:00",
      endTime: "12:00",
    });
    clearErrors();
    setIsFormOpen(true);
  };

  const handleStartEdit = (slot: AvailabilitySlot) => {
    setEditingSlot(slot);
    reset({
      date: slot.date,
      startTime: slot.startTime,
      endTime: slot.endTime,
    });
    clearErrors();
    setIsFormOpen(true);
  };

  const handleCancelForm = () => {
    setEditingSlot(null);
    reset({ date: "", startTime: "", endTime: "" });
    clearErrors();
    setIsFormOpen(false);
  };

  const onSubmit = (data: SlotFormData) => {
    const overlapping = findOverlappingSlot(slots, data, editingSlot?.id);
    if (overlapping) {
      setError("root", {
        type: "manual",
        message: `ช่วงเวลานี้ทับกับเวลาที่ตั้งไว้แล้ว (${overlapping.startTime}–${overlapping.endTime} น.)`,
      });
      return;
    }

    if (editingSlot) {
      setSlots((prev) =>
        prev.map((s) => (s.id === editingSlot.id ? { ...s, ...data } : s)),
      );
      setNotice(`แก้ไขช่วงเวลาวันที่ ${formatDateThai(data.date)} สำเร็จ`);
    } else {
      const newSlot: AvailabilitySlot = {
        id: getNextSlotId(),
        ...data,
      };
      setSlots((prev) => [...prev, newSlot]);
      setNotice(`เพิ่มช่วงเวลาวันที่ ${formatDateThai(data.date)} สำเร็จ`);
    }

    setEditingSlot(null);
    reset({ date: "", startTime: "", endTime: "" });
    setIsFormOpen(false);
  };

  const handleConfirmDelete = () => {
    if (!deletingSlot) return;
    setSlots((prev) => prev.filter((s) => s.id !== deletingSlot.id));
    setNotice(
      `ลบช่วงเวลาวันที่ ${formatDateThai(deletingSlot.date)} (${deletingSlot.startTime}–${deletingSlot.endTime} น.) เรียบร้อยแล้ว`,
    );
    if (editingSlot?.id === deletingSlot.id) {
      handleCancelForm();
    }
    setDeletingSlot(null);
  };

  const sortedSlots = [...slots].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date);
    return a.startTime.localeCompare(b.startTime);
  });

  const inputClass =
    "mt-2 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg font-medium text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100";

  return (
    <div className="mx-auto max-w-4xl space-y-7 pb-10">
      {/* Header */}
      <section aria-labelledby="page-title">
        <p className="text-lg font-bold text-blue-800">Health Buddy สำหรับ อสม.</p>
        <h1 id="page-title" className="mt-2 text-3xl font-bold text-slate-950 sm:text-4xl">
          กำหนดเวลาพร้อมรับงาน
        </h1>
        <p className="mt-3 text-xl text-slate-700">
          ระบุวันและช่วงเวลาที่คุณสะดวกออกไปช่วยเหลือผู้สูงอายุในชุมชน
        </p>
      </section>

      {/* Info Notice Required by Rule #6 */}
      <div
        className="flex items-start gap-4 rounded-3xl border-2 border-blue-200 bg-blue-50 p-5 sm:p-6"
        role="region"
        aria-label="คำแนะนำระบบ"
      >
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-600 text-xl font-bold text-white shadow-sm"
          aria-hidden="true"
        >
          i
        </span>
        <p className="text-lg font-bold leading-8 text-blue-950">
          ระบบจะใช้เวลาที่คุณกำหนดเพื่อค้นหางานที่ตรงกับช่วงเวลาที่พร้อมให้บริการ
        </p>
      </div>

      {/* Notice Banner */}
      {notice ? (
        <div
          role="status"
          aria-live="polite"
          className="flex items-center justify-between rounded-2xl border-2 border-teal-300 bg-teal-50 p-4 text-teal-950 shadow-sm"
        >
          <div className="flex items-center gap-3">
            <span
              className="flex size-8 items-center justify-center rounded-full bg-teal-700 text-sm font-bold text-white"
              aria-hidden="true"
            >
              ✓
            </span>
            <p className="text-lg font-bold">{notice}</p>
          </div>
          <button
            type="button"
            onClick={() => setNotice(null)}
            className="rounded-lg p-2 text-base font-bold text-teal-900 hover:bg-teal-100 focus-visible:outline-2 focus-visible:outline-teal-700"
            aria-label="ปิดการแจ้งเตือน"
          >
            ✕
          </button>
        </div>
      ) : null}

      {/* Main Status of Buddy Required by Rule #1 */}
      <section
        aria-labelledby="main-status-title"
        className={`rounded-3xl border-2 p-6 shadow-sm transition sm:p-8 ${
          isAvailable
            ? "border-teal-300 bg-teal-50/60"
            : "border-slate-300 bg-slate-50"
        }`}
      >
        <div className="sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div className="space-y-3">
            <h2 id="main-status-title" className="text-xl font-bold text-slate-800">
              สถานะหลักของ อสม.
            </h2>
            <div className="flex items-center gap-4">
              <span
                className={`flex size-14 shrink-0 items-center justify-center rounded-2xl text-2xl font-bold text-white shadow-md ${
                  isAvailable ? "bg-teal-700" : "bg-slate-700"
                }`}
                aria-hidden="true"
              >
                {isAvailable ? "✓" : "⏸"}
              </span>
              <div>
                <p className="text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
                  <span className="font-mono">{status}</span>
                  <span className="ml-3 font-sans">
                    {isAvailable ? "— พร้อมรับงาน" : "— หยุดรับงาน"}
                  </span>
                </p>
                <p className="mt-1 text-base font-medium text-slate-600 sm:text-lg">
                  {isAvailable
                    ? "สถานะเปิดรับงาน: ระบบสามารถจับคู่งานและส่งการแจ้งเตือนได้"
                    : "สถานะหยุดรับงาน: พักรับงานชั่วคราว ระบบจะไม่ส่งงานใหม่"}
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            aria-pressed={isAvailable}
            onClick={() => {
              const nextStatus = isAvailable ? "OFFLINE" : "AVAILABLE";
              setStatus(nextStatus);
              setNotice(
                `เปลี่ยนสถานะเป็น ${nextStatus} (${nextStatus === "AVAILABLE" ? "พร้อมรับงาน" : "หยุดรับงาน"}) แล้ว`,
              );
            }}
            className={`mt-6 min-h-16 w-full rounded-2xl px-6 text-xl font-bold text-white shadow-sm transition focus-visible:outline-3 focus-visible:outline-offset-4 sm:mt-0 sm:w-auto shrink-0 ${
              isAvailable
                ? "bg-slate-800 hover:bg-slate-900 focus-visible:outline-slate-900"
                : "bg-teal-700 hover:bg-teal-800 focus-visible:outline-teal-800"
            }`}
          >
            {isAvailable ? "กดเปลี่ยนเป็น OFFLINE (หยุดรับงาน)" : "กดเปลี่ยนเป็น AVAILABLE (พร้อมรับงาน)"}
          </button>
        </div>
      </section>

      {/* Schedule Table / List Required by Rule #2 */}
      <section aria-labelledby="schedule-heading" className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="schedule-heading" className="text-2xl font-bold text-slate-950 sm:text-3xl">
              ตารางเวลาพร้อมรับงาน
            </h2>
            <p className="mt-1 text-base text-slate-600 sm:text-lg">
              มีทั้งหมด {slots.length} ช่วงเวลาที่พร้อมให้บริการ
            </p>
          </div>

          {!isFormOpen ? (
            <button
              type="button"
              onClick={handleOpenAddForm}
              className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-blue-700 px-6 text-lg font-bold text-white shadow-sm hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
            >
              <span className="text-2xl font-extrabold leading-none" aria-hidden="true">+</span>
              เพิ่มช่วงเวลาใหม่
            </button>
          ) : null}
        </div>

        {/* Add / Edit Form Card */}
        {isFormOpen ? (
          <section
            aria-labelledby="form-heading"
            className="rounded-3xl border-2 border-blue-400 bg-white p-6 shadow-md sm:p-8"
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <h3 id="form-heading" className="text-2xl font-bold text-blue-900">
                {editingSlot ? "แก้ไขช่วงเวลาพร้อมรับงาน" : "เพิ่มช่วงเวลาพร้อมรับงานใหม่"}
              </h3>
              <button
                type="button"
                onClick={handleCancelForm}
                className="rounded-xl px-3 py-1.5 text-base font-bold text-slate-600 hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-slate-500"
              >
                ยกเลิก
              </button>
            </div>

            {/* Overlap Error Alert */}
            {errors.root ? (
              <div
                role="alert"
                className="mt-5 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-lg font-bold text-red-900"
              >
                {errors.root.message}
              </div>
            ) : null}

            <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-6">
              {/* Date Input */}
              <div>
                <label htmlFor="slot-date" className="block text-xl font-bold text-slate-950">
                  วันที่พร้อมรับงาน <span className="text-red-600">*</span>
                </label>
                <p className="mt-1 text-base text-slate-600">
                  เลือกวันที่ต้องการออกปฏิบัติงาน (ห้ามเลือกวันที่ย้อนหลัง)
                </p>
                <input
                  id="slot-date"
                  type="date"
                  min={today}
                  className={inputClass}
                  {...register("date")}
                  aria-invalid={Boolean(errors.date)}
                  aria-describedby={errors.date ? "date-error" : undefined}
                />
                {errors.date ? (
                  <p id="date-error" role="alert" className="mt-2 text-base font-bold text-red-700">
                    {errors.date.message}
                  </p>
                ) : null}
              </div>

              {/* Time Inputs */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="slot-start-time" className="block text-xl font-bold text-slate-950">
                    เวลาเริ่ม <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="slot-start-time"
                    type="time"
                    step="900"
                    className={inputClass}
                    {...register("startTime")}
                    aria-invalid={Boolean(errors.startTime)}
                    aria-describedby={errors.startTime ? "start-time-error" : undefined}
                  />
                  {errors.startTime ? (
                    <p id="start-time-error" role="alert" className="mt-2 text-base font-bold text-red-700">
                      {errors.startTime.message}
                    </p>
                  ) : null}
                </div>

                <div>
                  <label htmlFor="slot-end-time" className="block text-xl font-bold text-slate-950">
                    เวลาสิ้นสุด <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="slot-end-time"
                    type="time"
                    step="900"
                    className={inputClass}
                    {...register("endTime")}
                    aria-invalid={Boolean(errors.endTime)}
                    aria-describedby={errors.endTime ? "end-time-error" : undefined}
                  />
                  {errors.endTime ? (
                    <p id="end-time-error" role="alert" className="mt-2 text-base font-bold text-red-700">
                      {errors.endTime.message}
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Preset Shortcuts for Mobile Ease */}
              <div>
                <p className="text-base font-bold text-slate-700">เลือกช่วงเวลายอดนิยม:</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setValue("startTime", "08:00");
                      setValue("endTime", "12:00", { shouldValidate: true });
                    }}
                    className="min-h-11 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-base font-bold text-blue-900 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-700"
                  >
                    ช่วงเช้า (08:00–12:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("startTime", "13:00");
                      setValue("endTime", "17:00", { shouldValidate: true });
                    }}
                    className="min-h-11 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-base font-bold text-blue-900 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-700"
                  >
                    ช่วงบ่าย (13:00–17:00)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setValue("startTime", "08:00");
                      setValue("endTime", "16:00", { shouldValidate: true });
                    }}
                    className="min-h-11 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-base font-bold text-blue-900 hover:bg-blue-100 focus-visible:outline-2 focus-visible:outline-blue-700"
                  >
                    ทั้งวัน (08:00–16:00)
                  </button>
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex flex-col gap-3 pt-4 sm:flex-row">
                <button
                  type="submit"
                  className="min-h-16 flex-1 rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white shadow-sm hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  {editingSlot ? "บันทึกการแก้ไข" : "บันทึกช่วงเวลานี้"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="min-h-16 rounded-2xl border-2 border-slate-400 bg-white px-6 text-xl font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </section>
        ) : null}

        {/* Slot List */}
        {sortedSlots.length === 0 ? (
          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
            <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-600" aria-hidden="true">
              <svg className="size-6 fill-current" viewBox="0 0 24 24">
                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
              </svg>
            </div>
            <p className="mt-3 text-xl font-bold text-slate-900">
              ยังไม่มีการตั้งช่วงเวลาพร้อมรับงาน
            </p>
            <p className="mt-2 text-lg text-slate-600">
              กดปุ่ม &quot;เพิ่มช่วงเวลาใหม่&quot; เพื่อกำหนดเวลาที่คุณสะดวกปฏิบัติงาน
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedSlots.map((slot) => {
              const isBeingEdited = editingSlot?.id === slot.id;
              return (
                <article
                  key={slot.id}
                  className={`rounded-3xl border-2 bg-white p-5 shadow-sm transition sm:p-6 ${
                    isBeingEdited
                      ? "border-blue-600 ring-4 ring-blue-100"
                      : "border-slate-200 hover:border-blue-300"
                  }`}
                  aria-label={`ช่วงเวลา ${formatDateThai(slot.date)} เวลา ${slot.startTime} ถึง ${slot.endTime} น.`}
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-100 px-3 py-1 text-base font-bold text-blue-900">
                          {formatDateThai(slot.date)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-xl bg-teal-100 px-3 py-1 text-base font-bold text-teal-900">
                          {slot.startTime} – {slot.endTime} น.
                        </span>
                        {isBeingEdited ? (
                          <span className="rounded-xl bg-amber-100 px-3 py-1 text-base font-bold text-amber-900">
                            กำลังแก้ไข
                          </span>
                        ) : null}
                      </div>

                      <p className="text-xl font-bold text-slate-950 sm:text-2xl">
                        วันที่ {formatDateThai(slot.date)} เวลา {slot.startTime}–{slot.endTime} น.
                      </p>
                      <p className="text-base text-slate-600">
                        พร้อมให้บริการช่วยเหลือผู้สูงอายุตามช่วงเวลานี้
                      </p>
                    </div>

                    <div className="flex items-center gap-3 pt-2 sm:pt-0">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(slot)}
                        className="min-h-12 flex-1 rounded-xl border-2 border-blue-600 bg-white px-5 text-lg font-bold text-blue-800 shadow-sm hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-700 sm:flex-initial"
                      >
                        แก้ไข
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingSlot(slot)}
                        className="min-h-12 flex-1 rounded-xl border-2 border-red-300 bg-red-50 px-5 text-lg font-bold text-red-800 shadow-sm hover:bg-red-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:flex-initial"
                      >
                        ลบ
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Confirmation Dialog Before Delete Required by Rule #5 */}
      {deletingSlot ? (
        <div
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
          aria-describedby="delete-dialog-desc"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex size-14 items-center justify-center rounded-2xl bg-red-100 text-3xl font-bold text-red-700" aria-hidden="true">
              !
            </div>
            <h3 id="delete-dialog-title" className="mt-4 text-2xl font-bold text-slate-950">
              ยืนยันการลบช่วงเวลา
            </h3>
            <p id="delete-dialog-desc" className="mt-3 text-lg leading-7 text-slate-700">
              คุณต้องการลบช่วงเวลา{" "}
              <span className="font-bold text-slate-950">
                {formatDateThai(deletingSlot.date)}
              </span>{" "}
              เวลา{" "}
              <span className="font-bold text-slate-950">
                {deletingSlot.startTime}–{deletingSlot.endTime} น.
              </span>{" "}
              ใช่หรือไม่? ข้อมูลจะถูกลบออกจากระบบทันที
            </p>
            <div className="mt-7 flex flex-col gap-3 sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="min-h-14 flex-1 rounded-2xl bg-red-600 px-6 text-lg font-bold text-white shadow-sm hover:bg-red-700 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700"
              >
                ยืนยันการลบ
              </button>
              <button
                type="button"
                onClick={() => setDeletingSlot(null)}
                className="min-h-14 flex-1 rounded-2xl border-2 border-slate-300 bg-white px-6 text-lg font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Navigation Required by Rule #7 */}
      <nav aria-label="การนำทางเพิ่มเติม" className="mt-10 border-t border-slate-200 pt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <Link
            href="/buddy"
            className="flex min-h-16 flex-1 items-center justify-center rounded-2xl border-2 border-slate-400 bg-white px-6 text-xl font-bold text-slate-800 shadow-sm hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-slate-700"
          >
            ← กลับหน้าหลัก อสม.
          </Link>
          <Link
            href="/buddy/open-jobs"
            className="flex min-h-16 flex-1 items-center justify-center rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white shadow-sm hover:bg-blue-800 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
          >
            ดูงานที่เปิดรับ →
          </Link>
        </div>
      </nav>
    </div>
  );
}
