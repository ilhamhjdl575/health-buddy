import type { Metadata } from "next";
import { connection } from "next/server";
import { getLocalCoordinatorForManagement } from "@/lib/coordinator/data";
import { CoordinatorForm } from "./coordinator-form";

export const metadata: Metadata = { robots: { index: false, follow: false }, title: "จัดการผู้ประสานงาน" };
export const instant = false;

export default async function CoordinatorManagementPage() {
  await connection();
  const initialData = await getLocalCoordinatorForManagement();
  return (
    <main className="min-h-screen bg-teal-50 px-4 py-10 text-slate-900 sm:py-16">
      <section className="mx-auto max-w-2xl rounded-3xl border border-teal-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="font-bold text-teal-700">Health Buddy</p>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-slate-950 sm:text-4xl">ข้อมูลผู้ประสานงานในพื้นที่</h1>
        <p className="mt-3 text-base leading-7 text-slate-600">ข้อมูลนี้จะแสดงให้ผู้รับบริการเห็นในหน้ากรณีฉุกเฉิน หน้านี้ไม่มีลิงก์เชื่อมจากเว็บหลัก กรุณาส่ง URL โดยตรงให้ผู้รับผิดชอบเท่านั้น</p>
        <CoordinatorForm initialData={initialData} />
      </section>
    </main>
  );
}

