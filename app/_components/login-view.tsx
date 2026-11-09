"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";
import { signInWithGoogle } from "@/lib/auth/sign-in-google";
import { sendPhoneOtp } from "@/lib/auth/send-phone-otp";
import { verifyPhoneOtp } from "@/lib/auth/verify-phone-otp";

type PhoneStage = "IDLE" | "PHONE_INPUT" | "OTP_INPUT";

export function LoginView() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  // Google OAuth state
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  // Phone OTP states
  const [phoneStage, setPhoneStage] = useState<PhoneStage>("IDLE");
  const [phone, setPhone] = useState("");
  const [displayPhone, setDisplayPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // Error state
  const [errorMessage, setErrorMessage] = useState<string | null>(
    urlError ? "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง" : null,
  );

  // Cooldown countdown timer for resend OTP
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Handle Google OAuth
  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);

    const result = await signInWithGoogle();
    if (result.error) {
      setIsGoogleLoading(false);
      setErrorMessage("ไม่สามารถเข้าสู่ระบบด้วย Google ได้ กรุณาลองใหม่อีกครั้ง");
    }
  };

  // Handle Send OTP (Stage 1)
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSendingOtp(true);

    const result = await sendPhoneOtp(phone);
    setIsSendingOtp(false);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setDisplayPhone(result.display);
    setPhoneStage("OTP_INPUT");
    setCooldown(60);
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (cooldown > 0 || isSendingOtp) return;
    setErrorMessage(null);
    setIsSendingOtp(true);

    const result = await sendPhoneOtp(phone);
    setIsSendingOtp(false);

    if (!result.success) {
      setErrorMessage(result.error);
      return;
    }

    setDisplayPhone(result.display);
    setCooldown(60);
  };

  // Handle Verify OTP (Stage 2)
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsVerifyingOtp(true);

    const result = await verifyPhoneOtp(phone, otp);
    if (!result.success) {
      setIsVerifyingOtp(false);
      setErrorMessage(result.error);
      return;
    }

    // Full page navigation ensures session cookies are recognized by proxy and server components
    window.location.href = result.destination;
  };

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 via-white to-slate-100 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-md space-y-6">
        {/* Top Back Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1.5 text-sm font-bold text-slate-700 shadow-2xs backdrop-blur-xs transition hover:border-teal-300 hover:bg-teal-50/80 hover:text-teal-950 focus-visible:outline-2 focus-visible:outline-teal-700 active:scale-95"
            aria-label="ย้อนกลับไปหน้าแรก (Splash)"
          >
            <svg
              className="size-4 shrink-0 transition-transform group-hover:-translate-x-0.5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            <span>ย้อนกลับหน้าแรก</span>
          </Link>

          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Health Buddy
          </span>
        </div>

        {/* Top Header / Branding */}
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="focus-visible:outline-2 focus-visible:outline-teal-700 rounded-2xl">
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

        {/* Error Notification Banner */}
        {errorMessage ? (
          <div
            role="alert"
            className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-center text-sm font-semibold text-rose-900 shadow-2xs"
          >
            {errorMessage}
          </div>
        ) : null}

        {/* Authentication Card */}
        <section aria-labelledby="primary-login-heading" className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-7">
          {phoneStage === "IDLE" && (
            <div className="space-y-4">
              <h2 id="primary-login-heading" className="text-center text-lg font-bold text-slate-800">
                เลือกช่องทางเข้าสู่ระบบ
              </h2>

              <div className="grid gap-3">
                {/* Button to open Phone OTP flow */}
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setPhoneStage("PHONE_INPUT");
                  }}
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl bg-teal-700 px-6 text-lg font-bold text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99]"
                >
                  <svg className="size-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span>เข้าสู่ระบบด้วยเบอร์โทรศัพท์</span>
                </button>

                {/* Google OAuth Live Trigger */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading}
                  className="flex min-h-14 w-full items-center justify-center gap-3 rounded-2xl border-2 border-slate-300 bg-white px-6 text-lg font-bold text-slate-800 shadow-xs transition hover:bg-slate-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-slate-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <span className="inline-flex items-center gap-2 text-base font-semibold text-slate-600">
                      <svg className="size-5 animate-spin text-teal-700" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                      </svg>
                      กำลังเชื่อมต่อ Google...
                    </span>
                  ) : (
                    <>
                      <svg className="size-6 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.15z" />
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.26 21.36 7.33 24 12 24z" />
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.94 0 12s.46 3.84 1.26 5.42l4.02-3.15z" />
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z" />
                      </svg>
                      <span>เข้าสู่ระบบด้วย Google</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Stage 1: Phone Input Form */}
          {phoneStage === "PHONE_INPUT" && (
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 id="primary-login-heading" className="text-xl font-bold text-slate-900">
                  เข้าสู่ระบบด้วยเบอร์โทรศัพท์
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage(null);
                    setPhoneStage("IDLE");
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 underline"
                >
                  ย้อนกลับ
                </button>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="phone-input" className="block text-sm font-semibold text-slate-700">
                  หมายเลขโทรศัพท์มือถือ (ไทย)
                </label>
                <input
                  id="phone-input"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  required
                  placeholder="เช่น 0812345678"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full rounded-2xl border-2 border-slate-300 px-4 py-3 text-lg font-medium text-slate-950 placeholder-slate-400 focus:border-teal-600 focus:outline-none"
                />
                <p className="text-xs text-slate-500">
                  กรอกเบอร์โทรศัพท์ 10 หลัก เพื่อขอรับรหัสยืนยันทางข้อความมือถือ (SMS)
                </p>
              </div>

              <button
                type="submit"
                disabled={isSendingOtp}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 text-lg font-bold text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSendingOtp ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    กำลังส่งรหัสยืนยัน...
                  </span>
                ) : (
                  <span>ขอรับรหัสยืนยัน</span>
                )}
              </button>
            </form>
          )}

          {/* Stage 2: OTP Verification Form */}
          {phoneStage === "OTP_INPUT" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h2 id="primary-login-heading" className="text-xl font-bold text-slate-900">
                  กรอกรหัสยืนยันทางข้อความ
                </h2>
                <div className="mt-1 flex items-center justify-between text-sm text-slate-600">
                  <span>ส่งรหัสไปยัง <strong className="text-slate-900">{displayPhone}</strong></span>
                  <button
                    type="button"
                    onClick={() => {
                      setOtp("");
                      setErrorMessage(null);
                      setPhoneStage("PHONE_INPUT");
                    }}
                    className="text-xs font-bold text-teal-800 hover:text-teal-950 underline"
                  >
                    แก้ไขเบอร์
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="otp-input" className="block text-sm font-semibold text-slate-700">
                  รหัสยืนยัน 6 หลัก
                </label>
                <input
                  id="otp-input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="one-time-code"
                  required
                  placeholder="• • • • • •"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                  className="w-full tracking-widest text-center rounded-2xl border-2 border-slate-300 px-4 py-3 text-2xl font-bold text-slate-950 placeholder-slate-300 focus:border-teal-600 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifyingOtp || otp.length < 4}
                className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl bg-teal-700 px-6 text-lg font-bold text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isVerifyingOtp ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="size-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    กำลังตรวจสอบรหัส...
                  </span>
                ) : (
                  <span>ยืนยันเข้าสู่ระบบ</span>
                )}
              </button>

              <div className="pt-2 text-center">
                {cooldown > 0 ? (
                  <span className="text-sm font-medium text-slate-500">
                    ส่งรหัสอีกครั้งได้ในอีก ({cooldown} วินาที)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={isSendingOtp}
                    className="text-sm font-bold text-teal-800 underline underline-offset-4 hover:text-teal-950"
                  >
                    {isSendingOtp ? "กำลังส่งรหัสใหม่..." : "ส่งรหัสอีกครั้ง"}
                  </button>
                )}
              </div>
            </form>
          )}
        </section>

        {/* Register / Sign Up Section */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
          <p className="text-base text-slate-700">
            ยังไม่มีบัญชีใช้งานในระบบ?{" "}
            <Link
              href="/signup"
              className="font-bold text-teal-800 underline underline-offset-4 hover:text-teal-950 focus-visible:outline-2 focus-visible:outline-teal-700"
            >
              สมัครสมาชิก
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
