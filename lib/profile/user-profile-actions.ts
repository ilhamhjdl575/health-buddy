"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

export interface UserProfileData {
  isCaregiver: boolean;
  // Caregiver or User profile
  firstName: string;
  lastName: string;
  phone: string;
  gender: string;
  birthYear: string;
  email: string;
  // Patient info (if Caregiver)
  patientName?: string;
  patientPhone?: string;
  patientGender?: string;
  patientBirthYear?: string;
  address: string;
  // Emergency contact
  emergencyName: string;
  emergencyRelation: string;
  emergencyPhone: string;
}

export type GetUserProfileResult =
  | { success: true; data: UserProfileData }
  | { success: false; error: string };

export type SaveUserProfileResult =
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
  // If user entered Buddhist year (e.g. 2490 - 2560)
  if (num > 2400 && num < 2600) {
    return `${num - 543}-01-01`;
  }
  // If user entered Gregorian year
  if (num > 1900 && num < 2100) {
    return `${num}-01-01`;
  }
  return null;
}

export async function getUserProfileData(): Promise<GetUserProfileResult> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับบริการ" };
  }

  const supabase = await createClient();

  // 1. Fetch user core profile
  const { data: profile, error: profileErr } = await supabase
    .from("profiles")
    .select("first_name, last_name, phone, email, birth_date, gender")
    .eq("id", current.profileId)
    .single();

  if (profileErr || !profile) {
    return { success: false, error: "ไม่พบข้อมูลโปรไฟล์ผู้ใช้งาน" };
  }

  // 2. Check if caregiver
  const { data: links } = await supabase
    .from("caregiver_patient_links")
    .select("patient_id, patients(*)")
    .eq("caregiver_profile_id", current.profileId);

  if (links && links.length > 0) {
    const patientRow = links[0].patients as unknown as {
      id: string;
      first_name: string;
      last_name: string;
      gender: string;
      birth_date: string;
      phone: string | null;
      address: string;
    } | null;

    const { data: pContacts } = await supabase
      .from("patient_emergency_contacts")
      .select("name, relationship, phone")
      .eq("patient_id", links[0].patient_id)
      .order("is_primary", { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      success: true,
      data: {
        isCaregiver: true,
        firstName: profile.first_name || "",
        lastName: profile.last_name || "",
        phone: profile.phone || "",
        gender: profile.gender || "",
        birthYear: toBuddhistYear(profile.birth_date),
        email: profile.email || "",
        patientName: patientRow ? `${patientRow.first_name} ${patientRow.last_name}`.trim() : "",
        patientPhone: patientRow?.phone || "",
        patientGender: patientRow?.gender || "",
        patientBirthYear: toBuddhistYear(patientRow?.birth_date || null),
        address: patientRow?.address || "",
        emergencyName: pContacts?.name || "",
        emergencyRelation: pContacts?.relationship || "",
        emergencyPhone: pContacts?.phone || "",
      },
    };
  }

  // 3. Regular Self Patient
  const [{ data: mob }, { data: emergContact }, { data: latestBooking }] = await Promise.all([
    supabase
      .from("mobility_profiles")
      .select("note")
      .eq("user_id", current.profileId)
      .maybeSingle(),
    supabase
      .from("emergency_contacts")
      .select("name, relationship, phone")
      .eq("user_id", current.profileId)
      .order("is_primary", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("service_requests")
      .select("pickup_address")
      .eq("requester_profile_id", current.profileId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  let address = "";
  if (mob?.note) {
    const match = mob.note.match(/ที่อยู่:\s*([^|]+)/);
    if (match) {
      address = match[1].trim();
    } else {
      address = mob.note;
    }
  }
  if (!address && latestBooking?.pickup_address) {
    address = latestBooking.pickup_address;
  }

  return {
    success: true,
    data: {
      isCaregiver: false,
      firstName: profile.first_name || "",
      lastName: profile.last_name || "",
      phone: profile.phone || "",
      gender: profile.gender || "",
      birthYear: toBuddhistYear(profile.birth_date),
      email: profile.email || "",
      address,
      emergencyName: emergContact?.name || "",
      emergencyRelation: emergContact?.relationship || "",
      emergencyPhone: emergContact?.phone || "",
    },
  };
}

export async function saveUserProfileData(
  formData: Partial<UserProfileData>
): Promise<SaveUserProfileResult> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับบริการ" };
  }

  const firstName = (formData.firstName || "").trim();
  const lastName = (formData.lastName || "").trim();
  const phone = (formData.phone || "").trim();
  const gender = (formData.gender || "").trim();
  const birthYear = (formData.birthYear || "").trim();
  const address = (formData.address || "").trim();
  const emergencyName = (formData.emergencyName || "").trim();
  const emergencyRelation = (formData.emergencyRelation || "").trim();
  const emergencyPhone = (formData.emergencyPhone || "").trim();

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

  // 2. Check if Caregiver
  const { data: links } = await supabase
    .from("caregiver_patient_links")
    .select("patient_id")
    .eq("caregiver_profile_id", current.profileId);

  if (links && links.length > 0) {
    const patientId = links[0].patient_id;
    // Update patient address & phone if provided
    const patientUpdate: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (address) patientUpdate.address = address;
    if (formData.patientPhone) patientUpdate.phone = formData.patientPhone.trim();

    if (Object.keys(patientUpdate).length > 1) {
      await supabase.from("patients").update(patientUpdate).eq("id", patientId);
    }

    // Update patient emergency contact
    if (emergencyName && emergencyPhone) {
      const { data: existingContact } = await supabase
        .from("patient_emergency_contacts")
        .select("id")
        .eq("patient_id", patientId)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingContact) {
        await supabase
          .from("patient_emergency_contacts")
          .update({
            name: emergencyName,
            relationship: emergencyRelation || "ผู้ติดต่อฉุกเฉิน",
            phone: emergencyPhone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingContact.id);
      } else {
        await supabase.from("patient_emergency_contacts").insert({
          patient_id: patientId,
          name: emergencyName,
          relationship: emergencyRelation || "ผู้ติดต่อฉุกเฉิน",
          phone: emergencyPhone,
          is_primary: true,
        });
      }
    }
  } else {
    // Regular self patient: Update address in mobility note
    if (address) {
      const { data: mob } = await supabase
        .from("mobility_profiles")
        .select("id, note")
        .eq("user_id", current.profileId)
        .maybeSingle();

      if (mob) {
        let newNote = `ที่อยู่: ${address}`;
        if (mob.note) {
          if (mob.note.includes("ที่อยู่:")) {
            newNote = mob.note.replace(/ที่อยู่:\s*[^|]+/, `ที่อยู่: ${address}`);
          } else {
            newNote = `${mob.note} | ที่อยู่: ${address}`;
          }
        }
        await supabase
          .from("mobility_profiles")
          .update({ note: newNote, updated_at: new Date().toISOString() })
          .eq("id", mob.id);
      }
    }

    // Update emergency contact
    if (emergencyName && emergencyPhone) {
      const { data: existingContact } = await supabase
        .from("emergency_contacts")
        .select("id")
        .eq("user_id", current.profileId)
        .order("is_primary", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingContact) {
        await supabase
          .from("emergency_contacts")
          .update({
            name: emergencyName,
            relationship: emergencyRelation || "ผู้ติดต่อฉุกเฉิน",
            phone: emergencyPhone,
            updated_at: new Date().toISOString(),
          })
          .eq("id", existingContact.id);
      } else {
        await supabase.from("emergency_contacts").insert({
          user_id: current.profileId,
          name: emergencyName,
          relationship: emergencyRelation || "ผู้ติดต่อฉุกเฉิน",
          phone: emergencyPhone,
          is_primary: true,
        });
      }
    }
  }

  revalidatePath("/profile");
  revalidatePath("/user");
  revalidatePath("/emergency");
  revalidatePath("/booking");

  return { success: true, message: "บันทึกข้อมูลส่วนตัวเรียบร้อยแล้ว" };
}
