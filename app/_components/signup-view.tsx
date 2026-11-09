"use client";

import Link from "next/link";
import { useState } from "react";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";
import { ROLE_HOME_PATH, type UserRole } from "@/app/_lib/auth";
import { saveBedriddenStatus } from "@/app/_lib/mobility-profile";
import { signOut } from "@/lib/auth/sign-out";
import { completeProfileOnboarding } from "@/lib/profile/complete-onboarding";
import {
  mapBuddyFormDataToProfileInput,
  mapUserFormDataToProfileInput,
} from "@/lib/profile/signup-mapping";

export type SignupRole = UserRole | null;

interface UserFormData {
  applicantType: "PATIENT_CAREGIVER" | "PATIENT" | "";
  caregiverFirstName: string;
  caregiverLastName: string;
  caregiverPhone: string;
  caregiverGender: string;
  fullName: string;
  phone: string;
  birthYear: string;
  gender: string;
  address: string;
  mobilityStatuses: string[];
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

interface BuddyFormData {
  firstName: string;
  lastName: string;
  phone: string;
  religion: string;
  gender: string;
  buddyTypes: ("VILLAGE_HEALTH_VOLUNTEER" | "CAREGIVER_420_HOURS")[];
  workModes: ("DAILY" | "MONTHLY")[];
  certificates: Partial<Record<"VILLAGE_HEALTH_VOLUNTEER" | "CAREGIVER_420_HOURS", File>>;
}

export function SignupView() {
  const [role, setRole] = useState<SignupRole>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verifiedRedirectPath, setVerifiedRedirectPath] = useState<string | null>(null);

  // Form states
  const [userData, setUserData] = useState<UserFormData>({
    applicantType: "",
    caregiverFirstName: "",
    caregiverLastName: "",
    caregiverPhone: "",
    caregiverGender: "",
    fullName: "",
    phone: "",
    birthYear: "",
    gender: "",
    address: "",
    mobilityStatuses: [],
    emergencyName: "",
    emergencyRelation: "บุตร/หลาน",
    emergencyPhone: "",
  });

  const [buddyData, setBuddyData] = useState<BuddyFormData>({
    firstName: "",
    lastName: "",
    phone: "",
    religion: "",
    gender: "",
    buddyTypes: [],
    workModes: [],
    certificates: {},
  });

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    setErrors({});
  };

  const handleResetRole = () => {
    setRole(null);
    setErrors({});
    setIsSubmitted(false);
    setVerifiedRedirectPath(null);
  };

  const handleBuddyTypeToggle = (buddyType: BuddyFormData["buddyTypes"][number]) => {
    setBuddyData((prev) => ({
      ...prev,
      buddyTypes: prev.buddyTypes.includes(buddyType)
        ? prev.buddyTypes.filter((item) => item !== buddyType)
        : [...prev.buddyTypes, buddyType],
      workModes:
        buddyType === "CAREGIVER_420_HOURS" && prev.buddyTypes.includes(buddyType)
          ? []
          : prev.workModes,
      certificates: prev.buddyTypes.includes(buddyType)
        ? Object.fromEntries(Object.entries(prev.certificates).filter(([key]) => key !== buddyType))
        : prev.certificates,
    }));
  };

  const handleWorkModeToggle = (workMode: BuddyFormData["workModes"][number]) => {
    setBuddyData((prev) => ({
      ...prev,
      workModes: prev.workModes.includes(workMode)
        ? prev.workModes.filter((item) => item !== workMode)
        : [...prev.workModes, workMode],
    }));
  };

  const handleMobilityToggle = (mobilityStatus: string) => {
    setUserData((prev) => ({
      ...prev,
      mobilityStatuses: mobilityStatus === "walks-normally"
        ? (prev.mobilityStatuses.includes("walks-normally") ? [] : ["walks-normally"])
        : prev.mobilityStatuses.includes(mobilityStatus)
          ? prev.mobilityStatuses.filter((item) => item !== mobilityStatus)
          : [...prev.mobilityStatuses.filter((item) => item !== "walks-normally"), mobilityStatus],
    }));
  };

  const validateUserForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!userData.applicantType) {
      errs.applicantType = "กรุณาเลือกประเภทผู้ใช้งาน";
    }
    if (userData.applicantType === "PATIENT_CAREGIVER") {
      if (!userData.caregiverFirstName.trim()) errs.caregiverFirstName = "กรุณากรอกชื่อผู้ดูแลผู้ป่วย";
      if (!userData.caregiverLastName.trim()) errs.caregiverLastName = "กรุณากรอกนามสกุลผู้ดูแลผู้ป่วย";
      if (!userData.caregiverGender) errs.caregiverGender = "กรุณาเลือกเพศผู้ดูแลผู้ป่วย";
      if (!userData.caregiverPhone.trim()) {
        errs.caregiverPhone = "กรุณากรอกเบอร์โทรศัพท์ผู้ดูแลผู้ป่วย";
      } else if (!/^[0-9-]{9,12}$/.test(userData.caregiverPhone.replace(/\s+/g, ""))) {
        errs.caregiverPhone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)";
      }
    }
    if (userData.fullName.trim().split(/\s+/).filter(Boolean).length < 2) {
      errs.fullName = "กรุณากรอกชื่อและนามสกุลผู้ป่วย";
    }
    if (!userData.gender) {
      errs.gender = "กรุณาเลือกเพศ";
    }
    if (userData.applicantType === "PATIENT" && !userData.phone.trim()) {
      errs.phone = "กรุณากรอกเบอร์โทรศัพท์มือถือ";
    } else if (userData.phone.trim() && !/^[0-9-]{9,12}$/.test(userData.phone.replace(/\s+/g, ""))) {
      errs.phone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)";
    }
    const birthYear = Number(userData.birthYear.trim());
    const currentBuddhistYear = new Date().getFullYear() + 543;
    if (!userData.birthYear.trim()) {
      errs.birthYear = "กรุณากรอกปีเกิดผู้ป่วย";
    } else if (
      !/^\d{4}$/.test(userData.birthYear.trim()) ||
      !Number.isInteger(birthYear) ||
      birthYear < 2443 ||
      birthYear > currentBuddhistYear
    ) {
      errs.birthYear = `กรุณากรอกปี พ.ศ. 4 หลัก ระหว่าง 2443–${currentBuddhistYear} เช่น 2495`;
    }
    if (!userData.address.trim()) errs.address = "กรุณากรอกที่อยู่ผู้ป่วย";
    if (userData.applicantType === "PATIENT") {
      if (!userData.emergencyName.trim()) {
        errs.emergencyName = "กรุณาระบุชื่อผู้ติดต่อฉุกเฉิน";
      }
      if (!userData.emergencyRelation.trim()) {
        errs.emergencyRelation = "กรุณาระบุความสัมพันธ์ของผู้ติดต่อฉุกเฉิน";
      }
      if (!userData.emergencyPhone.trim()) {
        errs.emergencyPhone = "กรุณาระบุเบอร์โทรผู้ติดต่อฉุกเฉิน";
      } else if (!/^[0-9-]{9,12}$/.test(userData.emergencyPhone.replace(/\s+/g, ""))) {
        errs.emergencyPhone = "กรุณากรอกเบอร์โทรผู้ติดต่อฉุกเฉินให้ถูกต้อง (9-10 หลัก)";
      }
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const validateBuddyForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!buddyData.firstName.trim()) errs.firstName = "กรุณากรอกชื่อ";
    if (!buddyData.lastName.trim()) errs.lastName = "กรุณากรอกนามสกุล";
    if (!buddyData.phone.trim()) {
      errs.phone = "กรุณากรอกเบอร์โทรศัพท์มือถือ";
    } else if (!/^[0-9-]{9,12}$/.test(buddyData.phone.replace(/\s+/g, ""))) {
      errs.phone = "กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (9-10 หลัก)";
    }
    if (!buddyData.religion) errs.religion = "กรุณาเลือกศาสนา";
    if (!buddyData.gender) errs.gender = "กรุณาเลือกเพศ";
    if (buddyData.buddyTypes.length === 0) errs.buddyTypes = "กรุณาเลือกประเภท Buddy อย่างน้อย 1 ประเภท";
    buddyData.buddyTypes.forEach((type) => {
      if (!buddyData.certificates[type]) errs[`certificate-${type}`] = "กรุณาอัปโหลดใบรับรอง";
    });
    if (buddyData.buddyTypes.includes("CAREGIVER_420_HOURS") && buddyData.workModes.length === 0) {
      errs.workModes = "กรุณาเลือกรูปแบบการทำงานอย่างน้อย 1 แบบ";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateUserForm()) return;

    setIsSubmitting(true);
    const result = await completeProfileOnboarding(mapUserFormDataToProfileInput(userData));
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ form: result.error });
      return;
    }

    setVerifiedRedirectPath(result.redirectPath);
    saveBedriddenStatus(userData.mobilityStatuses.includes("bedridden"));
    setIsSubmitted(true);
  };

  const handleBuddySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateBuddyForm()) return;

    setIsSubmitting(true);
    const certificateData = new FormData();
    buddyData.buddyTypes.forEach((type) => {
      const certificate = buddyData.certificates[type];
      if (certificate) certificateData.append(type, certificate);
    });
    const result = await completeProfileOnboarding(
      mapBuddyFormDataToProfileInput(buddyData),
      certificateData,
    );
    setIsSubmitting(false);

    if (!result.success) {
      setErrors({ form: result.error });
      return;
    }

    setVerifiedRedirectPath(result.redirectPath);
    setIsSubmitted(true);
  };

  // SUCCESS SCREEN
  if (isSubmitted) {
    const isUser = role === "USER";
    const displayName = isUser ? userData.fullName : `${buddyData.firstName} ${buddyData.lastName}`;
    const targetDashboard = verifiedRedirectPath || (isUser ? ROLE_HOME_PATH.USER : ROLE_HOME_PATH.BUDDY);
    const dashboardLabel = isUser ? "ไปยังหน้าหลักผู้รับบริการ" : "ไปยังหน้าหลักผู้ดูแล";

    return (
      <div className="min-h-screen bg-linear-to-b from-teal-50 via-white to-slate-100 px-4 py-8 sm:px-6 sm:py-16">
        <main className="mx-auto max-w-xl">
          <div className="rounded-3xl border-2 border-teal-200 bg-white p-6 sm:p-10 text-center shadow-xl">
            <div className="mx-auto flex size-20 items-center justify-center rounded-3xl bg-teal-100 text-teal-800 shadow-inner">
              <svg className="size-10 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>

            <span className="mt-5 inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-bold text-teal-800">
              {isUser ? "สมัครสมาชิกผู้รับบริการสำเร็จ" : "สมัครสมาชิกผู้ดูแล (Buddy) สำเร็จ"}
            </span>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-950 sm:text-4xl">
              ยินดีต้อนรับสู่ Health Buddy
            </h1>

            <p className="mt-3 text-xl font-bold text-teal-900">
              สวัสดีคุณ {displayName || (isUser ? "ผู้รับบริการ" : "ผู้ดูแล")}
            </p>

            <p className="mt-3 text-base leading-relaxed text-slate-700 sm:text-lg">
              {isUser
                ? "บัญชีของคุณพร้อมใช้งานแล้ว คุณสามารถขอให้ผู้ดูแลพาไปพบแพทย์ หรือขอผู้ผ่านการอบรมมาดูแลผู้ป่วยติดเตียงได้"
                : "ข้อมูลของคุณได้รับการบันทึกเรียบร้อยแล้ว คุณสามารถตรวจสอบงานที่เปิดรับ กำหนดเวลาสะดวก และเริ่มให้ความช่วยเหลือผู้สูงอายุในชุมชนได้ทันที"}
            </p>

            <div className="mt-8 space-y-3">
              <Link
                href={targetDashboard}
                className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-teal-700 px-6 text-xl font-bold text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99]"
              >
                {dashboardLabel} →
              </Link>

              <Link
                href="/login"
                className="flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-slate-300 bg-white px-6 text-lg font-bold text-slate-700 transition hover:bg-slate-50 focus-visible:outline-3 focus-visible:outline-slate-700"
              >
                กลับไปหน้าเข้าสู่ระบบ
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50 via-white to-slate-100 px-4 py-6 sm:px-6 sm:py-10">
      <div className="mx-auto max-w-2xl space-y-6">
        {/* Top Back Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="group inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1.5 text-sm font-bold text-slate-700 shadow-2xs backdrop-blur-xs transition hover:border-teal-300 hover:bg-teal-50/80 hover:text-teal-950 focus-visible:outline-2 focus-visible:outline-teal-700 active:scale-95"
            aria-label="ย้อนกลับไปหน้าเข้าสู่ระบบ"
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
            <span>เข้าสู่ระบบ</span>
          </Link>

          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Health Buddy
          </span>
        </div>

        <form action={signOut} className="flex justify-end">
          <button
            type="submit"
            className="rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-bold text-rose-700 shadow-2xs transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-rose-700"
          >
            ออกจากบัญชี Google / ใช้บัญชีอื่น
          </button>
        </form>

        {/* Top Header & Branding */}
        <header className="flex flex-col items-center text-center">
          <Link
            href="/"
            className="rounded-2xl transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-teal-700"
          >
            <HealthBuddyLogo className="size-16 sm:size-20" />
          </Link>
          <p className="mt-2 text-base font-bold text-teal-800 sm:text-lg">Health Buddy</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">
            สมัครสมาชิกใหม่
          </h1>
          <p className="mt-1.5 text-base text-slate-600 sm:text-lg">
            คนใกล้บ้าน เชื่อมทุกการดูแลอย่างเท่าเทียม
          </p>
        </header>

        {/* STEP 1: ROLE SELECTION (When no role selected yet) */}
        {!role && (
          <main aria-labelledby="role-selection-heading" className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
              <div className="text-center">
                <span className="inline-block rounded-full bg-teal-100 px-4 py-1 text-sm font-bold text-teal-800">
                  ขั้นตอนที่ 1 จาก 2
                </span>
                <h2
                  id="role-selection-heading"
                  className="mt-2 text-2xl font-extrabold text-slate-950 sm:text-3xl"
                >
                  เลือกประเภทผู้ใช้งาน
                </h2>
                <p className="mt-2 text-base text-slate-600 sm:text-lg">
                  กรุณาเลือกว่าท่านต้องการสมัครสมาชิกในบทบาทใดเพื่อดำเนินการต่อ:
                </p>
              </div>

              {/* 2 Big Choice Cards */}
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                {/* Option 1: USER */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("USER")}
                  className="group relative flex flex-col justify-between rounded-3xl border-3 border-teal-300 bg-linear-to-b from-teal-50/70 to-white p-5 text-left shadow-sm transition hover:border-teal-600 hover:shadow-md hover:bg-teal-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-teal-100 text-teal-800 shadow-inner group-hover:bg-teal-700 group-hover:text-white transition-colors" aria-hidden="true">
                        <svg className="size-8 fill-current" viewBox="0 0 24 24">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                      </span>
                      <span className="rounded-full bg-teal-200/80 px-3 py-1 text-xs font-bold text-teal-900">
                        สำหรับผู้รับบริการ
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-slate-950 group-hover:text-teal-900 transition-colors">
                      ผู้รับบริการ (User)
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      ผู้สูงอายุ / ผู้ป่วย / ผู้ขอความช่วยเหลือ
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      เหมาะสำหรับผู้สูงอายุหรือญาติที่ต้องการคนพาไปพบแพทย์ หรือดูแลผู้ป่วยติดเตียงที่บ้าน
                    </p>

                    <ul className="mt-4 space-y-2 border-t border-teal-100 pt-3 text-xs font-bold text-teal-900">
                      <li className="flex items-center gap-2">
                        <span className="text-teal-600">✔</span> ขอรับความช่วยเหลือสะดวกในชุมชน
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-teal-600">✔</span> มีผู้ดูแลคอยช่วยเหลืออย่างปลอดภัย
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-teal-600">✔</span> บันทึกข้อมูลการเคลื่อนไหวเพื่อการดูแลที่เหมาะสม
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex min-h-12 w-full items-center justify-center rounded-2xl bg-teal-700 px-4 text-base font-bold text-white shadow-xs group-hover:bg-teal-800 transition">
                    <span>สมัครเป็นผู้รับบริการ →</span>
                  </div>
                </button>

                {/* Option 2: BUDDY */}
                <button
                  type="button"
                  onClick={() => handleRoleSelect("BUDDY")}
                  className="group relative flex flex-col justify-between rounded-3xl border-3 border-blue-300 bg-linear-to-b from-blue-50/70 to-white p-5 text-left shadow-sm transition hover:border-blue-600 hover:shadow-md hover:bg-blue-50 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700 active:scale-[0.99]"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="flex size-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-800 shadow-inner group-hover:bg-blue-700 group-hover:text-white transition-colors" aria-hidden="true">
                        <svg className="size-8 fill-current" viewBox="0 0 24 24">
                          <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
                        </svg>
                      </span>
                      <span className="rounded-full bg-blue-200/80 px-3 py-1 text-xs font-bold text-blue-900">
                        สำหรับผู้ดูแล
                      </span>
                    </div>

                    <h3 className="mt-4 text-2xl font-black text-slate-950 group-hover:text-blue-900 transition-colors">
                      ผู้ดูแล (Buddy)
                    </h3>
                    <p className="mt-1 text-sm font-semibold text-slate-600">
                      ผู้ดูแลผู้สูงอายุ / จิตอาสาในชุมชน
                    </p>

                    <p className="mt-3 text-sm leading-relaxed text-slate-700">
                      เหมาะสำหรับผู้ที่ต้องการช่วยเหลือผู้สูงอายุในชุมชน ร่วมสร้างสังคมที่อบอุ่นและมีรายได้เสริม
                    </p>

                    <ul className="mt-4 space-y-2 border-t border-blue-100 pt-3 text-xs font-bold text-blue-900">
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">✔</span> เลือกเวลารับงานตามความสะดวก
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">✔</span> ช่วยเหลือผู้สูงอายุในละแวกใกล้บ้าน
                      </li>
                      <li className="flex items-center gap-2">
                        <span className="text-blue-600">✔</span> มีระบบข้อมูลงานและประวัติชัดเจน
                      </li>
                    </ul>
                  </div>

                  <div className="mt-6 flex min-h-12 w-full items-center justify-center rounded-2xl bg-blue-700 px-4 text-base font-bold text-white shadow-xs group-hover:bg-blue-800 transition">
                    <span>สมัครเป็นผู้ดูแล (Buddy) →</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Back to Login link */}
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center">
              <p className="text-base text-slate-700">
                มีบัญชี Health Buddy อยู่แล้ว?{" "}
                <Link
                  href="/login"
                  className="font-bold text-teal-800 underline underline-offset-4 hover:text-teal-950 focus-visible:outline-2 focus-visible:outline-teal-700"
                >
                  เข้าสู่ระบบที่นี่
                </Link>
              </p>
            </div>
          </main>
        )}

        {/* STEP 2: USER REGISTRATION FORM */}
        {role === "USER" && (
          <main aria-labelledby="user-form-heading" className="space-y-6">
            {/* Role Header Banner with Change Role button */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-teal-200 bg-teal-50/80 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-teal-700 text-white" aria-hidden="true">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-teal-800">บทบาทที่เลือก</p>
                  <p className="text-lg font-black text-teal-950">ผู้รับบริการ (User)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetRole}
                className="rounded-xl border border-teal-700 bg-white px-3.5 py-1.5 text-sm font-bold text-teal-800 hover:bg-teal-100 transition focus-visible:outline-2 focus-visible:outline-teal-700"
              >
                ← เปลี่ยนบทบาท
              </button>
            </div>

            {/* User Form Container */}
            <form
              noValidate
              onSubmit={handleUserSubmit}
              className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6"
            >
              <div className="order-0">
                <span className="inline-block rounded-full bg-teal-100 px-3.5 py-1 text-xs font-bold text-teal-800">
                  ขั้นตอนที่ 2 จาก 2
                </span>
                <h2 id="user-form-heading" className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  กรอกข้อมูลผู้รับบริการ
                </h2>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">
                  ข้อมูลนี้ช่วยให้ผู้ดูแลสามารถติดต่อและเตรียมการช่วยเหลือได้อย่างถูกต้องและปลอดภัย
                </p>
              </div>

              <fieldset className="order-1 space-y-4 border-t border-slate-100 pt-5">
                <legend className="text-lg font-bold text-slate-900">
                  ผู้ใช้งานเป็น <span className="text-red-600">*</span>
                </legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {([
                    ["PATIENT_CAREGIVER", "ผู้ดูแลผู้ป่วย"],
                    ["PATIENT", "ผู้ป่วยเอง"],
                  ] as const).map(([value, label]) => (
                    <label
                      key={value}
                      className={`flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-2 p-4 text-lg font-bold transition ${
                        userData.applicantType === value
                          ? "border-teal-700 bg-teal-50 text-teal-950"
                          : "border-slate-200 bg-white text-slate-900 hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="applicantType"
                        value={value}
                        checked={userData.applicantType === value}
                        onChange={() => setUserData({ ...userData, applicantType: value })}
                        className="size-5 accent-teal-700"
                      />
                      {label}
                    </label>
                  ))}
                </div>
                {errors.applicantType && (
                  <p className="text-sm font-bold text-red-600">{errors.applicantType}</p>
                )}
              </fieldset>

              {/* Section 1: General Info */}
              {userData.applicantType === "PATIENT_CAREGIVER" && (
                <fieldset className="order-2 space-y-4 border-t border-slate-100 pt-5">
                  <legend className="text-lg font-bold text-slate-900">ข้อมูลผู้ดูแลผู้ป่วย</legend>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="caregiver-first-name" className="block text-base font-bold text-slate-900">
                        ชื่อ <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="caregiver-first-name"
                        type="text"
                        required
                        value={userData.caregiverFirstName}
                        onChange={(e) => setUserData({ ...userData, caregiverFirstName: e.target.value })}
                        className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                      />
                      {errors.caregiverFirstName && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.caregiverFirstName}</p>}
                    </div>
                    <div>
                      <label htmlFor="caregiver-last-name" className="block text-base font-bold text-slate-900">
                        นามสกุล <span className="text-red-600">*</span>
                      </label>
                      <input
                        id="caregiver-last-name"
                        type="text"
                        required
                        value={userData.caregiverLastName}
                        onChange={(e) => setUserData({ ...userData, caregiverLastName: e.target.value })}
                        className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                      />
                      {errors.caregiverLastName && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.caregiverLastName}</p>}
                    </div>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="caregiver-phone" className="block text-base font-bold text-slate-900">เบอร์โทรศัพท์ <span className="text-red-600">*</span></label>
                      <input id="caregiver-phone" type="tel" required value={userData.caregiverPhone} onChange={(e) => setUserData({ ...userData, caregiverPhone: e.target.value })} placeholder="089-123-4567" className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100" />
                      {errors.caregiverPhone && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.caregiverPhone}</p>}
                    </div>
                    <div>
                      <label htmlFor="caregiver-gender" className="block text-base font-bold text-slate-900">เพศ <span className="text-red-600">*</span></label>
                      <select id="caregiver-gender" required value={userData.caregiverGender} onChange={(e) => setUserData({ ...userData, caregiverGender: e.target.value })} className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100">
                        <option value="">เลือกเพศ</option><option value="WOMAN">หญิง</option><option value="MAN">ชาย</option><option value="NON_BINARY">นอนไบนารี</option><option value="TRANSGENDER_WOMAN">หญิงข้ามเพศ</option><option value="TRANSGENDER_MAN">ชายข้ามเพศ</option><option value="GENDER_DIVERSE">เพศหลากหลาย</option><option value="PREFER_NOT_TO_SAY">ไม่ประสงค์ระบุ</option><option value="SELF_DESCRIBE">ระบุด้วยตนเอง</option>
                      </select>
                      {errors.caregiverGender && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.caregiverGender}</p>}
                    </div>
                  </div>
                </fieldset>
              )}

              <fieldset className={`space-y-4 border-t border-slate-100 pt-5 ${userData.applicantType ? "" : "hidden"} ${userData.applicantType === "PATIENT_CAREGIVER" ? "order-4" : "order-2"}`}>
                <legend className="text-lg font-bold text-slate-900">
                  {userData.applicantType === "PATIENT_CAREGIVER"
                    ? "ข้อมูลผู้ป่วย"
                    : "ข้อมูลส่วนตัวผู้ป่วย"}
                </legend>

                <div>
                  <label htmlFor="user-fullname" className="block text-base font-bold text-slate-900">
                    ชื่อ - นามสกุล <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="user-fullname"
                    type="text"
                    required
                    value={userData.fullName}
                    onChange={(e) => setUserData({ ...userData, fullName: e.target.value })}
                    placeholder="เช่น คุณยายสมศรี ใจดี"
                    className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                  />
                  {errors.fullName && (
                    <p className="mt-1.5 text-sm font-bold text-red-600">{errors.fullName}</p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="user-phone" className="block text-base font-bold text-slate-900">
                      เบอร์โทรศัพท์มือถือ {userData.applicantType === "PATIENT" && <span className="text-red-600">*</span>}
                    </label>
                    <input
                      id="user-phone"
                      type="tel"
                      required={userData.applicantType === "PATIENT"}
                      value={userData.phone}
                      onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                      placeholder="081-234-5678"
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-sm font-bold text-red-600">{errors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="user-birthyear" className="block text-base font-bold text-slate-900">
                      ปีเกิด (พ.ศ.) <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="user-birthyear"
                      type="text"
                      required
                      value={userData.birthYear}
                      onChange={(e) => setUserData({ ...userData, birthYear: e.target.value })}
                      placeholder="เช่น 2495 (อายุประมาณ 74 ปี)"
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                    />
                    {errors.birthYear && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.birthYear}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="user-gender" className="block text-base font-bold text-slate-900">
                    เพศ <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="user-gender"
                    required
                    value={userData.gender}
                    onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
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
                  {errors.gender && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.gender}</p>}
                </div>
              </fieldset>

              {/* Section 2: Area & Address */}
              <fieldset className={`space-y-4 border-t border-slate-100 pt-5 ${userData.applicantType ? "" : "hidden"} ${userData.applicantType === "PATIENT_CAREGIVER" ? "order-5" : "order-3"}`}>
                <legend className="text-lg font-bold text-slate-900">ที่อยู่</legend>

                <div>
                  <label htmlFor="user-address" className="block text-base font-bold text-slate-900">
                    ที่อยู่บ้านเลขที่ / ซอย / จุดสังเกต <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="user-address"
                    type="text"
                    required
                    value={userData.address}
                    onChange={(e) => setUserData({ ...userData, address: e.target.value })}
                    placeholder="เช่น 45/2 ถ.สิโรรส ซอย 3 ใกล้ตลาดเก่า"
                    className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                  />
                  {errors.address && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.address}</p>}
                </div>
              </fieldset>

              {/* Section 3: Mobility Information */}
              <fieldset className={`space-y-4 border-t border-slate-100 pt-5 ${userData.applicantType ? "" : "hidden"} ${userData.applicantType === "PATIENT_CAREGIVER" ? "order-6" : "order-5"}`}>
                <legend className="text-lg font-bold text-slate-900">
                  ระดับการเคลื่อนไหวเบื้องต้น
                </legend>
                <p className="text-sm text-slate-600">เลือกได้มากกว่า 1 ข้อ</p>

                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: "walks-normally", label: "เดินได้คล่อง", desc: "ช่วยเหลือตนเองได้ดี" },
                    { id: "uses-cane", label: "ใช้ไม้เท้า", desc: "เดินได้ช้า ต้องการคนช่วยถือของ" },
                    { id: "needs-assistant", label: "ต้องการคนช่วยพยุง", desc: "เดินได้แต่ทรงตัวลำบาก" },
                    { id: "uses-wheelchair", label: "ใช้รถเข็น", desc: "ต้องมีคนช่วยเข็นรถ" },
                    { id: "uses-walker", label: "ใช้เครื่องช่วยเดิน", desc: "ใช้วอล์กเกอร์หรือคอกช่วยเดิน" },
                    { id: "avoids-stairs", label: "ขึ้น-ลงบันไดไม่สะดวก", desc: "ต้องการทางลาดหรือลิฟต์" },
                    { id: "bedridden", label: "ผู้ป่วยติดเตียง", desc: "ไม่สามารถลุกหรือเดินได้ ต้องรับบริการดูแลที่บ้าน" },
                  ].map((opt) => {
                    const disabled = opt.id !== "walks-normally" && userData.mobilityStatuses.includes("walks-normally");
                    return (
                    <label
                      key={opt.id}
                      className={`flex items-start gap-3 rounded-2xl border-2 p-3.5 transition ${disabled ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400" : "cursor-pointer"} ${
                        userData.mobilityStatuses.includes(opt.id)
                          ? "border-teal-700 bg-teal-50/70"
                          : "border-slate-200 bg-white hover:border-slate-300"
                      }`}
                    >
                      <input
                        type="checkbox"
                        value={opt.id}
                        disabled={disabled}
                        checked={userData.mobilityStatuses.includes(opt.id)}
                        onChange={() => handleMobilityToggle(opt.id)}
                        className="mt-1 size-5 accent-teal-700"
                      />
                      <div>
                        <span className="block font-bold text-slate-900">{opt.label}</span>
                        <span className="text-xs text-slate-600">{opt.desc}</span>
                      </div>
                    </label>
                    );
                  })}
                </div>
              </fieldset>

              {/* Emergency Contact is only required when the patient registers for themselves. */}
              {userData.applicantType === "PATIENT" && (
              <fieldset className="order-4 space-y-4 border-t border-slate-100 pt-5">
                <legend className="text-lg font-bold text-slate-900">
                  ผู้ติดต่อฉุกเฉิน (สำคัญมาก)
                </legend>
                <p className="text-sm text-slate-600">
                  ผู้ดูแลสามารถติดต่อบุคคลนี้ได้ทันทีเมื่อมีเหตุจำเป็นหรือส่งข่าว
                </p>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label htmlFor="user-emerg-name" className="block text-base font-bold text-slate-900">
                      ชื่อผู้ติดต่อฉุกเฉิน <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="user-emerg-name"
                      type="text"
                      required
                      value={userData.emergencyName}
                      onChange={(e) => setUserData({ ...userData, emergencyName: e.target.value })}
                      placeholder="เช่น คุณสมศักดิ์"
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                    />
                    {errors.emergencyName && (
                      <p className="mt-1.5 text-sm font-bold text-red-600">{errors.emergencyName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="user-emerg-relation" className="block text-base font-bold text-slate-900">
                      ความสัมพันธ์ <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="user-emerg-relation"
                      type="text"
                      required
                      value={userData.emergencyRelation}
                      onChange={(e) => setUserData({ ...userData, emergencyRelation: e.target.value })}
                      placeholder="เช่น บุตร/หลาน, สามี/ภรรยา, ญาติ"
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                    />
                    {errors.emergencyRelation && (
                      <p className="mt-1.5 text-sm font-bold text-red-600">{errors.emergencyRelation}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="user-emerg-phone" className="block text-base font-bold text-slate-900">
                      เบอร์โทรผู้ติดต่อฉุกเฉิน <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="user-emerg-phone"
                      type="tel"
                      required
                      value={userData.emergencyPhone}
                      onChange={(e) => setUserData({ ...userData, emergencyPhone: e.target.value })}
                      placeholder="089-987-6543"
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-teal-700 focus:ring-4 focus:ring-teal-100"
                    />
                    {errors.emergencyPhone && (
                      <p className="mt-1.5 text-sm font-bold text-red-600">{errors.emergencyPhone}</p>
                    )}
                  </div>
                </div>
              </fieldset>
              )}

              <div className={`order-7 rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm font-semibold leading-6 text-teal-950 ${userData.applicantType ? "" : "hidden"}`}>
                Health Buddy ใช้การเข้าสู่ระบบแบบไม่ใช้รหัสผ่าน ผ่านเบอร์โทรศัพท์และ OTP หรือบัญชี Google
              </div>

              {/* Submit Buttons */}
              <div className={`order-8 border-t border-slate-200 pt-6 space-y-3 ${userData.applicantType ? "" : "hidden"}`}>
                {errors.form && (
                  <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
                    {errors.form}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-teal-700 px-6 text-xl font-bold text-white shadow-md shadow-teal-900/15 transition hover:bg-teal-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-700 active:scale-[0.99]"
                >
                  {isSubmitting ? "กำลังบันทึกข้อมูล..." : "ยืนยันการสมัครสมาชิกผู้รับบริการ"}
                </button>

                <button
                  type="button"
                  onClick={handleResetRole}
                  className="min-h-12 w-full text-center text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  ย้อนกลับไปเลือกประเภทผู้ใช้งาน
                </button>
              </div>
            </form>
          </main>
        )}

        {/* STEP 2: BUDDY (ผู้ดูแล) REGISTRATION FORM */}
        {role === "BUDDY" && (
          <main aria-labelledby="buddy-form-heading" className="space-y-6">
            {/* Role Header Banner with Change Role button */}
            <div className="flex items-center justify-between rounded-2xl border-2 border-blue-200 bg-blue-50/80 p-4">
              <div className="flex items-center gap-3">
                <span className="flex size-10 items-center justify-center rounded-xl bg-blue-700 text-white" aria-hidden="true">
                  <svg className="size-5 fill-current" viewBox="0 0 24 24">
                    <path d="M19 3H5c-1.1 0-1.99.9-1.99 2L3 19c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-1 11h-4v4h-4v-4H6v-4h4V6h4v4h4v4z" />
                  </svg>
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-blue-800">บทบาทที่เลือก</p>
                  <p className="text-lg font-black text-blue-950">ผู้ดูแล (Buddy)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleResetRole}
                className="rounded-xl border border-blue-700 bg-white px-3.5 py-1.5 text-sm font-bold text-blue-800 hover:bg-blue-100 transition focus-visible:outline-2 focus-visible:outline-blue-700"
              >
                ← เปลี่ยนบทบาท
              </button>
            </div>

            {/* Buddy Form Container */}
            <form
              noValidate
              onSubmit={handleBuddySubmit}
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8 space-y-6"
            >
              <div>
                <span className="inline-block rounded-full bg-blue-100 px-3.5 py-1 text-xs font-bold text-blue-800">
                  ขั้นตอนที่ 2 จาก 2
                </span>
                <h2 id="buddy-form-heading" className="mt-2 text-2xl font-black text-slate-950 sm:text-3xl">
                  กรอกข้อมูลผู้ดูแล (Buddy)
                </h2>
                <p className="mt-1 text-sm text-slate-600 sm:text-base">
                  ข้อมูลนี้ใช้สำหรับการตรวจสอบตัวตน เพื่อความปลอดภัยสูงสุดของผู้สูงอายุในชุมชน
                </p>
              </div>

              <fieldset className="space-y-4 border-t border-slate-100 pt-5">
                <legend className="text-lg font-bold text-slate-900">ข้อมูลส่วนตัว</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="buddy-first-name" className="block text-base font-bold text-slate-900">
                      ชื่อ <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="buddy-first-name"
                      type="text"
                      required
                      value={buddyData.firstName}
                      onChange={(e) => setBuddyData({ ...buddyData, firstName: e.target.value })}
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                    />
                    {errors.firstName && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="buddy-last-name" className="block text-base font-bold text-slate-900">
                      นามสกุล <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="buddy-last-name"
                      type="text"
                      required
                      value={buddyData.lastName}
                      onChange={(e) => setBuddyData({ ...buddyData, lastName: e.target.value })}
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                    />
                    {errors.lastName && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.lastName}</p>}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="buddy-phone" className="block text-base font-bold text-slate-900">
                      เบอร์โทร <span className="text-red-600">*</span>
                    </label>
                    <input
                      id="buddy-phone"
                      type="tel"
                      required
                      value={buddyData.phone}
                      onChange={(e) => setBuddyData({ ...buddyData, phone: e.target.value })}
                      placeholder="089-123-4567"
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                    />
                    {errors.phone && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.phone}</p>}
                  </div>
                  <div>
                    <label htmlFor="buddy-religion" className="block text-base font-bold text-slate-900">
                      ศาสนา <span className="text-red-600">*</span>
                    </label>
                    <select
                      id="buddy-religion"
                      required
                      value={buddyData.religion}
                      onChange={(e) => setBuddyData({ ...buddyData, religion: e.target.value })}
                      className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="">เลือกศาสนา</option>
                      <option value="BUDDHISM">พุทธ</option>
                      <option value="ISLAM">อิสลาม</option>
                      <option value="CHRISTIANITY">คริสต์</option>
                      <option value="HINDUISM">ฮินดู</option>
                      <option value="SIKHISM">ซิกข์</option>
                      <option value="NONE">ไม่มีศาสนา</option>
                      <option value="OTHER">อื่น ๆ</option>
                    </select>
                    {errors.religion && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.religion}</p>}
                  </div>
                </div>
                <div>
                  <label htmlFor="buddy-gender" className="block text-base font-bold text-slate-900">
                    เพศ <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="buddy-gender"
                    required
                    value={buddyData.gender}
                    onChange={(e) => setBuddyData({ ...buddyData, gender: e.target.value })}
                    className="mt-1.5 min-h-14 w-full rounded-2xl border-2 border-slate-300 bg-white px-4 text-lg text-slate-950 outline-none focus:border-blue-700 focus:ring-4 focus:ring-blue-100"
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
                  {errors.gender && <p className="mt-1.5 text-sm font-bold text-red-600">{errors.gender}</p>}
                </div>
              </fieldset>

              <fieldset className="space-y-4 border-t border-slate-100 pt-5">
                <legend className="text-lg font-bold text-slate-900">ประเภทของ Buddy (เลือกได้มากกว่า 1 ประเภท)</legend>
                {errors.buddyTypes && <p className="text-sm font-bold text-red-600">{errors.buddyTypes}</p>}
                {([
                  ["VILLAGE_HEALTH_VOLUNTEER", "อสม."],
                  ["CAREGIVER_420_HOURS", "พนักงานผู้ช่วยผู้ป่วย Caregiver (อบรม 420 ชั่วโมง)"],
                ] as const).map(([type, label]) => {
                  const checked = buddyData.buddyTypes.includes(type);
                  return (
                    <div key={type} className={`rounded-2xl border-2 p-4 ${checked ? "border-blue-700 bg-blue-50/70" : "border-slate-200"}`}>
                      <label className="flex cursor-pointer items-center gap-3 font-bold text-slate-900">
                        <input type="checkbox" checked={checked} onChange={() => handleBuddyTypeToggle(type)} className="size-5 accent-blue-700" />
                        {label}
                      </label>
                      {checked && (
                        <div className="mt-4 border-t border-blue-200 pt-4">
                          <label htmlFor={`certificate-${type}`} className="block text-sm font-bold text-slate-900">
                            ใบรับรอง <span className="text-red-600">*</span>
                          </label>
                          <input
                            id={`certificate-${type}`}
                            type="file"
                            required
                            accept=".pdf,.jpg,.jpeg,.png"
                            onChange={(e) => setBuddyData((prev) => ({
                              ...prev,
                              certificates: { ...prev.certificates, [type]: e.target.files?.[0] },
                            }))}
                            className="mt-2 block w-full rounded-xl border border-slate-300 bg-white p-3 text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-blue-100 file:px-3 file:py-2 file:font-bold file:text-blue-800"
                          />
                          {errors[`certificate-${type}`] && <p className="mt-1.5 text-sm font-bold text-red-600">{errors[`certificate-${type}`]}</p>}
                        </div>
                      )}
                      {checked && type === "CAREGIVER_420_HOURS" && (
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-bold text-slate-900">รูปแบบการทำงาน <span className="text-red-600">*</span></p>
                          <div className="flex flex-wrap gap-3">
                            {([ ["DAILY", "รายวัน"], ["MONTHLY", "รายเดือน"] ] as const).map(([mode, modeLabel]) => (
                              <label key={mode} className="flex cursor-pointer items-center gap-2 rounded-xl border border-blue-300 bg-white px-4 py-3 font-semibold text-slate-800">
                                <input type="checkbox" checked={buddyData.workModes.includes(mode)} onChange={() => handleWorkModeToggle(mode)} className="size-5 accent-blue-700" />
                                {modeLabel}
                              </label>
                            ))}
                          </div>
                          {errors.workModes && <p className="text-sm font-bold text-red-600">{errors.workModes}</p>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </fieldset>

              {/* Submit Buttons */}
              <div className="border-t border-slate-200 pt-6 space-y-3">
                {errors.form && (
                  <p role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-800">
                    {errors.form}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-blue-700 px-6 text-xl font-bold text-white shadow-md shadow-blue-900/15 transition hover:bg-blue-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-blue-700 active:scale-[0.99]"
                >
                  {isSubmitting ? "กำลังบันทึกข้อมูล..." : "ยืนยันการสมัครสมาชิกผู้ดูแล (Buddy)"}
                </button>

                <button
                  type="button"
                  onClick={handleResetRole}
                  className="min-h-12 w-full text-center text-sm font-bold text-slate-600 hover:text-slate-900"
                >
                  ย้อนกลับไปเลือกประเภทผู้ใช้งาน
                </button>
              </div>
            </form>
          </main>
        )}
      </div>
    </div>
  );
}
