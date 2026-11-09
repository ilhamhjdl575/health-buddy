"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  changeAvailabilityStatus,
  saveRecurringAvailability,
  type AvailabilitySlot,
  type AvailabilityStatus,
} from "@/lib/buddy/availability";

const WORK_PERIOD_OPTIONS = [
  {
    id: "OFFICIAL" as const,
    title: "วันจันทร์ – วันศุกร์ (ในเวลาราชการ)",
    description: "เวลา 08:30 – 16:30 น. (วันทำการปกติ)",
    daysText: "วันจันทร์, อังคาร, พุธ, พฤหัสบดี, ศุกร์",
    hoursText: "08:30 – 16:30 น.",
  },
  {
    id: "OVERTIME_WEEKDAY" as const,
    title: "วันจันทร์ – วันศุกร์ (นอกเวลาราชการ)",
    description: "เวลา 16:30 – 20:30 น. (ช่วงเย็นหลังเวลาราชการ)",
    daysText: "วันจันทร์, อังคาร, พุธ, พฤหัสบดี, ศุกร์",
    hoursText: "16:30 – 20:30 น.",
  },
  {
    id: "WEEKEND_HOLIDAY" as const,
    title: "วันเสาร์ – วันอาทิตย์ และวันหยุดราชการ",
    description: "เวลา 08:30 – 16:30 น. (วันหยุดสุดสัปดาห์)",
    daysText: "วันเสาร์, วันอาทิตย์ และวันหยุดนักขัตฤกษ์",
    hoursText: "08:30 – 16:30 น.",
  },
];

export function BuddyAvailabilityManager({
  initialStatus,
  initialActivePeriods,
}: {
  initialSlots?: AvailabilitySlot[];
  initialStatus: AvailabilityStatus;
  initialActivePeriods?: string[];
}) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(
    initialActivePeriods && initialActivePeriods.length > 0 ? initialActivePeriods : ["OFFICIAL"]
  );
  const [savedPeriods, setSavedPeriods] = useState<string[]>(
    initialActivePeriods && initialActivePeriods.length > 0 ? initialActivePeriods : ["OFFICIAL"]
  );
  const [message, setMessage] = useState<{ kind: "success" | "error"; text: string } | null>(null);
  const [isPending, startTransition] = useTransition();

  const togglePeriod = (id: string) => {
    setSelectedPeriods((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const handleSaveSchedule = () =>
    startTransition(async () => {
      setMessage(null);
      if (selectedPeriods.length === 0) {
        return setMessage({ kind: "error", text: "กรุณาเลือกอย่างน้อย 1 ช่วงวันและเวลาที่พร้อมให้บริการ" });
      }

      const result = await saveRecurringAvailability(selectedPeriods);
      if (!result.success) {
        return setMessage({ kind: "error", text: result.error });
      }

      setSavedPeriods([...selectedPeriods]);
      setMessage({ kind: "success", text: "บันทึกตารางวันและเวลาพร้อมรับงานเรียบร้อยแล้ว" });
      router.refresh();
    });

  const toggleStatus = () =>
    startTransition(async () => {
      const next = status === "AVAILABLE" ? "OFFLINE" : "AVAILABLE";
      const result = await changeAvailabilityStatus(next);
      if (!result.success) return setMessage({ kind: "error", text: result.error });
      setStatus(next);
      setMessage({ kind: "success", text: `เปลี่ยนสถานะเป็น "${next === "AVAILABLE" ? "พร้อมรับงาน" : "ออฟไลน์"}" แล้ว` });
      router.refresh();
    });

  const activeOptions = WORK_PERIOD_OPTIONS.filter((opt) => savedPeriods.includes(opt.id));

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      {/* Header Bar */}
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-950">กำหนดวันและเวลาพร้อมรับงาน</h1>
          <p className="mt-1 text-base text-slate-600">
            เลือกวันและช่วงเวลาที่ท่านสะดวกให้บริการ เพื่อให้ระบบใช้ค้นหาและจับคู่งาน
          </p>
        </div>
        <button
          disabled={isPending}
          onClick={toggleStatus}
          className={`min-h-12 rounded-xl px-5 font-bold text-white transition active:scale-[0.98] disabled:opacity-50 ${
            status === "AVAILABLE" ? "bg-emerald-700 hover:bg-emerald-800" : "bg-slate-600 hover:bg-slate-700"
          }`}
        >
          {status === "AVAILABLE" ? "สถานะ: พร้อมรับงาน" : "สถานะ: ออฟไลน์"}
        </button>
      </div>

      {message && (
        <div
          role={message.kind === "error" ? "alert" : "status"}
          className={`rounded-xl border p-4 font-bold ${
            message.kind === "error"
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-emerald-200 bg-emerald-50 text-emerald-800"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Main Configuration Card: Days & Time Periods */}
      <div className="space-y-5 rounded-2xl border-2 border-blue-200 bg-white p-5 sm:p-7 shadow-xs">
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            เลือกวันและช่วงเวลาที่พร้อมให้บริการ
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            นับเป็นรอบวันทำงานปกติ สามารถติ๊กเลือกได้มากกว่า 1 ข้อ
          </p>
        </div>

        {/* Checkbox Options */}
        <div className="space-y-3">
          {WORK_PERIOD_OPTIONS.map((option) => {
            const isChecked = selectedPeriods.includes(option.id);
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => togglePeriod(option.id)}
                className={`flex w-full items-start gap-4 rounded-xl border-2 p-4 text-left transition-all active:scale-[0.99] ${
                  isChecked
                    ? "border-blue-600 bg-blue-50/70 shadow-xs ring-1 ring-blue-500"
                    : "border-slate-300 bg-white hover:border-blue-400 hover:bg-slate-50"
                }`}
              >
                <span
                  className={`mt-0.5 size-6 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
                    isChecked
                      ? "border-blue-700 bg-blue-700 text-white"
                      : "border-slate-400 bg-white"
                  }`}
                >
                  {isChecked && (
                    <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-bold text-slate-900">{option.title}</p>
                  <p className="text-sm font-medium text-slate-600 mt-0.5">{option.description}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Save Button */}
        <div className="pt-2">
          <button
            disabled={isPending}
            onClick={handleSaveSchedule}
            className="flex min-h-13 w-full sm:w-auto items-center justify-center rounded-xl bg-blue-700 px-8 text-lg font-bold text-white transition hover:bg-blue-800 active:scale-[0.98] disabled:opacity-50"
          >
            {isPending ? "กำลังบันทึก..." : "บันทึกตารางเวลาพร้อมรับงาน"}
          </button>
        </div>
      </div>

      {/* Active Schedule Summary Display */}
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-5 sm:p-6">
        <h3 className="text-lg font-bold text-slate-900">ตารางเวลาพร้อมรับงานปัจจุบัน</h3>
        {activeOptions.length === 0 ? (
          <p className="text-sm text-slate-500">
            ยังไม่ได้กำหนดตารางเวลาพร้อมรับงาน กรุณาเลือกข้อด้านบนแล้วกดบันทึก
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {activeOptions.map((opt) => (
              <div
                key={opt.id}
                className="rounded-xl border border-blue-200 bg-white p-4 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                    พร้อมรับงาน
                  </span>
                  <span className="size-2 rounded-full bg-emerald-500 ring-2 ring-emerald-200" />
                </div>
                <p className="mt-1 text-base font-bold text-slate-900">{opt.title}</p>
                <p className="mt-0.5 text-xs text-slate-500">{opt.daysText}</p>
                <p className="mt-2 text-sm font-semibold text-blue-900">เวลา {opt.hoursText}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
