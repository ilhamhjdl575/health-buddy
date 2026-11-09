import Link from "next/link";
import { HomeIcon } from "@/app/_components/home-icon";
import { RealtimeRefresh } from "@/app/_components/realtime-refresh";
import { requireRole } from "@/lib/auth/route-guard";
import { createClient } from "@/lib/supabase/server";
import { getMyBookings } from "@/lib/booking/actions";
import { SERVICE_LABELS } from "@/app/_lib/services";

export const instant = false;

export default async function UserHomePage() {
  const current = await requireRole("USER", "/user");
  if (!current) return null;
  const supabase = await createClient();
  const [{ data: profile }, bookingsResult] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", current.profileId).single(),
    getMyBookings(),
  ]);
  const bookings = bookingsResult.success ? bookingsResult.bookings : [];
  const activeBookings = bookings.filter((booking) => !["COMPLETED", "CANCELLED"].includes(booking.status));
  const nextBooking = [...activeBookings].sort((a, b) => `${a.serviceDate}T${a.startTime}`.localeCompare(`${b.serviceDate}T${b.startTime}`))[0];
  const displayName = `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim() || "ผู้รับบริการ";

  return (
    <div className="mx-auto max-w-3xl pb-6">
      <RealtimeRefresh
        channel={`user-home:${current.profileId}`}
        table="service_requests"
        filter={`requester_profile_id=eq.${current.profileId}`}
        event="UPDATE"
      />

      <section aria-labelledby="welcome-title">
        <p className="text-lg font-bold text-teal-800">Health Buddy</p>
        <h1 id="welcome-title" className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          สวัสดีค่ะ {displayName}
        </h1>
        <p className="mt-4 text-2xl font-semibold leading-9 text-slate-800">
          ต้องการให้ช่วยอะไรคะ?
        </p>
      </section>

      <Link
        className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-3xl bg-amber-400 px-6 py-9 text-center shadow-lg transition hover:bg-amber-500 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-700 sm:min-h-96 sm:py-12 active:scale-[0.99]"
        href="/booking"
      >
        <span className="mb-5 flex size-32 items-center justify-center rounded-full bg-amber-100 shadow-inner sm:size-40">
          <HomeIcon className="text-8xl text-teal-950 sm:text-9xl" name="help" />
        </span>
        <span className="text-3xl font-extrabold tracking-wide text-slate-950 sm:text-4xl">
          รับบริการ
        </span>
      </Link>

      <section className="mt-8 rounded-3xl border border-teal-200 bg-white p-6 shadow-sm" aria-labelledby="booking-summary-title">
        <div className="flex items-center justify-between gap-4">
          <h2 id="booking-summary-title" className="text-2xl font-bold text-slate-950">รายการรับบริการของฉัน</h2>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-sm font-bold text-teal-900">กำลังดำเนินการ {activeBookings.length}</span>
        </div>
        {nextBooking ? (
          <div className="mt-4 text-lg text-slate-700">
            <p className="font-bold text-slate-950">{SERVICE_LABELS[nextBooking.serviceType]}</p>
            <p className="mt-1">{nextBooking.serviceDate} · {nextBooking.startTime}{nextBooking.endTime ? ` - ${nextBooking.endTime}` : ""}</p>
            <p className="mt-1">สถานะ: <strong>{nextBooking.status}</strong></p>
          </div>
        ) : (
          <p className="mt-4 text-lg text-slate-600">ยังไม่มีรายการรับบริการที่กำลังดำเนินการ</p>
        )}
        <Link href="/my-bookings" className="mt-5 inline-flex min-h-12 items-center rounded-xl border-2 border-teal-700 px-5 text-base font-bold text-teal-800 hover:bg-teal-50">
          ดูรายการทั้งหมด
        </Link>
      </section>

      <section aria-labelledby="emergency-title" className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 id="emergency-title" className="text-xl font-bold text-red-900">กรณีฉุกเฉิน</h2>
          <p className="mt-1 text-base leading-6 text-red-900">หากมีเหตุฉุกเฉินทางการแพทย์ อย่ารอผู้ดูแลรับงาน</p>
        </div>
        <Link className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-red-700 bg-white px-5 py-3 text-lg font-bold text-red-800 hover:bg-red-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:mt-0" href="/emergency">
          <HomeIcon name="phone" />ดูวิธีขอความช่วยเหลือฉุกเฉิน
        </Link>
      </section>
    </div>
  );
}
