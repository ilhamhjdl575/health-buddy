"use server";

import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getCurrentUser } from "@/lib/auth/get-user";
import { createClient } from "@/lib/supabase/server";
import { ROLE_HOME_PATH, type UserRole } from "@/app/_lib/auth";
import { createProfileContract } from "./create-profile";

export type CompleteOnboardingResult =
  | {
      success: true;
      role: UserRole;
      redirectPath: "/user" | "/buddy";
    }
  | {
      success: false;
      error: string;
      isSchemaGap?: boolean;
    };

function classifyOnboardingRpcError(error: { code?: string; message: string }): {
  error: string;
  isSchemaGap?: boolean;
} {
  if (error.message.includes("Profile already exists") || error.code === "23505") {
    return { error: "บัญชีนี้สมัครสมาชิกเรียบร้อยแล้ว กรุณากลับไปเข้าสู่ระบบ" };
  }

  if (error.message.includes("Authentication required") || error.code === "42501") {
    return { error: "สิทธิ์การเข้าสู่ระบบหมดอายุ กรุณาเข้าสู่ระบบใหม่แล้วสมัครอีกครั้ง" };
  }

  if (
    error.message.includes("At least one Buddy type") ||
    error.message.includes("Valid certificate") ||
    error.code === "23502" ||
    error.code === "23514" ||
    error.code === "22P02"
  ) {
    return { error: "ข้อมูลบางส่วนไม่ครบหรือมีรูปแบบไม่ถูกต้อง กรุณาตรวจสอบช่องที่กรอกและลองอีกครั้ง" };
  }

  if (error.message.includes("Complete patient details")) {
    return {
      error: "ข้อมูลผู้รับบริการยังไม่ครบ กรุณาตรวจสอบชื่อ-นามสกุล ปีเกิด เพศ ที่อยู่ และระดับการเคลื่อนไหว",
    };
  }

  if (error.code === "PGRST202" || error.code === "42883") {
    return {
      error: "ระบบสมัครสมาชิกกำลังปรับปรุงและยังบันทึกข้อมูลไม่ได้ กรุณาแจ้งผู้ดูแลระบบ (รหัส ONBOARDING_SCHEMA)",
      isSchemaGap: true,
    };
  }

  if (error.code?.startsWith("PGRST")) {
    return { error: "ระบบฐานข้อมูลไม่ตอบรับคำขอ กรุณารอสักครู่แล้วลองใหม่ (รหัส ONBOARDING_API)" };
  }

  return { error: "ระบบไม่สามารถบันทึกการสมัครได้ในขณะนี้ กรุณาลองใหม่ หากยังพบปัญหาให้แจ้งผู้ดูแลระบบ (รหัส ONBOARDING_DB)" };
}

/**
 * Completes first-login onboarding atomically via trusted server action & PostgreSQL RPC.
 *
 * Security guarantees:
 * 1. auth_user_id is resolved strictly from server-side session (getCurrentUser()), never from client.
 * 2. Role is strictly USER or BUDDY (no ADMIN or PROFESSIONAL).
 * 3. File upload verifies private bucket 'buddy-certificates', ownership prefix auth.uid(), and MIME types.
 * 4. Post-onboarding redirect is resolved from database profile query (getCurrentProfile()), never client parameter.
 */
export async function completeProfileOnboarding(
  rawInput: unknown,
  certificateData?: FormData,
): Promise<CompleteOnboardingResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "กรุณาเข้าสู่ระบบอีกครั้งก่อนสมัครสมาชิก" };
  }

  const contract = await createProfileContract(user.id, rawInput);
  if (!contract.success) {
    const validationMessage = contract.issues?.[0]?.message;
    return {
      success: false,
      isSchemaGap: contract.isSchemaGap,
      error: contract.error.startsWith("SCHEMA_GAP_BLOCKED:")
        ? contract.error.replace("SCHEMA_GAP_BLOCKED: ", "")
        : validationMessage
          ? `กรุณาตรวจสอบข้อมูล: ${validationMessage}`
          : "ข้อมูลสมัครสมาชิกไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง",
    };
  }

  const { profile, mobilityProfile, emergencyContacts, buddyProfile, patient } = contract.data;
  let qualifications = contract.data.qualifications;
  const uploadedPaths: string[] = [];

  try {
    const supabase = await createClient();

    // Handle private Buddy certificate uploads
    if (profile.role === "BUDDY" && qualifications?.length) {
      const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png"]);
      const withCertificates = [];

      for (const qualification of qualifications) {
        const file = certificateData?.get(qualification.qualification_type);
        if (!(file instanceof File) || file.size === 0) {
          return { success: false, error: "กรุณาอัปโหลดใบรับรองให้ครบทุกประเภท Buddy ที่เลือก" };
        }
        if (!allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024) {
          return { success: false, error: "ใบรับรองต้องเป็น PDF, JPG หรือ PNG และมีขนาดไม่เกิน 10 MB" };
        }

        const extension = file.name.split(".").pop()?.toLowerCase().replace(/[^a-z0-9]/g, "") || "bin";
        // Security: Path MUST start with user.id to enforce RLS storage policies
        const path = `${user.id}/${qualification.qualification_type}-${crypto.randomUUID()}.${extension}`;

        const { error: uploadError } = await supabase.storage
          .from("buddy-certificates")
          .upload(path, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          if (uploadedPaths.length) {
            await supabase.storage.from("buddy-certificates").remove(uploadedPaths);
          }
          return { success: false, error: "ไม่สามารถอัปโหลดใบรับรองได้ กรุณาลองอีกครั้ง" };
        }

        uploadedPaths.push(path);
        withCertificates.push({ ...qualification, certificate_path: path });
      }
      qualifications = withCertificates;
    }

    // Call atomic RPC function in Supabase
    const { error } = await supabase.rpc("complete_profile_onboarding", {
      p_profile: profile,
      p_mobility_profile: mobilityProfile ?? null,
      p_buddy_profile: buddyProfile ?? null,
      p_qualifications: qualifications ?? [],
      p_emergency_contacts: emergencyContacts ?? [],
      p_patient: patient ?? null,
    });

    if (error) {
      // Clean up uploaded certificates if database transaction failed
      if (uploadedPaths.length) {
        await supabase.storage.from("buddy-certificates").remove(uploadedPaths);
      }

      console.error("[profile/onboarding] RPC failed", {
        code: error.code,
      });

      return { success: false, ...classifyOnboardingRpcError(error) };
    }

    // Resolve verified post-login profile from database (never trust client role)
    const verifiedResolution = await getCurrentProfile();
    if (verifiedResolution.status === "AUTHENTICATED") {
      return {
        success: true,
        role: verifiedResolution.role,
        redirectPath: ROLE_HOME_PATH[verifiedResolution.role],
      };
    }

    return {
      success: true,
      role: profile.role,
      redirectPath: ROLE_HOME_PATH[profile.role],
    };
  } catch (error) {
    console.error("[profile/onboarding] request failed", {
      name: error instanceof Error ? error.name : "UnknownError",
    });
    if (uploadedPaths.length) {
      try {
        const supabase = await createClient();
        await supabase.storage.from("buddy-certificates").remove(uploadedPaths);
      } catch {
        // Best-effort cleanup
      }
    }

    return {
      success: false,
      error: "เชื่อมต่อระบบสมาชิกไม่ได้ กรุณาตรวจสอบอินเทอร์เน็ต รอสักครู่ แล้วลองใหม่ (รหัส ONBOARDING_NETWORK)",
    };
  }
}
