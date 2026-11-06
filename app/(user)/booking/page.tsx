import { BookingForm } from "@/app/_components/booking-form";
import { Suspense } from "react";

async function BookingFormWithService({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const { service } = await searchParams;

  return <BookingForm initialService={typeof service === "string" ? service : undefined} />;
}

export default function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  return (
    <Suspense fallback={<p className="text-lg text-slate-600">กำลังโหลดแบบฟอร์ม...</p>}>
      <BookingFormWithService searchParams={searchParams} />
    </Suspense>
  );
}
