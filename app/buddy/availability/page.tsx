import { BuddyAvailabilityManager } from "@/app/_components/buddy-availability-manager";
import { getMyAvailability } from "@/lib/buddy/availability";
import { Suspense } from "react";
import { connection } from "next/server";

export const instant = false;

async function Content() {
  // Supabase auth validates session tokens using Date.now(), which requires dynamic rendering per request
  await connection();
  const result = await getMyAvailability();
  if (!result.success) {
    return (
      <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">
        {result.error}
      </p>
    );
  }
  return (
    <BuddyAvailabilityManager
      initialSlots={result.slots}
      initialStatus={result.status}
      initialActivePeriods={result.activePeriods}
    />
  );
}

export default function AvailabilityPage() {
  return (
    <Suspense fallback={<p className="text-slate-600">กำลังโหลดเวลาพร้อมรับงาน...</p>}>
      <Content />
    </Suspense>
  );
}
