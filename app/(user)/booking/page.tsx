import { BookingForm } from "@/app/_components/booking-form";
import { getBookableRecipients } from "@/lib/booking/actions";
import { Suspense } from "react";
import { requireRole } from "@/lib/auth/route-guard";

export const instant = false;

async function BookingFormWithService({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const { service } = await searchParams;

  const result = await getBookableRecipients();
  if (!result.success) return <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-800">{result.error}</p>;
  return <BookingForm recipients={result.recipients} initialService={typeof service === "string" ? service : undefined} />;
}

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  await requireRole("USER", "/booking");
  return (
    <Suspense fallback={<p className="text-lg text-slate-600">กำลังโหลดแบบฟอร์ม...</p>}>
      <BookingFormWithService searchParams={searchParams} />
    </Suspense>
  );
}
