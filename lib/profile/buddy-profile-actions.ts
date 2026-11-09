"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

export interface BuddyQualificationInfo {
  qualificationType: string;
  status: string;
  certificateNo: string | null;
  issuedAt: string | null;
}

export interface BuddyProfileData {
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthYear: string;
  email: string;
  serviceArea: string;
  religion: string;
  workModes: string[];
  isActive: boolean;
  hasCar: boolean;
  qualifications: BuddyQualificationInfo[];
}

export type GetBuddyProfileResult =
  | { success: true; data: BuddyProfileData }
  | { success: false; error: string };

export type SaveBuddyProfileResult =
  | { success: true; message: string }
  | { success: false; error: string };

function toBuddhistYear(dateStr: string | null): string {
  if (!dateStr) return "";
  const year = parseInt(dateStr.split("-")[0], 10);
  if (isNaN(year)) return "";
  return String(year + 543);
}

function parseBirthYearToDate(yearStr: string): string | null {
  const trimmed = yearStr.trim();
  if (!trimmed) return null;
  const num = parseInt(trimmed, 10);
  if (isNaN(num)) return null;
  if (num > 2400 && num < 2600) {
    return `${num - 543}-01-01`;
  }
  if (num > 1900 && num < 2100) {
    return `${num}-01-01`;
  }
  return null;
}

export async function getBuddyProfileData(): Promise<GetBuddyProfileResult> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "BUDDY") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล (Buddy)" };
  }

  const supabase = await createClient();

  const [{ data: profile, error: profileErr }, { data: buddyProfile }, { data: quals }] =
    await Promise.all([
      supabase
        .from("profiles")
        .select("first_name, last_name, phone, email, birth_date, gender")
        .eq("id", current.profileId)
        .single(),
      supabase
        .from("buddy_profiles")
        .select("service_area, religion, gender, work_modes, is_active")
        .eq("buddy_id", current.profileId)
        .maybeSingle(),
      supabase
        .from("buddy_qualifications")
        .select("qualification_type, status, certificate_no, issued_at")
        .eq("buddy_id", current.profileId),
    ]);

  if (profileErr || !profile) {
    return { success: false, error: "ไม่พบข้อมูลโปรไฟล์ผู้ดูแล" };
  }

  return {
    success: true,
    data: {
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      phone: profile.phone || "",
      gender: buddyProfile?.gender || profile.gender || "",
      birthYear: toBuddhistYear(profile.birth_date),
      email: profile.email || "",
      serviceArea: buddyProfile?.service_area || "",
      religion: buddyProfile?.religion || "",
      workModes: buddyProfile?.work_modes || ["DAILY"],
      isActive: buddyProfile?.is_active ?? true,
      hasCar: (buddyProfile?.work_modes || []).includes("HAS_CAR"),
      qualifications: (quals || []).map((q) => ({
        qualificationType: q.qualification_type,
        status: q.status,
        certificateNo: q.certificate_no,
        issuedAt: q.issued_at,
      })),
    },
  };
}

export async function saveBuddyProfileData(
  formData: Partial<BuddyProfileData>
): Promise<SaveBuddyProfileResult> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "BUDDY") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้ดูแล (Buddy)" };
  }

  const firstName = (formData.firstName || "").trim();
  const lastName = (formData.lastName || "").trim();
  const phone = (formData.phone || "").trim();
  const gender = (formData.gender || "").trim();
  const birthYear = (formData.birthYear || "").trim();
  const serviceArea = (formData.serviceArea || "").trim();
  const religion = (formData.religion || "").trim();
  let workModes = formData.workModes && formData.workModes.length > 0 ? formData.workModes : ["DAILY"];
  if (formData.hasCar === true) {
    workModes = Array.from(new Set([...workModes, "HAS_CAR"]));
  } else if (formData.hasCar === false) {
    workModes = workModes.filter((m) => m !== "HAS_CAR");
  }
  const isActive = formData.isActive ?? true;

  if (!firstName || !lastName) {
    return { success: false, error: "กรุณาระบุชื่อและนามสกุล" };
  }
  if (!phone) {
    return { success: false, error: "กรุณาระบุเบอร์โทรศัพท์" };
  }

  const supabase = await createClient();

  // 1. Update Core Profile
  const birthDate = parseBirthYearToDate(birthYear);
  const profileUpdate: Record<string, unknown> = {
    first_name: firstName,
    last_name: lastName,
    phone,
    gender: gender || null,
    updated_at: new Date().toISOString(),
  };
  if (birthDate) {
    profileUpdate.birth_date = birthDate;
  }

  const { error: profileErr } = await supabase
    .from("profiles")
    .update(profileUpdate)
    .eq("id", current.profileId);

  if (profileErr) {
    return { success: false, error: "ไม่สามารถบันทึกข้อมูลส่วนตัวได้: " + profileErr.message };
  }

  // 2. Update Buddy Profile
  const { data: existingBuddyProfile } = await supabase
    .from("buddy_profiles")
    .select("id")
    .eq("buddy_id", current.profileId)
    .maybeSingle();

  if (existingBuddyProfile) {
    const { error: buddyErr } = await supabase
      .from("buddy_profiles")
      .update({
        service_area: serviceArea || null,
        religion: religion || null,
        gender: gender || null,
        work_modes: workModes,
        is_active: isActive,
        updated_at: new Date().toISOString(),
      })
      .eq("buddy_id", current.profileId);

    if (buddyErr) {
      return { success: false, error: "ไม่สามารถบันทึกข้อมูลผู้ดูแลได้: " + buddyErr.message };
    }
  } else {
    const { error: insertErr } = await supabase.from("buddy_profiles").insert({
      buddy_id: current.profileId,
      service_area: serviceArea || null,
      religion: religion || null,
      gender: gender || null,
      work_modes: workModes,
      is_active: isActive,
    });

    if (insertErr) {
      return { success: false, error: "ไม่สามารถสร้างข้อมูลผู้ดูแลได้: " + insertErr.message };
    }
  }

  revalidatePath("/buddy/profile");
  revalidatePath("/buddy");
  revalidatePath("/buddy/open-jobs");
  revalidatePath("/buddy/availability");

  return { success: true, message: "บันทึกข้อมูลผู้ดูแลเรียบร้อยแล้ว" };
}
