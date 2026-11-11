import Link from "next/link";
import { connection } from "next/server";
import { getEmergencyInfo } from "@/lib/emergency/actions";
import { EmergencyContactsView } from "@/app/_components/emergency-contacts-view";
import { getLocalCoordinatorForUser } from "@/lib/coordinator/data";

export const instant = false;

export default async function EmergencyPage() {
  await connection();
  const [info, coordinator] = await Promise.all([getEmergencyInfo(), getLocalCoordinatorForUser()]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 1669 Urgent Call Banner */}
      <section
        aria-labelledby="emergency-title"
        className="rounded-3xl border-2 border-red-300 bg-red-50 p-6 shadow-sm sm:p-10"
      >
        <p className="text-xl font-bold text-red-800">กรณีฉุกเฉิน</p>
        <h1
          className="mt-3 text-3xl font-bold leading-tight text-red-950 sm:text-4xl"
          id="emergency-title"
        >
          กรณีฉุกเฉิน อย่ารอผู้ดูแลรับงาน
        </h1>
        <p className="mt-4 text-lg leading-8 text-red-950">
          หากผู้รับบริการมีอาการฉุกเฉิน หรือหมดสติ ให้ติดต่อหน่วยแพทย์ฉุกเฉินทันที
        </p>
        <a
          className="mt-6 flex min-h-20 w-full items-center justify-center rounded-2xl bg-red-700 px-6 text-2xl font-bold text-white shadow-sm hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-red-800"
          href="tel:1669"
        >
          โทร 1669
        </a>
        <p className="mt-3 text-center text-base font-semibold text-red-900">
          โทรขอความช่วยเหลือทางการแพทย์ฉุกเฉิน (โทรฟรี ตลอด 24 ชม.)
        </p>
      </section>

      {/* Patient Address from DB */}
      <section
        aria-labelledby="address-title"
        className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="text-2xl font-bold text-slate-950" id="address-title">
          ที่อยู่{info.recipientName ? `ของคุณ ${info.recipientName}` : "ผู้รับบริการ"}
        </h2>
        <p className="mt-1 text-base text-slate-600">ใช้ที่อยู่นี้แจ้งเจ้าหน้าที่ 1669</p>
        {info.address ? (
          <p className="mt-4 rounded-2xl bg-slate-100 p-5 text-xl font-bold leading-8 text-slate-900">
            {info.address}
          </p>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5 text-slate-600">
            <p className="text-lg">ยังไม่มีข้อมูลที่อยู่บันทึกไว้ในระบบ</p>
            <p className="mt-1 text-sm text-slate-500">
              กรุณาแจ้งจุดสังเกตหรือตำแหน่งปัจจุบันให้เจ้าหน้าที่ 1669 ทราบทางโทรศัพท์
            </p>
          </div>
        )}
      </section>

      {/* Emergency Contacts from DB */}
      <EmergencyContactsView info={info} />

      {/* Local Health Buddy Coordinator notice */}
      <section
        aria-labelledby="coordinator-title"
        className="rounded-3xl border border-teal-200 bg-teal-50 p-6"
      >
        <h2 className="text-2xl font-bold text-teal-950" id="coordinator-title">
          ผู้ประสานงานในพื้นที่
        </h2>
        {coordinator ? (
          <dl className="mt-5 grid gap-4 text-lg sm:grid-cols-2">
            <div><dt className="text-sm font-bold text-teal-800">ชื่อ รพ.สต.</dt><dd className="mt-1 font-bold text-slate-950">{coordinator.healthCenterName}</dd></div>
            <div><dt className="text-sm font-bold text-teal-800">ชื่อ - นามสกุล</dt><dd className="mt-1 font-bold text-slate-950">{coordinator.coordinatorName}</dd></div>
            <div><dt className="text-sm font-bold text-teal-800">เบอร์โทร</dt><dd className="mt-1"><a className="font-bold text-teal-800 underline underline-offset-4" href={`tel:${coordinator.phone}`}>{coordinator.phone}</a></dd></div>
            <div><dt className="text-sm font-bold text-teal-800">ID LINE</dt><dd className="mt-1 font-bold text-slate-950">{coordinator.lineId}</dd></div>
          </dl>
        ) : (
          <p className="mt-2 text-base leading-7 text-slate-700">ยังไม่มีข้อมูลผู้ประสานงานในพื้นที่</p>
        )}
      </section>

      <Link
        className="inline-flex min-h-14 w-full items-center justify-center rounded-2xl border-2 border-slate-400 bg-white px-6 text-xl font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-slate-700"
        href="/user"
      >
        กลับหน้าหลัก
      </Link>
    </div>
  );
}
