import { Suspense } from "react";
import { MobilityProfileForm } from "@/app/_components/mobility-profile-form";
import { requireRole } from "@/lib/auth/route-guard";
import { getMyMobilityProfile } from "@/lib/profile/mobility";

export const instant = false;

async function MobilityContent() {
  const result = await getMyMobilityProfile();
  const initialValues = result.success ? result.values : undefined;
  const recipientName = result.success ? result.recipientName : undefined;

  return (
    <MobilityProfileForm
      initialValues={initialValues}
      recipientName={recipientName}
    />
  );
}

export default async function MobilityPage() {
  await requireRole("USER", "/mobility");
  return (
    <Suspense fallback={<p className="text-lg text-slate-600">กำลังโหลดข้อมูลการเดิน...</p>}>
      <MobilityContent />
    </Suspense>
  );
}
