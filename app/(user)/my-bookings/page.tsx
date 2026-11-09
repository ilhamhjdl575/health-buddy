import { UserBookingsView } from "@/app/_components/user-bookings-view";
import { getMyBookings } from "@/lib/booking/actions";
import { Suspense } from "react";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { RealtimeRefresh } from "@/app/_components/realtime-refresh";
import { requireRole } from "@/lib/auth/route-guard";

export const instant = false;

async function MyBookingsContent() {
  const result = await getMyBookings();
  const profile = await getCurrentProfile();
  if (!result.success) return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{result.error}</p>;
  return <>{profile.status==="AUTHENTICATED"&&<RealtimeRefresh channel={`user-bookings:${profile.profileId}`} table="service_requests" filter={`requester_profile_id=eq.${profile.profileId}`} event="UPDATE"/>}<UserBookingsView bookings={result.bookings} /></>;
}

export default async function MyBookingsPage() {
  await requireRole("USER", "/my-bookings");
  return <Suspense fallback={<p className="text-lg text-slate-600">กำลังโหลดรายการจอง...</p>}><MyBookingsContent /></Suspense>;
}
