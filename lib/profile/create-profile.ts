import "server-only";

import { profileInputSchema, type ValidatedProfileInput } from "./schema";
import type { ProfileCreationContractResult } from "./types";

/**
 * Validates the onboarding input and prepares the database creation payload.
 *
 * PRIVACY & SECURITY RULES:
 * 1. The client MUST NEVER supply authUserId from form fields.
 *    The authUserId MUST come directly from the authenticated Supabase session (e.g. getCurrentUser()).
 * 2. Client role is strictly validated against allowed roles ("USER" | "BUDDY").
 *    No ADMIN or PROFESSIONAL roles are permitted.
 * 3. Atomic execution via trusted RPC in PostgreSQL.
 * 4. Caregiver onboarding creates a separate patient payload; the RPC persists it atomically.
 */
export async function createProfileContract(
  authUserId: string,
  rawInput: unknown,
): Promise<ProfileCreationContractResult> {
  if (!authUserId || typeof authUserId !== "string") {
    return {
      success: false,
      error: "UNAUTHORIZED: Invalid or missing authenticated user ID",
    };
  }

  const parseResult = profileInputSchema.safeParse(rawInput);
  if (!parseResult.success) {
    return {
      success: false,
      error:
        "VALIDATION_ERROR: " +
        parseResult.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join(", "),
      issues: parseResult.error.issues,
    };
  }

  const input: ValidatedProfileInput = parseResult.data;

  // Prepare profile payload
  const profileRecord = {
    auth_user_id: authUserId,
    role: input.role,
    first_name: input.firstName,
    last_name: input.lastName,
    phone: input.phone ?? null,
    email: input.email ?? null,
    birth_date: input.birthDate ?? null,
    gender: input.gender ?? null,
  };

  // Role-specific payload preparation
  if (input.role === "USER") {
    const userProfileRecord = {
      ...profileRecord,
      applicant_type: input.applicantType ?? "PATIENT",
      address: input.applicantType === "PATIENT" ? input.address ?? null : null,
    };
    const walksNormally = input.mobility?.walksNormally ?? false;

    const mobilityRecord = {
      walks_normally: walksNormally,
      uses_wheelchair: walksNormally ? false : (input.mobility?.usesWheelchair ?? false),
      uses_cane: walksNormally ? false : (input.mobility?.usesCane ?? false),
      uses_walker: walksNormally ? false : (input.mobility?.usesWalker ?? false),
      needs_walking_assistance: walksNormally ? false : (input.mobility?.needsWalkingAssistance ?? false),
      difficulty_using_stairs: walksNormally ? false : (input.mobility?.difficultyUsingStairs ?? false),
      is_bedridden: walksNormally ? false : (input.mobility?.isBedridden ?? false),
      note: input.mobility?.note ?? null,
    };

    const emergencyContacts = (input.emergencyContacts ?? []).map((c, idx) => ({
      name: c.name,
      relationship: c.relationship,
      phone: c.phone,
      is_primary: c.isPrimary ?? (idx === 0),
    }));

    if (input.applicantType === "PATIENT" && emergencyContacts.length === 0) {
      return {
        success: false,
        error: "VALIDATION_ERROR: กรณีผู้ป่วยสมัครเอง ต้องระบุผู้ติดต่อฉุกเฉินอย่างน้อย 1 คน",
      };
    }

    const patient = input.applicantType === "PATIENT_CAREGIVER" && input.patient
      ? {
          first_name: input.patient.firstName,
          last_name: input.patient.lastName,
          gender: input.patient.gender,
          birth_date: input.patient.birthDate,
          phone: input.patient.phone ?? null,
          address: input.patient.address,
          mobility: {
            walks_normally: input.patient.mobility.walksNormally ?? false,
            uses_wheelchair: input.patient.mobility.usesWheelchair ?? false,
            uses_cane: input.patient.mobility.usesCane ?? false,
            uses_walker: input.patient.mobility.usesWalker ?? false,
            needs_walking_assistance: input.patient.mobility.needsWalkingAssistance ?? false,
            difficulty_using_stairs: input.patient.mobility.difficultyUsingStairs ?? false,
            is_bedridden: input.patient.mobility.isBedridden ?? false,
            note: input.patient.mobility.note ?? null,
          },
        }
      : undefined;

    return {
      success: true,
      data: {
        profile: userProfileRecord,
        mobilityProfile: mobilityRecord,
        emergencyContacts,
        patient,
      },
    };
  }

  // BUDDY
  const buddyRecord = {
    service_area: input.serviceArea ?? null,
    religion: input.religion,
    gender: input.gender,
    work_modes: input.workModes,
    is_active: true,
  };

  const qualifications = (input.qualifications ?? []).map((q) => ({
    qualification_type: q.qualificationType,
    status: "PENDING" as const, // Strict: never automatically VERIFIED
    issued_by: q.issuedBy ?? null,
    certificate_no: q.certificateNo ?? null,
    issued_at: q.issuedAt ?? null,
    expires_at: q.expiresAt ?? null,
    certificate_path: q.certificatePath ?? null,
  }));

  return {
    success: true,
    data: {
      profile: profileRecord,
      buddyProfile: buddyRecord,
      qualifications,
    },
  };
}
