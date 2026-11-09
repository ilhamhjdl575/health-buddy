"use client";

import { useState, useTransition } from "react";
import type { BuddyProfileData } from "@/lib/profile/buddy-profile-actions";
import { saveBuddyProfileData } from "@/lib/profile/buddy-profile-actions";

const QUALIFICATION_LABELS: Record<string, { title: string; desc: string }> = {
  VILLAGE_HEALTH_VOLUNTEER: {
    title: "อาสาสมัครสาธารณสุขประจำหมู่บ้าน (อสม.)",
    desc: "ให้บริการ: ไปเป็นเพื่อนหาหมอ",
  },
  CAREGIVER_420_HOURS: {
    title: "ผู้ดูแลผู้สูงอายุ (ผ่านการอบรม 420 ชั่วโมง)",
    desc: "ให้บริการ: ดูแลผู้ป่วยติดเตียง",
  },
  BEDRIDDEN_CARE_TRAINING: {
    title: "ผ่านการอบรมดูแลผู้ป่วยติดเตียง",
    desc: "ให้บริการ: ดูแลผู้ป่วยติดเตียง",
  },
};

const STATUS_LABELS: Record<string, { label: string; badgeClass: string }> = {
  VERIFIED: {
    label: "ผ่านการตรวจสอบแล้ว",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  PENDING: {
    label: "รอเจ้าหน้าที่ตรวจสอบเอกสาร",
    badgeClass: "bg-amber-100 text-amber-800 border-amber-300",
  },
  REJECTED: {
    label: "ไม่ผ่านการตรวจสอบ",
    badgeClass: "bg-red-100 text-red-800 border-red-300",
  },
  EXPIRED: {
    label: "เอกสารหมดอายุ",
    badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
  },
};

export function BuddyProfileView({ initialData }: { initialData: BuddyProfileData }) {
  const [formData, setFormData] = useState<BuddyProfileData>(initialData);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleToggleWorkMode = (mode: string) => {
    const current = formData.workModes || [];
    if (current.includes(mode)) {
      if (current.length === 1) return; // Must have at least 1
      setFormData({ ...formData, workModes: current.filter((m) => m !== mode) });
    } else {
      setFormData({ ...formData, workModes: [...current, mode] });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const res = await saveBuddyProfileData(formData);
      if (res.success) {
        setStatusMessage(res.message);
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-4xl pb-12">
      {/* Page Title */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          ข้อมูลส่วนตัวผู้ดูแล
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          จัดการข้อมูลส่วนตัว พื้นที่ให้บริการ และรูปแบบการรับงาน
        </p>
      </div>

      {statusMessage && (
        <div
          role="status"
          className="mb-6 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 text-lg font-bold text-emerald-900"
        >
          {statusMessage}
        </div>
      )}

      {errorMessage && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border-2 border-red-300 bg-red-50 p-4 text-lg font-bold text-red-900"
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Section 1: ข้อมูลส่วนตัว */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            ข้อมูลส่วนบุคคล
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="buddy-first-name" className="block text-base font-bold text-slate-800">
                ชื่อ <span className="text-red-600">*</span>
              </label>
              <input
                id="buddy-first-name"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1.5 min-h-13 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="buddy-last-name" className="block text-base font-bold text-slate-800">
                นามสกุล <span className="text-red-600">*</span>
              </label>
              <input
                id="buddy-last-name"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1.5 min-h-13 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="buddy-phone" className="block text-base font-bold text-slate-800">
                เบอร์โทรศัพท์ <span className="text-red-600">*</span>
              </label>
              <input
                id="buddy-phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1.5 min-h-13 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="buddy-gender" className="block text-base font-bold text-slate-800">
                เพศ
              </label>
              <select
                id="buddy-gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-1.5 min-h-13 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">เลือกเพศ</option>
                <option value="WOMAN">หญิง</option>
                <option value="MAN">ชาย</option>
                <option value="NON_BINARY">นอนไบนารี</option>
                <option value="TRANSGENDER_WOMAN">หญิงข้ามเพศ</option>
                <option value="TRANSGENDER_MAN">ชายข้ามเพศ</option>
                <option value="GENDER_DIVERSE">เพศหลากหลาย</option>
                <option value="PREFER_NOT_TO_SAY">ไม่ประสงค์ระบุ</option>
                <option value="SELF_DESCRIBE">ระบุด้วยตนเอง</option>
              </select>
            </div>

            <div>
              <label htmlFor="buddy-birth-year" className="block text-base font-bold text-slate-800">
                ปีเกิด (พ.ศ.)
              </label>
              <input
                id="buddy-birth-year"
                type="text"
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                placeholder="เช่น 2530"
                className="mt-1.5 min-h-13 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>
        </div>

        {/* Section 2: ข้อมูลการทำงานและพื้นที่ */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            พื้นที่และรูปแบบการให้บริการ
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="buddy-area" className="block text-base font-bold text-slate-800">
                พื้นที่ให้บริการหลัก (อำเภอ / ตำบล / เขต)
              </label>
              <input
                id="buddy-area"
                type="text"
                value={formData.serviceArea}
                onChange={(e) => setFormData({ ...formData, serviceArea: e.target.value })}
                placeholder="เช่น อ.เมือง จ.ยะลา"
                className="mt-1.5 min-h-13 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div>
              <label htmlFor="buddy-religion" className="block text-base font-bold text-slate-800">
                ศาสนา
              </label>
              <select
                id="buddy-religion"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
                className="mt-1.5 min-h-13 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">เลือกศาสนา</option>
                <option value="พุทธ">พุทธ</option>
                <option value="อิสลาม">อิสลาม</option>
                <option value="คริสต์">คริสต์</option>
                <option value="อื่นๆ">อื่นๆ / ไม่ระบุ</option>
              </select>
            </div>
          </div>

          {/* รูปแบบการรับงาน */}
          <div className="mt-6">
            <p className="block text-base font-bold text-slate-800">
              รูปแบบการรับงาน (เลือกได้มากกว่า 1 ข้อ)
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer transition ${
                  formData.workModes.includes("DAILY")
                    ? "border-blue-600 bg-blue-50/70 text-blue-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.workModes.includes("DAILY")}
                  onChange={() => handleToggleWorkMode("DAILY")}
                  className="size-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-base block">งานรายวัน / เป็นรายครั้ง</span>
                  <span className="text-sm text-slate-500">ไปเป็นเพื่อนหาหมอ นัดหมายตามชั่วโมง</span>
                </div>
              </label>

              <label
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 cursor-pointer transition ${
                  formData.workModes.includes("MONTHLY")
                    ? "border-blue-600 bg-blue-50/70 text-blue-950"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                <input
                  type="checkbox"
                  checked={formData.workModes.includes("MONTHLY")}
                  onChange={() => handleToggleWorkMode("MONTHLY")}
                  className="size-5 rounded text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <span className="font-bold text-base block">งานรายเดือน / ต่อเนื่อง</span>
                  <span className="text-sm text-slate-500">ดูแลผู้ป่วยติดเตียงประจำหรือต่อเนื่อง</span>
                </div>
              </label>
            </div>
          </div>

          {/* สถานะเปิดรับงาน */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="block text-base font-bold text-slate-800">
              สถานะความพร้อมรับงานในระบบ
            </p>
            <div className="mt-3 flex flex-wrap gap-4">
              <label
                className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3.5 cursor-pointer transition ${
                  formData.isActive
                    ? "border-emerald-600 bg-emerald-50 text-emerald-950 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="buddy-status"
                  checked={formData.isActive}
                  onChange={() => setFormData({ ...formData, isActive: true })}
                  className="size-5 text-emerald-600 focus:ring-emerald-500"
                />
                <span>พร้อมรับงาน (ผู้รับบริการสามารถค้นพบได้)</span>
              </label>

              <label
                className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-3.5 cursor-pointer transition ${
                  !formData.isActive
                    ? "border-amber-600 bg-amber-50 text-amber-950 font-bold"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="buddy-status"
                  checked={!formData.isActive}
                  onChange={() => setFormData({ ...formData, isActive: false })}
                  className="size-5 text-amber-600 focus:ring-amber-500"
                />
                <span>พักรับงานชั่วคราว</span>
              </label>
            </div>
          </div>
        </div>

        {/* Section: ข้อมูลยานพาหนะและการเดินทาง (ผู้ส่ง / ผู้ดูแล) */}
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
            <span>🚗</span> ข้อมูลยานพาหนะส่วนตัว (ผู้ส่ง / ผู้ดูแล)
          </h2>
          <div className="mt-6">
            <p className="text-base font-bold text-slate-800 mb-2">
              ท่านมีรถยนต์ส่วนตัวที่สามารถใช้รับ-ส่งผู้รับบริการหรือไม่?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    hasCar: true,
                    workModes: Array.from(new Set([...formData.workModes, "HAS_CAR"])),
                  })
                }
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${
                  formData.hasCar
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500 font-extrabold text-blue-950"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-2xl">🚗</span>
                <div>
                  <p className="font-bold text-base">มีรถยนต์ส่วนตัว</p>
                  <p className="text-xs text-slate-500">สามารถขับรถยนต์ไปรับ-ส่งผู้รับบริการได้</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() =>
                  setFormData({
                    ...formData,
                    hasCar: false,
                    workModes: formData.workModes.filter((m) => m !== "HAS_CAR"),
                  })
                }
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${
                  !formData.hasCar
                    ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500 font-extrabold text-blue-950"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-2xl">🚶</span>
                <div>
                  <p className="font-bold text-base">ไม่มีรถยนต์ส่วนตัว</p>
                  <p className="text-xs text-slate-500">เดินทางด้วยรถของผู้รับบริการหรือรถสาธารณะ</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Section 3: ข้อมูลคุณสมบัติและการรับรอง */}
        <div className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            คุณสมบัติและการรับรอง
          </h2>
          <p className="mt-2 text-base text-slate-600">
            ประเภทบริการที่ท่านสามารถรับงานได้ตามคุณสมบัติที่ผ่านการรับรอง
          </p>

          <div className="mt-5 space-y-4">
            {formData.qualifications.length === 0 ? (
              <p className="text-slate-500 text-base">ยังไม่มีข้อมูลคุณสมบัติที่ลงทะเบียนไว้</p>
            ) : (
              formData.qualifications.map((q, index) => {
                const info = QUALIFICATION_LABELS[q.qualificationType] || {
                  title: q.qualificationType,
                  desc: "ประเภทงานที่เกี่ยวข้อง",
                };
                const statusInfo = STATUS_LABELS[q.status] || {
                  label: q.status,
                  badgeClass: "bg-slate-100 text-slate-800 border-slate-300",
                };

                return (
                  <div
                    key={index}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border-2 border-slate-200 bg-slate-50/60 p-4"
                  >
                    <div>
                      <p className="text-lg font-bold text-slate-950">{info.title}</p>
                      <p className="text-sm font-semibold text-blue-900 mt-0.5">{info.desc}</p>
                      {q.certificateNo && (
                        <p className="text-xs text-slate-500 mt-1">เลขที่ใบรับรอง: {q.certificateNo}</p>
                      )}
                    </div>
                    <span
                      className={`inline-flex items-center self-start sm:self-center rounded-xl border px-3 py-1.5 text-sm font-bold ${statusInfo.badgeClass}`}
                    >
                      {statusInfo.label}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex min-h-14 w-full items-center justify-center rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white shadow-md shadow-blue-900/15 transition hover:bg-blue-800 focus-visible:outline-4 focus-visible:outline-blue-700 disabled:opacity-50 active:scale-[0.99]"
          >
            {isPending ? "กำลังบันทึกข้อมูล..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </div>
  );
}
