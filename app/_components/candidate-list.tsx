"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { selectBuddy, type CandidateBuddy } from "@/lib/matching/actions";

const QUALIFICATION_NAMES: Record<string, string> = {
  VILLAGE_HEALTH_VOLUNTEER: "อาสาสมัครสาธารณสุขประจำหมู่บ้าน (อสม.)",
  CAREGIVER_420_HOURS: "ผู้ดูแลผู้สูงอายุ (ผ่านการอบรม 420 ชั่วโมง)",
  BEDRIDDEN_CARE_TRAINING: "ผ่านการอบรมการดูแลผู้ป่วยติดเตียง",
};

export function CandidateList({
  requestId,
  buddies,
}: {
  requestId: string;
  buddies: CandidateBuddy[];
}) {
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");
  const router = useRouter();

  if (!buddies.length) {
    return (
      <div className="mx-auto max-w-2xl rounded-3xl border-2 border-dashed border-slate-300 bg-white p-10 text-center">
        <h2 className="text-2xl font-bold text-slate-800">ไม่มีผู้ดูแลที่ตรงตามเงื่อนไขในขณะนี้</h2>
        <p className="mt-2 text-base text-slate-600">
          กรุณารอสักครู่ หรือลองตรวจสอบเวลาการนัดหมายใหม่อีกครั้ง
        </p>
      </div>
    );
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6 pb-12">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          เลือกผู้ดูแล
        </h1>
        <p className="mt-1 text-base text-slate-600">
          รายชื่อผู้ดูแลที่พร้อมให้บริการตามวันและเวลาที่คุณต้องการ
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border-2 border-red-300 bg-red-50 p-4 font-bold text-red-900">
          {error}
        </div>
      )}

      <div className="space-y-4">
        {buddies.map((b) => {
          const typeLabels = b.buddyTypes.map((t) => QUALIFICATION_NAMES[t] || t);

          return (
            <article
              key={b.buddyProfileId}
              className="rounded-3xl border-2 border-slate-200 bg-white p-6 shadow-sm transition hover:border-teal-400"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <h2 className="text-2xl font-bold text-slate-950">{b.displayName}</h2>
                <span className="inline-flex items-center rounded-xl bg-teal-50 px-3 py-1 text-sm font-bold text-teal-900 border border-teal-200">
                  พร้อมรับงาน
                </span>
              </div>

              <div className="mt-4 space-y-2 text-base text-slate-700">
                <div>
                  <span className="font-semibold text-slate-500">คุณสมบัติการรับรอง: </span>
                  <span className="font-bold text-slate-900">{typeLabels.join(", ") || "ผู้ดูแลทั่วไป"}</span>
                </div>
                <div>
                  <span className="font-semibold text-slate-500">พื้นที่ให้บริการ: </span>
                  <span className="text-slate-800">{b.serviceArea || "ในพื้นที่"}</span>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={!!busy}
                  onClick={async () => {
                    setError("");
                    setBusy(b.buddyProfileId);
                    const r = await selectBuddy(requestId, b.buddyProfileId);
                    setBusy("");
                    if (!r.success) return setError(r.error);
                    router.push("/my-bookings");
                  }}
                  className="w-full flex min-h-14 items-center justify-center rounded-2xl bg-teal-700 px-6 text-lg font-bold text-white shadow-md shadow-teal-950/15 transition hover:bg-teal-800 focus-visible:outline-4 focus-visible:outline-teal-700 disabled:opacity-50 active:scale-[0.99]"
                >
                  {busy === b.buddyProfileId ? "กำลังยืนยัน..." : "เลือกผู้ดูแลท่านนี้"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
