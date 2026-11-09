"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  finishFollowUpCase,
  contactHealthCenterFollowUp,
  type FollowUpCase,
} from "@/lib/buddy/follow-up";
import { SERVICE_LABELS, type ServiceType } from "@/app/_lib/services";

export function BuddyFollowUpView({ cases }: { cases: FollowUpCase[] }) {
  const router = useRouter();
  const [activeContactCaseId, setActiveContactCaseId] = useState<string | null>(null);
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleFinishService = (caseItem: FollowUpCase) => {
    setMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const result = await finishFollowUpCase(caseItem.id);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setMessage(`สิ้นสุดการบริการสำหรับ ${caseItem.recipientName} เรียบร้อยแล้ว (ไม่มีการรักษาต่อเนื่อง)`);
      setActiveContactCaseId(null);
      router.refresh();
    });
  };

  const handleContactHealthCenter = (caseItem: FollowUpCase) => {
    setMessage(null);
    setErrorMessage(null);
    const reasonText = reasons[caseItem.id] || "";

    if (!reasonText.trim()) {
      setErrorMessage("กรุณาระบุสั้นๆ ว่าผู้ป่วยเป็นอะไร หรือทำไมต้องให้เจ้าหน้าที่ รพ.สต. ติดตามผล");
      return;
    }

    startTransition(async () => {
      const result = await contactHealthCenterFollowUp(caseItem.id, reasonText);
      if (!result.success) {
        setErrorMessage(result.error);
        return;
      }
      setMessage(`บันทึกการประสานงานเจ้าหน้าที่ รพ.สต. เพื่อติดตามผล ${caseItem.recipientName} เรียบร้อยแล้ว`);
      setActiveContactCaseId(null);
      setReasons({ ...reasons, [caseItem.id]: "" });
      router.refresh();
    });
  };

  return (
    <section className="mx-auto max-w-4xl space-y-6 pb-12">
      {/* Title Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          ติดตามผล
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          รายการผู้รับบริการหลังเสร็จสิ้นงาน เพื่อให้อสม.เลือกสิ้นสุดการบริการ หรือส่งต่อเจ้าหน้าที่ รพ.สต.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-lg font-bold text-emerald-950"
        >
          {message}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-lg font-bold text-red-950"
        >
          {errorMessage}
        </div>
      )}

      {cases.length === 0 ? (
        <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-white p-12 text-center">
          <p className="text-xl font-bold text-slate-700">ไม่มีรายการที่ต้องติดตามผล</p>
          <p className="mt-2 text-base text-slate-500">
            เมื่อส่งผู้รับบริการสำเร็จ รายการที่ต้องติดตามจะปรากฏในหน้านี้
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {cases.map((c) => {
            const isClosed = c.status === "CLOSED";
            const isContactingThis = activeContactCaseId === c.id;

            return (
              <article
                key={c.id}
                className={`rounded-3xl border-2 bg-white p-6 sm:p-7 shadow-xs transition ${
                  isClosed ? "border-slate-200 bg-slate-50/50" : "border-blue-200"
                }`}
              >
                {/* Top header row */}
                <div className="flex flex-wrap items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-950">{c.recipientName}</h2>
                    <p className="mt-1 text-base font-semibold text-blue-900">
                      {SERVICE_LABELS[c.serviceType as ServiceType] ?? c.serviceType} · วันที่รับบริการ: {c.serviceDate}
                    </p>
                  </div>

                  <span
                    className={`inline-flex items-center rounded-xl border px-3.5 py-1 text-sm font-bold ${
                      isClosed
                        ? "bg-slate-100 text-slate-700 border-slate-300"
                        : c.status === "CONTACTED"
                        ? "bg-blue-100 text-blue-900 border-blue-300"
                        : "bg-amber-100 text-amber-900 border-amber-300"
                    }`}
                  >
                    {isClosed
                      ? "สิ้นสุดการบริการแล้ว"
                      : c.status === "CONTACTED"
                      ? "ประสานงาน รพ.สต. แล้ว"
                      : "รอติดตามผล"}
                  </span>
                </div>

                {/* Case Note & Timeline */}
                {c.actions.length > 0 && (
                  <div className="mt-4 rounded-2xl bg-blue-50/60 border border-blue-100 p-4">
                    <p className="text-sm font-bold text-blue-950">บันทึกการติดตามที่ผ่านมา:</p>
                    <ul className="mt-2 space-y-2">
                      {c.actions.map((act) => (
                        <li key={act.id} className="text-base text-slate-800 border-l-3 border-blue-500 pl-3">
                          <p className="font-semibold">{act.note}</p>
                          <span className="text-xs text-slate-500">
                            {new Intl.DateTimeFormat("th-TH", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            }).format(new Date(act.createdAt))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* 2 Main Action Buttons for อสม. */}
                {!isClosed ? (
                  <div className="mt-6 pt-2">
                    <p className="text-base font-bold text-slate-800 mb-3">
                      เลือกการดำเนินการติดตามผล:
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      {/* ปุ่ม 1: สิ้นสุดการบริการ */}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleFinishService(c)}
                        className="flex flex-col items-start justify-center rounded-2xl border-2 border-slate-300 bg-slate-50 p-5 text-left transition hover:border-slate-500 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-slate-700 disabled:opacity-50"
                      >
                        <span className="text-lg font-black text-slate-900">
                          ปุ่ม 1: สิ้นสุดการบริการ
                        </span>
                        <span className="mt-1 text-sm font-semibold text-slate-600">
                          ผู้ป่วยไม่มีการรักษาต่อเนื่อง (ปิดเคสสมบูรณ์)
                        </span>
                      </button>

                      {/* ปุ่ม 2: ติดต่อเจ้าหน้าที่ รพ.สต. */}
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => setActiveContactCaseId(isContactingThis ? null : c.id)}
                        className={`flex flex-col items-start justify-center rounded-2xl border-2 p-5 text-left transition disabled:opacity-50 ${
                          isContactingThis
                            ? "border-blue-700 bg-blue-50 text-blue-950 ring-2 ring-blue-600"
                            : "border-blue-300 bg-blue-50/50 hover:border-blue-500 hover:bg-blue-100/70"
                        }`}
                      >
                        <span className="text-lg font-black text-blue-950">
                          ปุ่ม 2: ติดต่อเจ้าหน้าที่ รพ.สต.
                        </span>
                        <span className="mt-1 text-sm font-semibold text-blue-800">
                          โทรหาเจ้าหน้าที่ให้ติดตามผล เนื่องจากต้องติดตามอาการ
                        </span>
                      </button>
                    </div>

                    {/* กล่องกรอกรายละเอียดเมื่อเลือก ปุ่ม 2: ติดต่อเจ้าหน้าที่ รพ.สต. */}
                    {isContactingThis && (
                      <div className="mt-5 rounded-2xl border-2 border-blue-300 bg-blue-50/80 p-5 space-y-4">
                        <div>
                          <label
                            htmlFor={`reason-${c.id}`}
                            className="block text-base font-bold text-blue-950"
                          >
                            บอกสั้นๆ ว่าผู้ป่วยเป็นอะไร ทำไมต้องติดตามผล <span className="text-red-600">*</span>
                          </label>
                          <textarea
                            id={`reason-${c.id}`}
                            rows={3}
                            value={reasons[c.id] || ""}
                            onChange={(e) => setReasons({ ...reasons, [c.id]: e.target.value })}
                            placeholder="เช่น มีนัดล้างแผลต่อเนื่อง, อาการความดันยังสูงผิดปกติ, มีนัดเจาะเลือดซ้ำสัปดาห์หน้า"
                            className="mt-2 w-full rounded-xl border-2 border-slate-300 bg-white p-3 text-base text-slate-900 outline-none focus:border-blue-700"
                          />
                        </div>

                        <div className="flex flex-wrap items-center gap-3 pt-1">
                          {/* ปุ่มโทรหา รพ.สต. */}
                          <a
                            href="tel:1669"
                            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-blue-700 bg-white px-5 text-base font-bold text-blue-900 hover:bg-blue-100"
                          >
                            โทรติดต่อเจ้าหน้าที่ รพ.สต.
                          </a>

                          {/* ปุ่มบันทึกส่งต่อ */}
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleContactHealthCenter(c)}
                            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 text-base font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                          >
                            {isPending ? "กำลังบันทึก..." : "ยืนยันบันทึกส่งต่อ รพ.สต."}
                          </button>

                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => setActiveContactCaseId(null)}
                            className="inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-base font-bold text-slate-600 hover:text-slate-900"
                          >
                            ปิด
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <p className="text-base font-bold text-slate-700">
                      สิ้นสุดการบริการเรียบร้อย (ผู้ป่วยไม่มีการรักษาต่อเนื่อง)
                    </p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
