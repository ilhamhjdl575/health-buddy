"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { advanceJobStatus, type JobStatusHistoryItem } from "@/lib/buddy/assignments";
import { completeJobWithFollowUp } from "@/lib/buddy/follow-up";
import { SERVICE_LABELS, type ServiceType } from "@/app/_lib/services";

export type BuddyJobDetailProps = {
  job: {
    requestId: string;
    recipientName: string;
    recipientPhone: string;
    serviceType: string;
    serviceDate: string;
    startTime: string;
    endTime: string | null;
    pickupAddress: string;
    destinationAddress: string | null;
    requestStatus: string;
    mobilitySummary: string[];
    emergencyName: string | null;
    emergencyPhone: string | null;
  };
  initialHistory: JobStatusHistoryItem[];
};

const STATUS_LABELS: Record<string, string> = {
  REQUESTED: "รอการตอบรับ",
  OPEN: "เปิดรับงาน",
  MATCHING: "รอผู้ดูแลยืนยัน",
  ACCEPTED: "รับงานแล้ว",
  ON_THE_WAY: "กำลังเดินทาง",
  ARRIVED: "ถึงจุดรับแล้ว",
  IN_PROGRESS: "กำลังช่วยเหลือ",
  COMPLETED: "งานเสร็จสิ้นแล้ว",
};

const TRANSITIONS: Record<string, { target: string; buttonLabel: string; confirmTitle: string; confirmMessage: string }> = {
  ACCEPTED: {
    target: "ON_THE_WAY",
    buttonLabel: "เริ่มเดินทาง",
    confirmTitle: "ยืนยันการเริ่มเดินทาง",
    confirmMessage: "ต้องการเปลี่ยนสถานะเป็น “เริ่มเดินทาง” ใช่หรือไม่?",
  },
  ON_THE_WAY: {
    target: "ARRIVED",
    buttonLabel: "ถึงจุดรับแล้ว",
    confirmTitle: "ยืนยันการถึงจุดรับ",
    confirmMessage: "ต้องการเปลี่ยนสถานะเป็น “ถึงจุดรับแล้ว” ใช่หรือไม่?",
  },
  ARRIVED: {
    target: "IN_PROGRESS",
    buttonLabel: "เริ่มช่วยเหลือ",
    confirmTitle: "ยืนยันการเริ่มช่วยเหลือ",
    confirmMessage: "ต้องการเปลี่ยนสถานะเป็น “เริ่มช่วยเหลือ” ใช่หรือไม่?",
  },
  IN_PROGRESS: {
    target: "COMPLETED",
    buttonLabel: "ส่งผู้รับบริการสำเร็จ",
    confirmTitle: "ส่งผู้รับบริการสำเร็จ",
    confirmMessage: "ยืนยันว่าส่งผู้รับบริการเรียบร้อยแล้วใช่หรือไม่?",
  },
};

function formatHistoryTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return isoString;
  }
}

export function BuddyJobDetailView({ job, initialHistory }: BuddyJobDetailProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState<string>(job.requestStatus);
  const [history, setHistory] = useState<JobStatusHistoryItem[]>(initialHistory);
  const [showConfirm, setShowConfirm] = useState(false);
  const [followUpReason, setFollowUpReason] = useState("");
  const [showFollowUpBox, setShowFollowUpBox] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const nextTransition = TRANSITIONS[currentStatus];

  const handleCompleteWithOutcome = (outcome: "FINISH" | "CONTACT_HEALTH_CENTER") => {
    if (outcome === "CONTACT_HEALTH_CENTER" && !followUpReason.trim()) {
      setErrorMsg("กรุณาระบุสั้นๆ ว่าผู้ป่วยเป็นอะไร ทำไมต้องให้เจ้าหน้าที่ รพ.สต. ติดตามผล");
      return;
    }

    setErrorMsg(null);
    startTransition(async () => {
      const res = await completeJobWithFollowUp(job.requestId, outcome, followUpReason);
      if (!res.success) {
        setErrorMsg(res.error);
        return;
      }

      setCurrentStatus("COMPLETED");
      setShowConfirm(false);
      setShowFollowUpBox(false);
      router.refresh();
    });
  };

  const handleAdvanceStatus = () => {
    if (!nextTransition) return;
    setErrorMsg(null);

    startTransition(async () => {
      const res = await advanceJobStatus(job.requestId, nextTransition.target);
      if (!res.success) {
        setErrorMsg(res.error);
        setShowConfirm(false);
        return;
      }

      setCurrentStatus(res.status);
      setShowConfirm(false);
      setHistory(res.history);
      router.refresh();
    });
  };

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      {/* Back button */}
      <div>
        <Link
          href="/buddy/my-jobs"
          className="inline-flex items-center gap-1.5 text-base font-semibold text-blue-700 hover:text-blue-900"
        >
          ← กลับไปหน้ารวมงานของฉัน
        </Link>
      </div>

      {/* Main Job Card */}
      <div className="rounded-3xl border-2 border-blue-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <span className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              รายละเอียดงาน
            </span>
            <h1 className="mt-1 text-2xl font-bold text-slate-950 sm:text-3xl">
              {job.recipientName}
            </h1>
          </div>
          <span
            className={`inline-flex items-center rounded-full border px-4 py-1.5 text-base font-bold ${
              currentStatus === "COMPLETED"
                ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                : "bg-blue-100 text-blue-900 border-blue-300"
            }`}
          >
            {STATUS_LABELS[currentStatus] ?? currentStatus}
          </span>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-base font-medium text-red-800"
          >
            {errorMsg}
          </div>
        )}

        <dl className="mt-6 divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50 px-5 text-base sm:text-lg">
          <div className="py-3.5">
            <dt className="font-semibold text-slate-500">ประเภทงาน</dt>
            <dd className="mt-1 font-bold text-slate-900">
              {SERVICE_LABELS[job.serviceType as ServiceType] ?? job.serviceType}
            </dd>
          </div>
          <div className="py-3.5">
            <dt className="font-semibold text-slate-500">วันและเวลานัดหมาย</dt>
            <dd className="mt-1 font-bold text-slate-900">
              {job.serviceDate} · {job.startTime}
              {job.endTime ? ` - ${job.endTime}` : ""}
            </dd>
          </div>
          <div className="py-3.5">
            <dt className="font-semibold text-slate-500">จุดรับ</dt>
            <dd className="mt-1 font-bold text-slate-900">{job.pickupAddress}</dd>
          </div>
          {job.destinationAddress && (
            <div className="py-3.5">
              <dt className="font-semibold text-slate-500">จุดหมาย</dt>
              <dd className="mt-1 font-bold text-slate-900">{job.destinationAddress}</dd>
            </div>
          )}
          {job.mobilitySummary.length > 0 && (
            <div className="py-3.5">
              <dt className="font-semibold text-slate-500">การเคลื่อนไหว</dt>
              <dd className="mt-1 font-bold text-slate-900">
                {job.mobilitySummary.join(", ")}
              </dd>
            </div>
          )}
          {job.emergencyName && (
            <div className="py-3.5">
              <dt className="font-semibold text-slate-500">ผู้ติดต่อฉุกเฉิน</dt>
              <dd className="mt-1 font-bold text-slate-900">
                {job.emergencyName} {job.emergencyPhone ? `(${job.emergencyPhone})` : ""}
              </dd>
            </div>
          )}
        </dl>

        {/* Contact Buttons */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {job.recipientPhone && (
            <a
              href={`tel:${job.recipientPhone.replace(/[^0-9]/g, "")}`}
              className="flex min-h-14 items-center justify-center rounded-xl bg-teal-700 px-5 text-lg font-bold text-white hover:bg-teal-800 focus-visible:outline-3 focus-visible:outline-teal-800"
            >
              โทรหาผู้รับบริการ ({job.recipientPhone})
            </a>
          )}
          {job.emergencyPhone && (
            <a
              href={`tel:${job.emergencyPhone.replace(/[^0-9]/g, "")}`}
              className="flex min-h-14 items-center justify-center rounded-xl border-2 border-teal-700 bg-white px-5 text-lg font-bold text-teal-800 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-teal-700"
            >
              โทรหาผู้ติดต่อฉุกเฉิน
            </a>
          )}
        </div>

        {/* Status Transition Action */}
        <div className="mt-8 border-t border-slate-200 pt-6">
          {currentStatus === "COMPLETED" ? (
            <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-6 text-center">
              <p className="text-xl font-bold text-emerald-950">งานเสร็จสิ้นแล้ว</p>
              <p className="mt-1 text-base text-slate-600">
                บันทึกการให้บริการเรียบร้อย ขอบคุณสำหรับการช่วยเหลือผู้รับบริการ
              </p>
            </div>
          ) : nextTransition ? (
            <div>
              {!showConfirm ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => setShowConfirm(true)}
                  className="min-h-16 w-full rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white shadow-sm transition hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-blue-800"
                >
                  {isPending ? "กำลังอัปเดต..." : nextTransition.buttonLabel}
                </button>
              ) : currentStatus === "IN_PROGRESS" ? (
                <div
                  role="alertdialog"
                  aria-labelledby="confirm-modal-title"
                  className="rounded-3xl border-2 border-blue-400 bg-blue-50/90 p-6 sm:p-7 space-y-5"
                >
                  <div>
                    <h2 id="confirm-modal-title" className="text-2xl font-bold text-slate-950">
                      ส่งผู้รับบริการสำเร็จ
                    </h2>
                    <p className="mt-1 text-base text-slate-700">
                      เลือกขั้นตอนการติดตามผลสำหรับผู้รับบริการ:
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {/* ปุ่ม 1: สิ้นสุด */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleCompleteWithOutcome("FINISH")}
                      className="flex flex-col items-start justify-center rounded-2xl border-2 border-slate-300 bg-white p-5 text-left transition hover:border-slate-500 hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-slate-700 disabled:opacity-50"
                    >
                      <span className="text-xl font-black text-slate-900">
                        ปุ่ม 1: สิ้นสุด
                      </span>
                      <span className="mt-1.5 text-sm font-semibold text-slate-600">
                        ผู้ป่วยไม่มีการรักษาต่อเนื่อง (สิ้นสุดการบริการ)
                      </span>
                    </button>

                    {/* ปุ่ม 2: ติดต่อเจ้าหน้าที่ รพ.สต. */}
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setShowFollowUpBox(true)}
                      className={`flex flex-col items-start justify-center rounded-2xl border-2 p-5 text-left transition disabled:opacity-50 ${
                        showFollowUpBox
                          ? "border-blue-700 bg-white ring-2 ring-blue-600"
                          : "border-blue-300 bg-white hover:border-blue-500 hover:bg-blue-50"
                      }`}
                    >
                      <span className="text-xl font-black text-blue-950">
                        ปุ่ม 2: ติดต่อเจ้าหน้าที่ รพ.สต.
                      </span>
                      <span className="mt-1.5 text-sm font-semibold text-blue-800">
                        โทรหาเจ้าหน้าที่ให้ติดตามผล เนื่องจากต้องติดตามอาการ
                      </span>
                    </button>
                  </div>

                  {/* ช่องระบุข้อมูลเมื่อเลือกติดต่อ รพ.สต. */}
                  {showFollowUpBox && (
                    <div className="rounded-2xl border-2 border-blue-300 bg-white p-5 space-y-4">
                      <div>
                        <label
                          htmlFor="job-followup-reason"
                          className="block text-base font-bold text-blue-950"
                        >
                          บอกสั้นๆ ว่าผู้ป่วยเป็นอะไร ทำไมต้องติดตามผล <span className="text-red-600">*</span>
                        </label>
                        <textarea
                          id="job-followup-reason"
                          rows={3}
                          value={followUpReason}
                          onChange={(e) => setFollowUpReason(e.target.value)}
                          placeholder="เช่น มีอาการความดันยังสูงผิดปกติ, นัดล้างแผลต่อเนื่อง, ต้องพบแพทย์ซ้ำ"
                          className="mt-2 w-full rounded-xl border-2 border-slate-300 p-3 text-base text-slate-900 outline-none focus:border-blue-700"
                        />
                      </div>

                      <div className="flex flex-wrap items-center gap-3">
                        <a
                          href="tel:1669"
                          className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-blue-700 bg-white px-5 text-base font-bold text-blue-900 hover:bg-blue-50"
                        >
                          โทรติดต่อเจ้าหน้าที่ รพ.สต.
                        </a>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleCompleteWithOutcome("CONTACT_HEALTH_CENTER")}
                          className="inline-flex min-h-12 items-center justify-center rounded-xl bg-blue-700 px-6 text-base font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                        >
                          {isPending ? "กำลังบันทึก..." : "ยืนยันส่งต่อ รพ.สต."}
                        </button>
                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() => setShowFollowUpBox(false)}
                          className="inline-flex min-h-12 items-center justify-center rounded-xl px-4 text-base font-bold text-slate-600 hover:text-slate-900"
                        >
                          ปิด
                        </button>
                      </div>
                    </div>
                  )}

                  <div>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => {
                        setShowConfirm(false);
                        setShowFollowUpBox(false);
                      }}
                      className="text-base font-bold text-slate-600 hover:text-slate-900 underline"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  role="alertdialog"
                  aria-labelledby="confirm-modal-title"
                  className="rounded-2xl border-2 border-blue-400 bg-blue-50 p-6"
                >
                  <h2 id="confirm-modal-title" className="text-xl font-bold text-slate-950">
                    {nextTransition.confirmTitle}
                  </h2>
                  <p className="mt-2 text-base text-slate-700">
                    {nextTransition.confirmMessage}
                  </p>
                  <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={handleAdvanceStatus}
                      className="min-h-14 flex-1 rounded-xl bg-blue-700 px-5 text-lg font-bold text-white hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-3 focus-visible:outline-blue-800"
                    >
                      {isPending ? "กำลังบันทึก..." : "ยืนยัน"}
                    </button>
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => setShowConfirm(false)}
                      className="min-h-14 rounded-xl border-2 border-slate-400 bg-white px-5 text-lg font-bold text-slate-700 hover:bg-slate-100 disabled:opacity-50"
                    >
                      ยกเลิก
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Timeline Section */}
      <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-xl font-bold text-slate-900">บันทึกขั้นตอนการดำเนินงาน</h2>
        <p className="mt-1 text-sm text-slate-500">ประวัติการเปลี่ยนสถานะจากระบบ</p>

        {history.length > 0 ? (
          <ol className="relative mt-6 border-l-2 border-blue-200 ml-4 space-y-6">
            {history.map((item, idx) => (
              <li key={idx} className="ml-6">
                <span className="absolute -left-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 ring-4 ring-white" />
                <div className="flex flex-wrap items-center gap-2">
                  <time className="text-base font-bold text-slate-900">
                    {formatHistoryTime(item.createdAt)}
                  </time>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 text-sm font-semibold text-slate-800">
                    {STATUS_LABELS[item.toStatus] ?? item.toStatus}
                  </span>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-base text-slate-500">ยังไม่มีบันทึกขั้นตอน</p>
        )}
      </div>
    </section>
  );
}
