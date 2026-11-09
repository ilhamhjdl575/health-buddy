"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { SERVICE_LABELS, type ServiceType } from "@/app/_lib/services";
import { createServiceRequest, type BookableRecipient } from "@/lib/booking/actions";

type FormState = {
  recipientId: string;
  serviceType: ServiceType | "";
  serviceDate: string;
  startTime: string;
  endTime: string;
  pickupAddress: string;
  destinationAddress: string;
  notes: string;
};

const today = () => new Date().toISOString().slice(0, 10);

const TIME_PERIODS = [
  {
    id: "OFFICIAL" as const,
    title: "ในเวลาราชการ",
    sentence: "วันจันทร์ – วันศุกร์ เวลา 08:30 – 16:30 น.",
    start: "08:30",
    end: "16:30",
  },
  {
    id: "OVERTIME_WEEKDAY" as const,
    title: "นอกเวลาราชการ (วันธรรมดา)",
    sentence: "วันจันทร์ – วันศุกร์ ช่วงเย็น เวลา 16:30 – 20:30 น.",
    start: "16:30",
    end: "20:30",
  },
  {
    id: "WEEKEND_HOLIDAY" as const,
    title: "วันหยุดเสาร์ – อาทิตย์ และวันหยุดราชการ",
    sentence: "วันเสาร์ – วันอาทิตย์ และวันหยุดนักขัตฤกษ์ เวลา 08:30 – 16:30 น.",
    start: "08:30",
    end: "16:30",
  },
];

export function BookingForm({
  recipients,
  initialService,
}: {
  recipients: BookableRecipient[];
  initialService?: string;
}) {
  const [form, setForm] = useState<FormState>({
    recipientId: recipients[0]?.id ?? "self",
    serviceType:
      initialService === "bedridden"
        ? "BEDRIDDEN_CARE"
        : initialService === "doctor"
        ? "DOCTOR_VISIT"
        : "",
    serviceDate: "",
    startTime: "",
    endTime: "",
    pickupAddress: "",
    destinationAddress: "",
    notes: "",
  });

  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const idempotencyKey = useRef<string | null>(null);

  const recipient = useMemo(
    () => recipients.find((item) => (item.id ?? "self") === form.recipientId) ?? recipients[0],
    [recipients, form.recipientId]
  );

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((current) => ({ ...current, [key]: value }));

  const togglePeriod = (id: "OFFICIAL" | "OVERTIME_WEEKDAY" | "WEEKEND_HOLIDAY") => {
    const next = selectedPeriods.includes(id)
      ? selectedPeriods.filter((p) => p !== id)
      : [...selectedPeriods, id];

    setSelectedPeriods(next);

    if (next.length === 0) {
      setForm((current) => ({
        ...current,
        startTime: "",
        endTime: "",
      }));
      return;
    }

    const selectedObjs = TIME_PERIODS.filter((p) => next.includes(p.id));
    const earliestStart = [...selectedObjs].map((p) => p.start).sort()[0];
    const latestEnd = [...selectedObjs].map((p) => p.end).sort().reverse()[0];

    setForm((current) => ({
      ...current,
      startTime: earliestStart,
      endTime: latestEnd,
    }));
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (!recipient) {
      return setError("กรุณาเลือกผู้รับบริการ");
    }
    if (!form.serviceType) {
      return setError("กรุณาเลือกประเภทบริการ");
    }
    if (!form.serviceDate) {
      return setError("กรุณาเลือกวันที่รับบริการ");
    }
    if (form.serviceDate < today()) {
      return setError("ไม่สามารถเลือกวันที่ในอดีตได้");
    }
    if (!form.startTime) {
      return setError("กรุณาระบุเวลาเริ่มรับบริการ");
    }
    if (form.endTime && form.endTime <= form.startTime) {
      return setError("เวลาสิ้นสุดต้องหลังเวลาเริ่ม");
    }
    if (!form.pickupAddress.trim()) {
      return setError("กรุณากรอกจุดรับบริการ");
    }
    if (form.serviceType === "BEDRIDDEN_CARE" && !recipient.isBedridden) {
      return setError("บริการนี้ใช้ได้เฉพาะผู้ป่วยติดเตียง");
    }

    setSubmitting(true);
    idempotencyKey.current ??= crypto.randomUUID();

    const result = await createServiceRequest({
      recipientId: recipient.id,
      serviceType: form.serviceType,
      serviceDate: form.serviceDate,
      startTime: form.startTime,
      endTime: form.endTime || null,
      pickupAddress: form.pickupAddress.trim(),
      destinationAddress: form.destinationAddress.trim() || null,
      notes: form.notes.trim() || null,
      idempotencyKey: idempotencyKey.current,
    });

    setSubmitting(false);
    if (!result.success) {
      return setError(result.error);
    }
    setRequestId(result.requestId);
  };

  if (requestId) {
    return (
      <section className="mx-auto max-w-2xl rounded-3xl border-2 border-teal-200 bg-white p-8 text-center shadow-md">
        <h1 className="text-3xl font-black text-teal-950 sm:text-4xl">
          ส่งคำขอรับบริการแล้ว
        </h1>
        <p className="mt-3 text-lg text-slate-700">
          กรุณาเลือก Buddy ที่ต้องการให้ช่วยดูแล
        </p>
        <div className="mt-7">
          <Link
            href={`/my-bookings/${requestId}/select-buddy`}
            className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-teal-700 px-8 text-lg font-bold text-white transition hover:bg-teal-800 active:scale-[0.98]"
          >
            เลือก Buddy
          </Link>
        </div>
      </section>
    );
  }

  const inputClasses =
    "mt-1.5 min-h-14 w-full rounded-xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none transition placeholder:text-slate-400 focus:border-teal-700 focus:ring-2 focus:ring-teal-100";

  return (
    <form onSubmit={submit} className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-teal-100 bg-white p-6 shadow-sm sm:p-8">
      <div>
        <h1 className="text-3xl font-black text-slate-950">ขอรับบริการ</h1>
        <p className="mt-1 text-base text-slate-600">กรอกข้อมูลเพื่อส่งคำขอรับบริการ</p>
      </div>

      {/* 1. ผู้รับบริการ */}
      <fieldset className="space-y-3 border-t border-slate-200 pt-5">
        <legend className="text-xl font-bold text-slate-900">ผู้รับบริการ</legend>

        {recipients.length > 1 ? (
          <div>
            <label htmlFor="recipientSelect" className="block text-sm font-semibold text-slate-700">
              เลือกผู้รับบริการ
            </label>
            <select
              id="recipientSelect"
              value={form.recipientId}
              onChange={(e) => update("recipientId", e.target.value)}
              className={inputClasses}
            >
              {recipients.map((item) => (
                <option key={item.id ?? "self"} value={item.id ?? "self"}>
                  {item.name} {item.kind === "SELF" ? "(ตัวเอง)" : ""}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
            <p className="text-lg font-bold text-slate-900">{recipient?.name}</p>
          </div>
        )}

        {recipient && (
          <div className="space-y-2 pt-1">
            <span className="block text-sm font-semibold text-slate-700">
              สถานะการเคลื่อนไหว
            </span>
            <div className="flex flex-wrap gap-2">
              {(recipient.mobilityBadges && recipient.mobilityBadges.length > 0
                ? recipient.mobilityBadges
                : [recipient.isBedridden ? "ผู้ป่วยติดเตียง" : "ไม่ใช่ผู้ป่วยติดเตียง"]
              ).map((badge, idx) => (
                <span
                  key={idx}
                  className={`inline-flex items-center rounded-lg border px-3 py-1 text-sm font-semibold ${
                    badge === "ผู้ป่วยติดเตียง"
                      ? "border-amber-300 bg-amber-50 text-amber-900"
                      : badge === "ไม่ใช่ผู้ป่วยติดเตียง"
                      ? "border-teal-200 bg-teal-50 text-teal-900"
                      : "border-slate-300 bg-slate-50 text-slate-700"
                  }`}
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        )}
      </fieldset>

      {/* 2. รายละเอียดบริการ */}
      <fieldset className="space-y-4 border-t border-slate-200 pt-5">
        <legend className="text-xl font-bold text-slate-900">
          ประเภทบริการ <span className="text-red-600">*</span>
        </legend>

        <div className="grid gap-3 sm:grid-cols-2">
          {/* พาไปพบแพทย์ */}
          <button
            type="button"
            onClick={() => update("serviceType", "DOCTOR_VISIT")}
            className={`flex flex-col justify-between rounded-xl border-2 p-4 text-left transition-all active:scale-[0.99] ${
              form.serviceType === "DOCTOR_VISIT"
                ? "border-teal-700 bg-teal-50/80 shadow-xs ring-1 ring-teal-600"
                : "border-slate-300 bg-white hover:border-teal-400"
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-slate-900">
                  {SERVICE_LABELS.DOCTOR_VISIT}
                </span>
                <span
                  className={`size-5 rounded-full border-2 flex items-center justify-center ${
                    form.serviceType === "DOCTOR_VISIT"
                      ? "border-teal-700 bg-teal-700"
                      : "border-slate-300"
                  }`}
                >
                  {form.serviceType === "DOCTOR_VISIT" && (
                    <span className="size-2 rounded-full bg-white" />
                  )}
                </span>
              </div>
              <p className="mt-1.5 text-sm text-slate-600">
                พาไปโรงพยาบาลหรือคลินิก รอรับยา และพากลับบ้าน
              </p>
            </div>
          </button>

          {/* ดูแลผู้ป่วยติดเตียง */}
          {(() => {
            const isAllowed = Boolean(recipient?.isBedridden);
            return (
              <button
                type="button"
                disabled={!isAllowed}
                onClick={() => isAllowed && update("serviceType", "BEDRIDDEN_CARE")}
                className={`flex flex-col justify-between rounded-xl border-2 p-4 text-left transition-all ${
                  !isAllowed
                    ? "cursor-not-allowed border-slate-200 bg-slate-100 opacity-60"
                    : form.serviceType === "BEDRIDDEN_CARE"
                    ? "border-teal-700 bg-teal-50/80 shadow-xs ring-1 ring-teal-600 active:scale-[0.99]"
                    : "border-slate-300 bg-white hover:border-teal-400 active:scale-[0.99]"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-bold text-slate-900">
                      {SERVICE_LABELS.BEDRIDDEN_CARE}
                    </span>
                    <span
                      className={`size-5 rounded-full border-2 flex items-center justify-center ${
                        form.serviceType === "BEDRIDDEN_CARE"
                          ? "border-teal-700 bg-teal-700"
                          : "border-slate-300"
                      }`}
                    >
                      {form.serviceType === "BEDRIDDEN_CARE" && (
                        <span className="size-2 rounded-full bg-white" />
                      )}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm text-slate-600">
                    ดูแลสุขอนามัย ป้อนอาหารและยา ช่วยเหลือที่บ้าน
                  </p>
                </div>
                {!isAllowed && (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    เฉพาะผู้ป่วยติดเตียง
                  </p>
                )}
              </button>
            );
          })()}
        </div>
      </fieldset>

      {/* 3. วันและเวลา */}
      <fieldset className="space-y-4 border-t border-slate-200 pt-5">
        <legend className="text-xl font-bold text-slate-900">วันและเวลา</legend>

        <div>
          <label htmlFor="serviceDate" className="block text-sm font-semibold text-slate-700">
            วันที่รับบริการ <span className="text-red-600">*</span>
          </label>
          <input
            id="serviceDate"
            required
            type="date"
            min={today()}
            value={form.serviceDate}
            onChange={(e) => update("serviceDate", e.target.value)}
            className={inputClasses}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">
            ช่วงเวลาที่ต้องการรับบริการ <span className="text-red-600">*</span>{" "}
            <span className="text-xs font-normal text-slate-500">(ติ๊กเลือกได้มากกว่า 1 ข้อ)</span>
          </label>
          <div className="space-y-2.5">
            {TIME_PERIODS.map((period) => {
              const isSelected = selectedPeriods.includes(period.id);
              return (
                <button
                  key={period.id}
                  type="button"
                  onClick={() => togglePeriod(period.id)}
                  className={`flex w-full items-start gap-3 rounded-xl border-2 p-3.5 text-left transition-all active:scale-[0.99] ${
                    isSelected
                      ? "border-teal-700 bg-teal-50/80 shadow-xs ring-1 ring-teal-600"
                      : "border-slate-300 bg-white hover:border-teal-400"
                  }`}
                >
                  <span
                    className={`mt-0.5 size-5 shrink-0 rounded-md border-2 flex items-center justify-center transition-colors ${
                      isSelected
                        ? "border-teal-700 bg-teal-700 text-white"
                        : "border-slate-400 bg-white"
                    }`}
                  >
                    {isSelected && (
                      <svg className="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  <div>
                    <p className="text-base font-bold text-slate-900">{period.title}</p>
                    <p className="text-sm text-slate-600 mt-0.5">{period.sentence}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="startTime" className="block text-sm font-semibold text-slate-700">
              เวลาเริ่ม <span className="text-red-600">*</span>
            </label>
            <input
              id="startTime"
              required
              type="time"
              value={form.startTime}
              onChange={(e) => update("startTime", e.target.value)}
              className={inputClasses}
            />
          </div>

          <div>
            <label htmlFor="endTime" className="block text-sm font-semibold text-slate-700">
              เวลาสิ้นสุด (ถ้ามี)
            </label>
            <input
              id="endTime"
              type="time"
              value={form.endTime}
              onChange={(e) => update("endTime", e.target.value)}
              className={inputClasses}
            />
          </div>
        </div>
      </fieldset>

      {/* 4. สถานที่และหมายเหตุ */}
      <fieldset className="space-y-4 border-t border-slate-200 pt-5">
        <legend className="text-xl font-bold text-slate-900">สถานที่และหมายเหตุ</legend>

        <div>
          <label htmlFor="pickupAddress" className="block text-sm font-semibold text-slate-700">
            จุดรับบริการ <span className="text-red-600">*</span>
          </label>
          <input
            id="pickupAddress"
            required
            value={form.pickupAddress}
            onChange={(e) => update("pickupAddress", e.target.value)}
            placeholder="บ้านเลขที่ ซอย ถนน หรือจุดนัดพบ"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="destinationAddress" className="block text-sm font-semibold text-slate-700">
            จุดหมาย (ถ้ามี)
          </label>
          <input
            id="destinationAddress"
            value={form.destinationAddress}
            onChange={(e) => update("destinationAddress", e.target.value)}
            placeholder="โรงพยาบาล คลินิก หรือสถานที่ปลายทาง"
            className={inputClasses}
          />
        </div>

        <div>
          <label htmlFor="notes" className="block text-sm font-semibold text-slate-700">
            รายละเอียดเพิ่มเติม (ถ้ามี)
          </label>
          <textarea
            id="notes"
            value={form.notes}
            onChange={(e) => update("notes", e.target.value)}
            placeholder="เช่น ผู้รับบริการใช้วีลแชร์ หรือต้องการให้ช่วยพยุงเดิน"
            className={`${inputClasses} min-h-24 py-3`}
          />
        </div>
      </fieldset>

      {/* Error alert */}
      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 font-bold text-red-800">
          {error}
        </div>
      )}

      {/* Submit Button */}
      <div className="pt-2">
        <button
          disabled={submitting}
          type="submit"
          className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-teal-700 px-6 text-xl font-bold text-white transition hover:bg-teal-800 disabled:opacity-60 active:scale-[0.99]"
        >
          {submitting ? "กำลังบันทึก..." : "ยืนยันคำขอรับบริการ"}
        </button>
      </div>
    </form>
  );
}
