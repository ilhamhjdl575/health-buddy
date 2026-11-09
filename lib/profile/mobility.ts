"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { createClient } from "@/lib/supabase/server";

const mobilityValuesSchema = z.object({
  walksNormally: z.boolean(),
  usesWheelchair: z.boolean(),
  usesCane: z.boolean(),
  usesWalker: z.boolean(),
  needsWalkingAssistant: z.boolean(),
  avoidsStairs: z.boolean(),
  isBedridden: z.boolean(),
  notes: z.string().trim().default(""),
});

export type MobilityValues = z.infer<typeof mobilityValuesSchema>;

export type GetMobilityProfileResult =
  | {
      success: true;
      recipientName: string;
      kind: "SELF" | "PATIENT";
      values: MobilityValues;
    }
  | {
      success: false;
      error: string;
    };

export type UpdateMobilityProfileResult =
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    };

export async function getMyMobilityProfile(): Promise<GetMobilityProfileResult> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับบริการ" };
  }

  const supabase = await createClient();

  // 1. Check if user is a Caregiver linked to a Patient
  const { data: links, error: linkError } = await supabase
    .from("caregiver_patient_links")
    .select("patient_id, patients(first_name, last_name, patient_mobility_profiles(*))")
    .eq("caregiver_profile_id", current.profileId);

  if (!linkError && links && links.length > 0) {
    const patientRow = links[0].patients as unknown as {
      first_name: string;
      last_name: string;
      patient_mobility_profiles: Array<{
        walks_normally: boolean;
        uses_wheelchair: boolean;
        uses_cane: boolean;
        uses_walker: boolean;
        needs_walking_assistance: boolean;
        difficulty_using_stairs: boolean;
        is_bedridden: boolean;
        note: string | null;
      }> | null;
    } | null;

    const mob = patientRow?.patient_mobility_profiles?.[0];
    const walksNormally = mob ? mob.walks_normally : false;

    return {
      success: true,
      recipientName: patientRow ? `${patientRow.first_name} ${patientRow.last_name}`.trim() : "ผู้รับบริการ",
      kind: "PATIENT",
      values: {
        walksNormally,
        usesWheelchair: mob?.uses_wheelchair ?? false,
        usesCane: mob?.uses_cane ?? false,
        usesWalker: mob?.uses_walker ?? false,
        needsWalkingAssistant: mob?.needs_walking_assistance ?? false,
        avoidsStairs: mob?.difficulty_using_stairs ?? false,
        isBedridden: mob?.is_bedridden ?? false,
        notes: mob?.note ?? "",
      },
    };
  }

  // 2. Patient Self
  const [{ data: profile }, { data: mob, error: mobError }] = await Promise.all([
    supabase.from("profiles").select("first_name, last_name").eq("id", current.profileId).single(),
    supabase.from("mobility_profiles").select("*").eq("user_id", current.profileId).maybeSingle(),
  ]);

  if (mobError) {
    return { success: false, error: "ไม่สามารถโหลดข้อมูลระดับการเคลื่อนไหวได้" };
  }

  const walksNormally = mob
    ? !(
        mob.uses_wheelchair ||
        mob.uses_cane ||
        mob.uses_walker ||
        mob.needs_walking_assistance ||
        mob.difficulty_using_stairs ||
        mob.is_bedridden
      )
    : false;

  return {
    success: true,
    recipientName: profile ? `${profile.first_name} ${profile.last_name}`.trim() : "ผู้รับบริการ",
    kind: "SELF",
    values: {
      walksNormally,
      usesWheelchair: mob?.uses_wheelchair ?? false,
      usesCane: mob?.uses_cane ?? false,
      usesWalker: mob?.uses_walker ?? false,
      needsWalkingAssistant: mob?.needs_walking_assistance ?? false,
      avoidsStairs: mob?.difficulty_using_stairs ?? false,
      isBedridden: mob?.is_bedridden ?? false,
      notes: mob?.note ?? "",
    },
  };
}

export async function updateMyMobilityProfile(rawInput: unknown): Promise<UpdateMobilityProfileResult> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "USER") {
    return { success: false, error: "กรุณาเข้าสู่ระบบด้วยบัญชีผู้รับบริการ" };
  }

  const parsed = mobilityValuesSchema.safeParse(rawInput);
  if (!parsed.success) {
    return { success: false, error: "ข้อมูลระดับการเคลื่อนไหวไม่ถูกต้อง" };
  }

  const values = parsed.data;
  const isWalkingNormally = values.walksNormally;

  const supabase = await createClient();

  // 1. Check if user is a Caregiver linked to a Patient
  const { data: links } = await supabase
    .from("caregiver_patient_links")
    .select("patient_id")
    .eq("caregiver_profile_id", current.profileId);

  if (links && links.length > 0) {
    const patientId = links[0].patient_id;
    const { error } = await supabase
      .from("patient_mobility_profiles")
      .update({
        walks_normally: isWalkingNormally,
        uses_wheelchair: isWalkingNormally ? false : values.usesWheelchair,
        uses_cane: isWalkingNormally ? false : values.usesCane,
        usesWalker: isWalkingNormally ? false : values.usesWalker,
        needs_walking_assistance: isWalkingNormally ? false : values.needsWalkingAssistant,
        difficulty_using_stairs: isWalkingNormally ? false : values.avoidsStairs,
        is_bedridden: isWalkingNormally ? false : values.isBedridden,
        note: values.notes.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("patient_id", patientId);

    if (error) {
      return { success: false, error: "บันทึกข้อมูลไม่สำเร็จ: " + error.message };
    }
  } else {
    // 2. Patient Self - update mobility_profiles
    const updatePayload = {
      uses_wheelchair: isWalkingNormally ? false : values.usesWheelchair,
      uses_cane: isWalkingNormally ? false : values.usesCane,
      uses_walker: isWalkingNormally ? false : values.usesWalker,
      needs_walking_assistance: isWalkingNormally ? false : values.needsWalkingAssistant,
      difficulty_using_stairs: isWalkingNormally ? false : values.avoidsStairs,
      is_bedridden: isWalkingNormally ? false : values.isBedridden,
      note: values.notes.trim() || null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("mobility_profiles")
      .update(updatePayload)
      .eq("user_id", current.profileId);

    if (updateError) {
      return { success: false, error: "บันทึกข้อมูลไม่สำเร็จ: " + updateError.message };
    }
  }

  revalidatePath("/mobility");
  revalidatePath("/booking");
  revalidatePath("/user");

  return { success: true };
}
