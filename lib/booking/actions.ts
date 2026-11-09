"use server";

import { z } from "zod";
import { SERVICE_TYPES, type ServiceType } from "@/app/_lib/services";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

export type BookableRecipient = {
  id: string | null;
  name: string;
  isBedridden: boolean;
  kind: "SELF" | "PATIENT";
  mobilityBadges?: string[];
};

export type BookingListItem = {
  id: string;
  requestNo: string;
  serviceType: ServiceType;
  serviceDate: string;
  startTime: string;
  endTime: string | null;
  pickupAddress: string;
  destinationAddress: string | null;
  status: string;
  recipientName: string;
};

const bookingSchema = z.object({
  recipientId: z.string().uuid().nullable(),
  serviceType: z.enum(SERVICE_TYPES),
  serviceDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  startTime: z.string().regex(/^\d{2}:\d{2}$/),
  endTime: z.string().regex(/^\d{2}:\d{2}$/).nullable(),
  pickupAddress: z.string().trim().min(1),
  destinationAddress: z.string().trim().nullable(),
  notes: z.string().trim().nullable(),
  idempotencyKey: z.string().uuid(),
}).refine((data) => !data.endTime || data.endTime > data.startTime, {
  message: "เวลาสิ้นสุดต้องหลังเวลาเริ่ม",
  path: ["endTime"],
});

function extractMobilityBadges(mobility?: {
  is_bedridden?: boolean | null;
  uses_wheelchair?: boolean | null;
  uses_cane?: boolean | null;
  uses_walker?: boolean | null;
  needs_walking_assistance?: boolean | null;
  difficulty_using_stairs?: boolean | null;
} | null): string[] {
  if (!mobility) return ["ไม่ใช่ผู้ป่วยติดเตียง", "เดินได้ปกติ"];
  if (mobility.is_bedridden) {
    return ["ผู้ป่วยติดเตียง"];
  }

  const badges: string[] = ["ไม่ใช่ผู้ป่วยติดเตียง"];
  if (mobility.uses_wheelchair) badges.push("ใช้รถเข็น");
  if (mobility.uses_cane) badges.push("ใช้ไม้เท้า");
  if (mobility.uses_walker) badges.push("ใช้เครื่องช่วยเดิน");
  if (mobility.needs_walking_assistance) badges.push("ต้องการคนช่วยพยุงเดิน");
  if (mobility.difficulty_using_stairs) badges.push("ขึ้น-ลงบันไดไม่สะดวก");

  if (badges.length === 1) {
    badges.push("เดินได้ปกติ");
  }

  return badges;
}

export async function getBookableRecipients(): Promise<
  { success: true; recipients: BookableRecipient[] } | { success: false; error: string }
> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับบริการ" };
  }

  const supabase = await createClient();
  const { data: links, error } = await supabase
    .from("caregiver_patient_links")
    .select("patient_id, patients(first_name, last_name, patient_mobility_profiles(*))")
    .eq("caregiver_profile_id", current.profileId);
  if (error) return { success: false, error: "ไม่สามารถโหลดรายชื่อผู้รับบริการได้" };

  if (links?.length) {
    return {
      success: true,
      recipients: links.map((link) => {
        const patient = link.patients as unknown as {
          first_name: string;
          last_name: string;
          patient_mobility_profiles: Array<{
            is_bedridden: boolean;
            uses_wheelchair: boolean;
            uses_cane: boolean;
            uses_walker: boolean;
            needs_walking_assistance: boolean;
            difficulty_using_stairs: boolean;
          }> | null;
        };
        const mob = patient.patient_mobility_profiles?.[0];
        return {
          id: link.patient_id,
          name: `${patient.first_name} ${patient.last_name}`,
          isBedridden: mob?.is_bedridden ?? false,
          kind: "PATIENT" as const,
          mobilityBadges: extractMobilityBadges(mob),
        };
      }),
    };
  }

  const [{ data: profile }, { data: mobility }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", current.profileId).single(),
    supabase.from("mobility_profiles").select("*").eq("user_id", current.profileId).maybeSingle(),
  ]);
  if (!profile) return { success: false, error: "ไม่พบข้อมูลผู้รับบริการ" };
  return {
    success: true,
    recipients: [
      {
        id: null,
        name: `${profile.first_name} ${profile.last_name}`,
        isBedridden: mobility?.is_bedridden ?? false,
        kind: "SELF",
        mobilityBadges: extractMobilityBadges(mobility),
      },
    ],
  };
}

export async function createServiceRequest(raw: unknown): Promise<
  { success: true; requestId: string } | { success: false; error: string }
> {
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { success: false, error: "ข้อมูลการจองไม่ถูกต้อง" };
  const today = new Date().toISOString().slice(0, 10);
  if (parsed.data.serviceDate < today) return { success: false, error: "ไม่สามารถเลือกวันที่ในอดีตได้" };

  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับบริการ" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_service_request", {
    p_service_type: parsed.data.serviceType,
    p_service_date: parsed.data.serviceDate,
    p_start_time: parsed.data.startTime,
    p_end_time: parsed.data.endTime,
    p_pickup_address: parsed.data.pickupAddress,
    p_destination_address: parsed.data.destinationAddress,
    p_description: parsed.data.notes,
    p_patient_id: parsed.data.recipientId,
    p_idempotency_key: parsed.data.idempotencyKey,
  });
  if (error) return { success: false, error: "ไม่สามารถสร้างคำขอรับบริการได้ กรุณาตรวจสอบข้อมูลแล้วลองอีกครั้ง" };
  return { success: true, requestId: data as string };
}

export async function getMyBookings(): Promise<
  { success: true; bookings: BookingListItem[] } | { success: false; error: string }
> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับบริการ" };
  }
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("first_name, last_name").eq("id", current.profileId).single();
  const { data, error } = await supabase
    .from("service_requests")
    .select("id, request_no, service_type, service_date, start_time, end_time, pickup_address, destination_address, status, patient_id, patients(first_name, last_name)")
    .eq("requester_profile_id", current.profileId)
    .order("created_at", { ascending: false });
  if (error) return { success: false, error: "ไม่สามารถโหลดรายการจองได้" };
  return {
    success: true,
    bookings: (data ?? []).map((row) => {
      const patient = row.patients as unknown as { first_name: string; last_name: string } | null;
      return {
        id: row.id, requestNo: row.request_no, serviceType: row.service_type as ServiceType,
        serviceDate: row.service_date, startTime: row.start_time, endTime: row.end_time,
        pickupAddress: row.pickup_address, destinationAddress: row.destination_address, status: row.status,
        recipientName: patient ? `${patient.first_name} ${patient.last_name}` : `${profile?.first_name ?? ""} ${profile?.last_name ?? ""}`.trim(),
      };
    }),
  };
}
