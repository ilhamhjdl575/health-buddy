"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

export type EmergencyContactItem = {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  isPrimary: boolean;
};

export type EmergencyInfo = {
  isAuthenticated: boolean;
  recipientName: string;
  address: string | null;
  contacts: EmergencyContactItem[];
};

const emergencyContactSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().trim().min(1, "กรุณากรอกชื่อผู้ติดต่อฉุกเฉิน"),
  relationship: z.string().trim().min(1, "กรุณาระบุความสัมพันธ์"),
  phone: z.string().trim().min(9, "เบอร์โทรศัพท์ไม่ถูกต้อง"),
});

export async function getEmergencyInfo(): Promise<EmergencyInfo> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return {
      isAuthenticated: false,
      recipientName: "",
      address: null,
      contacts: [],
    };
  }

  const supabase = await createClient();

  // 1. Check if user is a Caregiver linked to a Patient
  const { data: links } = await supabase
    .from("caregiver_patient_links")
    .select("patient_id, patients(first_name, last_name, address, phone)")
    .eq("caregiver_profile_id", current.profileId);

  if (links && links.length > 0) {
    const patient = links[0].patients as unknown as {
      first_name: string;
      last_name: string;
      address: string;
      phone: string | null;
    } | null;

    const { data: pContacts } = await supabase
      .from("patient_emergency_contacts")
      .select("id, name, relationship, phone, is_primary")
      .eq("patient_id", links[0].patient_id)
      .order("is_primary", { ascending: false });

    return {
      isAuthenticated: true,
      recipientName: patient ? `${patient.first_name} ${patient.last_name}`.trim() : "ผู้รับบริการ",
      address: patient?.address ?? null,
      contacts: (pContacts ?? []).map((c) => ({
        id: c.id,
        name: c.name ?? "ผู้ดูแล",
        relationship: c.relationship ?? "ผู้ดูแล",
        phone: c.phone ?? "",
        isPrimary: c.is_primary,
      })),
    };
  }

  // 2. Patient Self
  const [{ data: profile }, { data: contacts }, { data: latestBooking }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name, phone").eq("id", current.profileId).single(),
    supabase
      .from("emergency_contacts")
      .select("id, name, relationship, phone, is_primary")
      .eq("user_id", current.profileId)
      .order("is_primary", { ascending: false }),
    supabase
      .from("service_requests")
      .select("pickup_address")
      .eq("requester_profile_id", current.profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  return {
    isAuthenticated: true,
    recipientName: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "ผู้รับบริการ",
    address: latestBooking?.pickup_address ?? null,
    contacts: (contacts ?? []).map((c) => ({
      id: c.id,
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      isPrimary: c.is_primary,
    })),
  };
}

export async function saveEmergencyContact(rawInput: unknown): Promise<
  { success: true } | { success: false; error: string }
> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับบริการ" };
  }

  const parsed = emergencyContactSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message || "ข้อมูลไม่ถูกต้อง" };
  }

  const supabase = await createClient();

  // Check if caregiver
  const { data: links } = await supabase
    .from("caregiver_patient_links")
    .select("patient_id")
    .eq("caregiver_profile_id", current.profileId);

  if (links && links.length > 0) {
    const patientId = links[0].patient_id;
    if (parsed.data.id) {
      const { error } = await supabase
        .from("patient_emergency_contacts")
        .update({
          name: parsed.data.name,
          relationship: parsed.data.relationship,
          phone: parsed.data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.id)
        .eq("patient_id", patientId);

      if (error) return { success: false, error: "บันทึกไม่สำเร็จ: " + error.message };
    } else {
      const { error } = await supabase.from("patient_emergency_contacts").insert({
        patient_id: patientId,
        name: parsed.data.name,
        relationship: parsed.data.relationship,
        phone: parsed.data.phone,
        is_primary: true,
      });

      if (error) return { success: false, error: "บันทึกไม่สำเร็จ: " + error.message };
    }
  } else {
    // Self
    if (parsed.data.id) {
      const { error } = await supabase
        .from("emergency_contacts")
        .update({
          name: parsed.data.name,
          relationship: parsed.data.relationship,
          phone: parsed.data.phone,
          updated_at: new Date().toISOString(),
        })
        .eq("id", parsed.data.id)
        .eq("user_id", current.profileId);

      if (error) return { success: false, error: "บันทึกไม่สำเร็จ: " + error.message };
    } else {
      const { error } = await supabase.from("emergency_contacts").insert({
        user_id: current.profileId,
        name: parsed.data.name,
        relationship: parsed.data.relationship,
        phone: parsed.data.phone,
        is_primary: true,
      });

      if (error) return { success: false, error: "บันทึกไม่สำเร็จ: " + error.message };
    }
  }

  revalidatePath("/emergency");
  return { success: true };
}
