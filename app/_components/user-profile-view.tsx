"use client";

import { useState, useTransition } from "react";
import type { UserProfileData } from "@/lib/profile/user-profile-actions";
import { saveUserProfileData } from "@/lib/profile/user-profile-actions";

export function UserProfileView({ initialData }: { initialData: UserProfileData }) {
  const [formData, setFormData] = useState<UserProfileData>(initialData);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMessage(null);
    setErrorMessage(null);

    startTransition(async () => {
      const res = await saveUserProfileData(formData);
      if (res.success) {
        setStatusMessage(res.message);
      } else {
        setErrorMessage(res.error);
      }
    });
  };

  return (
    <div className="mx-auto max-w-3xl pb-12">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
          ข้อมูลส่วนตัว
        </h1>
        <p className="mt-2 text-lg text-slate-600">
          ตรวจสอบและแก้ไขข้อมูลผู้ใช้งาน ที่อยู่ และผู้ติดต่อฉุกเฉิน
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
        {/* Section 1: ข้อมูลผู้ใช้งาน / ผู้ดูแลผู้ป่วย */}
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            {formData.isCaregiver ? "ข้อมูลผู้ดูแลหลัก (ผู้ลงทะเบียน)" : "ข้อมูลผู้รับบริการ"}
          </h2>

          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="user-first-name" className="block text-base font-bold text-slate-800">
                ชื่อ <span className="text-red-600">*</span>
              </label>
              <input
                id="user-first-name"
                type="text"
                required
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <div>
              <label htmlFor="user-last-name" className="block text-base font-bold text-slate-800">
                นามสกุล <span className="text-red-600">*</span>
              </label>
              <input
                id="user-last-name"
                type="text"
                required
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              />
            </div>
          </div>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="user-phone" className="block text-base font-bold text-slate-800">
                เบอร์โทรศัพท์ <span className="text-red-600">*</span>
              </label>
              <input
                id="user-phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <div>
              <label htmlFor="user-gender" className="block text-base font-bold text-slate-800">
                เพศ
              </label>
              <select
                id="user-gender"
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
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
          </div>

          {!formData.isCaregiver && (
            <div className="mt-5">
              <label htmlFor="user-birth-year" className="block text-base font-bold text-slate-800">
                ปีเกิด (พ.ศ.)
              </label>
              <input
                id="user-birth-year"
                type="text"
                value={formData.birthYear}
                onChange={(e) => setFormData({ ...formData, birthYear: e.target.value })}
                placeholder="เช่น 2495"
                className="mt-1.5 min-h-14 w-full max-w-xs rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              />
            </div>
          )}
        </div>

        {/* Section 2: ข้อมูลผู้ป่วย (ถ้าเป็น Caregiver) */}
        {formData.isCaregiver && (
          <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
            <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
              ข้อมูลผู้รับการดูแล
            </h2>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div>
                <p className="block text-base font-bold text-slate-800">
                  ชื่อผู้รับการดูแล
                </p>
                <p className="mt-1.5 min-h-14 flex items-center rounded-2xl bg-slate-100 px-4 text-lg font-bold text-slate-800 border-2 border-slate-200">
                  {formData.patientName || "ไม่ระบุ"}
                </p>
              </div>

              <div>
                <label htmlFor="patient-phone" className="block text-base font-bold text-slate-800">
                  เบอร์โทรศัพท์ผู้รับการดูแล
                </label>
                <input
                  id="patient-phone"
                  type="tel"
                  value={formData.patientPhone || ""}
                  onChange={(e) => setFormData({ ...formData, patientPhone: e.target.value })}
                  placeholder="เช่น 081-234-5678 (ถ้ามี)"
                  className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                />
              </div>
            </div>
          </div>
        )}

        {/* Section 3: ที่อยู่สำหรับรับบริการ */}
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            ที่อยู่สำหรับรับบริการ
          </h2>
          <p className="mt-2 text-base text-slate-600">
            สถานที่สำหรับให้ผู้ดูแลเดินทางไปรับหรือไปให้บริการ
          </p>

          <div className="mt-5">
            <label htmlFor="user-address" className="block text-base font-bold text-slate-800">
              บ้านเลขที่ / ซอย / ถนน / จุดสังเกต
            </label>
            <textarea
              id="user-address"
              rows={3}
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="เช่น 45/2 ถ.สิโรรส ซอย 3 ใกล้ตลาดเก่า อ.เมือง จ.ยะลา"
              className="mt-1.5 w-full rounded-2xl border-2 border-slate-300 bg-white p-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
            />
          </div>
        </div>

        {/* Section: ข้อมูลยานพาหนะและการเดินทาง (ผู้รับบริการ) */}
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4 flex items-center gap-2">
            <span>🚗</span> ข้อมูลยานพาหนะส่วนตัว (ผู้รับบริการ)
          </h2>
          <div className="mt-6">
            <p className="text-base font-bold text-slate-800 mb-2">
              ผู้รับบริการหรือครอบครัวมีรถยนต์ส่วนตัวสำหรับเดินทางหรือไม่?
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasCar: true })}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${
                  formData.hasCar
                    ? "border-teal-600 bg-teal-50 ring-2 ring-teal-500 font-extrabold text-teal-950"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-2xl">🚗</span>
                <div>
                  <p className="font-bold text-base">มีรถยนต์ส่วนตัว</p>
                  <p className="text-xs text-slate-500">สามารถใช้รถในการเดินทางไปพบแพทย์ได้</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, hasCar: false })}
                className={`flex items-center gap-3 p-4 rounded-2xl border-2 text-left transition ${
                  !formData.hasCar
                    ? "border-teal-600 bg-teal-50 ring-2 ring-teal-500 font-extrabold text-teal-950"
                    : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                }`}
              >
                <span className="text-2xl">🚶</span>
                <div>
                  <p className="font-bold text-base">ไม่มีรถยนต์ส่วนตัว</p>
                  <p className="text-xs text-slate-500">ไม่มีรถยนต์ส่วนตัวสำหรับเดินทาง</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Section 4: ข้อมูลผู้ติดต่อฉุกเฉิน */}
        <div className="rounded-3xl border-2 border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
          <h2 className="text-2xl font-bold text-slate-900 border-b border-slate-100 pb-4">
            ผู้ติดต่อฉุกเฉิน
          </h2>
          <p className="mt-2 text-base text-slate-600">
            ผู้ดูแลจะติดต่อบุคคลนี้ทันทีเมื่อมีเหตุจำเป็นหรือแจ้งความคืบหน้า
          </p>

          <div className="mt-6 grid gap-5 sm:grid-cols-3">
            <div>
              <label htmlFor="emerg-name" className="block text-base font-bold text-slate-800">
                ชื่อผู้ติดต่อฉุกเฉิน <span className="text-red-600">*</span>
              </label>
              <input
                id="emerg-name"
                type="text"
                required
                value={formData.emergencyName}
                onChange={(e) => setFormData({ ...formData, emergencyName: e.target.value })}
                placeholder="เช่น คุณสมศักดิ์"
                className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <div>
              <label htmlFor="emerg-relation" className="block text-base font-bold text-slate-800">
                ความสัมพันธ์ <span className="text-red-600">*</span>
              </label>
              <input
                id="emerg-relation"
                type="text"
                required
                value={formData.emergencyRelation}
                onChange={(e) => setFormData({ ...formData, emergencyRelation: e.target.value })}
                placeholder="เช่น บุตร/หลาน, สามี/ภรรยา, ญาติ"
                className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              />
            </div>

            <div>
              <label htmlFor="emerg-phone" className="block text-base font-bold text-slate-800">
                เบอร์โทรศัพท์ <span className="text-red-600">*</span>
              </label>
              <input
                id="emerg-phone"
                type="tel"
                required
                value={formData.emergencyPhone}
                onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                placeholder="089-987-6543"
                className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
              />
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending}
            className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-teal-800 px-6 text-xl font-bold text-white shadow-md shadow-teal-950/20 transition hover:bg-teal-900 focus-visible:outline-4 focus-visible:outline-teal-800 disabled:opacity-50 active:scale-[0.99]"
          >
            {isPending ? "กำลังบันทึกข้อมูล..." : "บันทึกการแก้ไข"}
          </button>
        </div>
      </form>
    </div>
  );
}
