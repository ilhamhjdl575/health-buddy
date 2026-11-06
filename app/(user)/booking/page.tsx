import { BookingForm } from "@/app/_components/booking-form";

export default async function BookingPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[] }>;
}) {
  const { service } = await searchParams;
  return <BookingForm initialService={typeof service === "string" ? service : undefined} />;
}
