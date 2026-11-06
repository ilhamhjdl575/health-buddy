"use client";

import Link from "next/link";
import { useState } from "react";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";

type ModalType = "line-mock" | "phone-mock" | "google-mock" | "register-mock" | null;

export function LoginView() {
  const [modal, setModal] = useState<ModalType>(null);

  const closeModal = () => setModal(null);

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 via-white to-slate-100 px-4 py-8 sm:px-6 sm:py-12">
      <div className="mx-auto max-w-md space-y-7">
        {/* Top Header / Branding */}
        <div className="flex flex-col items-center text-center">
          <Link href="/splash" className="focus-visible:outline-2 focus-visible:outline-teal-700 rounded-2xl">
            <HealthBuddyLogo className="size-20" />
          </Link>

          <p className="mt-3 text-lg font-bold text-teal-800">Health Buddy</p>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">
            เข้าสู่ระบบเพื่อเริ่มใช้งาน
          </h1>
          <p className="mt-2 text-base text-slate-600 sm:text-lg">
            เชื่อมต่อการดูแลและบริการสุขภาพในชุมชน
          </p>
        </div>

        {/* Primary Login Option: LINE */}
        <section aria-labelledby="primary-login-heading" className="space-y-3">
          <h2 id="primary-login-heading" className="sr-only">
            ช่องทางเข้าสู่ระบบหลัก
          </h2>

          <button
            type="button"
            onClick={() => setModal("line-mock")}
            className="flex min-h-16 w-full items-center justify-center gap-3 rounded-2xl bg-[#06C755] px-6 text-xl font-bold text-white shadow-md shadow-emerald-900/15 transition hover:bg-[#05b34c] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#06C755] active:scale-[0.99]"
          >
            {/* LINE Chat Bubble Icon */}
            <svg
              className="size-7 shrink-0 fill-current"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path d="M12 2C6.48 2 2 5.92 2 10.75c0 2.94 1.66 5.56 4.25 7.15-.19.68-.78 2.5-1.07 3.45-.16.51.19.78.53.56.27-.18 2.87-1.92 4.05-2.73.73.11 1.48.17 2.24.17 5.52 0 10-3.92 10-8.75S17.52 2 12 2zm1.75 11.2h-3.5a.75.75 0 0 1 0-1.5h2.75V7.75a.75.75 0 0 1 1.5 0v4.7c0 .41-.34.75-.75.75z" />
            </svg>
            <span>เข้าสู่ระบบด้วย LINE</span>
          </button>

          <p className="text-center text-sm font-semibold text-teal-900">
            ช่องทางแนะนำสำหรับผู้สูงอายุและ อสม. (สะดวก ไม่ต้องจำรหัสผ่าน)
          </p>
        </section>

        {/* Development Role Selector (Required by Rule #3) */}
        <section
          aria-labelledby="dev-role-heading"
          className="rounded-3xl border-2 border-dashed border-amber-400 bg-amber-50/70 p-5 sm:p-6"
        >
          <div className="flex items-center gap-2 text-amber-900">
            <span className="rounded-md bg-amber-200 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-900">
              สำหรับการทดสอบระบบเท่านั้น
            </span>
          </div>

          <h2 id="dev-role-heading" className="mt-2 text-xl font-bold text-slate-950">
            ทดลองใช้งานในบทบาท (Mock Role)
          </h2>
          <p className="mt-1 text-sm text-slate-700">
            เลือกบทบาทเพื่อเข้าสู่หน้าจอทำงานของกลุ่มผู้ใช้แต่ละประเภท:
          </p>

          <div className="mt-4 grid gap-2.5">
            {/* Role 1: User */}
            <Link
              href="/user"
              className="flex min-h-14 items-center justify-between rounded-2xl border-2 border-teal-300 bg-white px-4 py-3 shadow-xs transition hover:border-teal-600 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-teal-700"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800" aria-hidden="true">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-lg font-bold text-slate-950">ผู้รับบริการ (USER)</p>
                  <p className="text-xs text-slate-600">ผู้สูงอายุ / ผู้ขอความช่วยเหลือ</p>
                </div>
              </div>
              <span className="text-sm font-bold text-teal-800">เข้าสู่ระบบ →</span>
            </Link>

            {/* Role 2: Buddy */}
            <Link
              href="/buddy"
              className="flex min-h-14 items-center justify-between rounded-2xl border-2 border-blue-300 bg-white px-4 py-3 shadow-xs transition hover:border-blue-600 hover:bg-blue-50 focus-visible:outline-3 focus-visible:outline-blue-700"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-800" aria-hidden="true">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z"/>
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-lg font-bold text-slate-950">อสม. (BUDDY)</p>
                  <p className="text-xs text-slate-600">อาสาสมัครสาธารณสุขชุมชน</p>
                </div>
              </div>
              <span className="text-sm font-bold text-blue-800">เข้าสู่ระบบ →</span>
            </Link>

            {/* Role 3: Admin */}
            <Link
              href="/admin"
              className="flex min-h-14 items-center justify-between rounded-2xl border-2 border-slate-300 bg-white px-4 py-3 shadow-xs transition hover:border-slate-600 hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-slate-800"
            >
              <div className="flex items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-800" aria-hidden="true">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
                  </svg>
                </span>
                <div className="text-left">
                  <p className="text-lg font-bold text-slate-950">ผู้ดูแลระบบ (ADMIN)</p>
                  <p className="text-xs text-slate-600">เจ้าหน้าที่และผู้ประสานงานกลาง</p>
                </div>
              </div>
              <span className="text-sm font-bold text-slate-800">เข้าสู่ระบบ →</span>
            </Link>
          </div>
        </section>

        {/* Additional Login Options (Required by Rule #4) */}
        <section aria-labelledby="other-login-heading" className="space-y-3">
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-slate-300" />
            <span className="absolute bg-white px-3 text-sm font-semibold text-slate-500">
              หรือเข้าสู่ระบบด้วย
            </span>
          </div>

          <div className="grid gap-2.5 pt-2">
            {/* Phone Login Mock */}
            <button
              type="button"
              onClick={() => setModal("phone-mock")}
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-300 bg-white px-5 text-lg font-bold text-slate-800 shadow-xs hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-slate-700"
            >
              <svg className="size-5 fill-current text-slate-700" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <span>เข้าสู่ระบบด้วยเบอร์โทร</span>
            </button>

            {/* Google Login Mock */}
            <button
              type="button"
              onClick={() => setModal("google-mock")}
              className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-300 bg-white px-5 text-lg font-bold text-slate-800 shadow-xs hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-slate-700"
            >
              {/* Google G Icon */}
              <svg className="size-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              <span>เข้าสู่ระบบด้วย Google</span>
            </button>
          </div>

          <p className="text-center text-xs text-slate-500">
            ช่องทางเพิ่มเติม — อยู่ระหว่างพัฒนา (Authentication หลักคือ LINE)
          </p>
        </section>

        {/* Register / Sign Up Section (Required by Rule #5) */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-base text-slate-700">
            ยังไม่มีบัญชีใช้งานในระบบ?{" "}
            <button
              type="button"
              onClick={() => setModal("register-mock")}
              className="font-bold text-teal-800 underline underline-offset-4 hover:text-teal-950 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              สมัครสมาชิก
            </button>
          </p>
        </div>

        {/* Navigation to Splash */}
        <div className="text-center pt-2">
          <Link href="/" className="text-sm font-semibold text-slate-500 hover:text-slate-900">
            ← ย้อนกลับไปหน้าเปิด (Splash)
          </Link>
        </div>
      </div>

      {/* Modal Dialog for Mock Actions */}
      {modal ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl sm:p-8 space-y-4">
            {modal === "line-mock" && (
              <>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-800" aria-hidden="true">
                  <svg className="size-6 fill-current" viewBox="0 0 24 24">
                    <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                  </svg>
                </div>
                <h3 id="modal-title" className="text-2xl font-bold text-slate-950">
                  จำลองการเข้าสู่ระบบด้วย LINE
                </h3>
                <p className="text-base leading-relaxed text-slate-700">
                  ในเวอร์ชันจริง ระบบจะเชื่อมต่อกับ <strong>LINE LIFF / LINE Login</strong> เพื่อระบุตัวตนของผู้สูงอายุและ อสม. โดยไม่ต้องกรอกรหัสผ่าน
                </p>
                <div className="rounded-2xl bg-slate-50 p-4 text-sm font-semibold text-slate-800">
                  สำหรับการทดสอบในขั้นตอนนี้ กรุณาเลือกบทบาทที่ต้องการจากส่วน <strong>&quot;ทดลองใช้งานในบทบาท&quot;</strong> บนหน้าจอ
                </div>
              </>
            )}

            {(modal === "phone-mock" || modal === "google-mock") && (
              <>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800" aria-hidden="true">
                  <svg className="size-6 fill-current" viewBox="0 0 24 24">
                    <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/>
                  </svg>
                </div>
                <h3 id="modal-title" className="text-2xl font-bold text-slate-950">
                  ช่องทางเพิ่มเติม — อยู่ระหว่างพัฒนา
                </h3>
                <p className="text-base leading-relaxed text-slate-700">
                  ช่องทางนี้จัดทำขึ้นเพื่อแสดงแนวทาง UI ตามต้นแบบ ทั้งนี้ Authentication หลักสำหรับผู้รับบริการและ อสม. คือ <strong>LINE Login</strong> เพื่อความง่ายในการใช้งาน
                </p>
              </>
            )}

            {modal === "register-mock" && (
              <>
                <div className="flex size-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-800" aria-hidden="true">
                  <svg className="size-6 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z"/>
                  </svg>
                </div>
                <h3 id="modal-title" className="text-2xl font-bold text-slate-950">
                  การสมัครสมาชิก Health Buddy
                </h3>
                <p className="text-base leading-relaxed text-slate-700">
                  การลงทะเบียนผู้ใช้งานจะเชื่อมกับระบบยืนยันตัวตนในขั้นตอนถัดไป (ปัจจุบันอยู่ในระยะ Frontend Mock)
                </p>
              </>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="min-h-14 w-full rounded-2xl bg-slate-900 px-6 text-lg font-bold text-white shadow-sm hover:bg-slate-800 focus-visible:outline-2 focus-visible:outline-slate-800"
              >
                เข้าใจแล้ว / ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

