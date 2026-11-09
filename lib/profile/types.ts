import type { UserRole, AuthProvider } from "@/app/_lib/auth";
import type { QualificationType } from "@/app/_lib/services";

// Re-export strict roles
// STRICT: Only "USER" | "BUDDY" - NO ADMIN, NO PROFESSIONAL
export type { UserRole, AuthProvider };

/**
 * Standard inclusive gender list synchronized across UI, Zod schema, and database.
 */
export const ALLOWED_GENDERS = [
  "WOMAN",
  "MAN",
  "NON_BINARY",
  "TRANSGENDER_WOMAN",
  "TRANSGENDER_MAN",
  "GENDER_DIVERSE",
  "PREFER_NOT_TO_SAY",
  "SELF_DESCRIBE",
] as const;

export type Gender = (typeof ALLOWED_GENDERS)[number];

/** Base profile input common to all onboarding users */
export type BaseProfileInput = {
  role: "USER" | "BUDDY";
  firstName: string;
  lastName: string;
  phone?: string | null;
  email?: string | null;
  birthDate?: string | null;
  gender?: Gender | string | null;
};

/** Mobility settings for USER onboarding */
export type MobilityProfileInput = {
  walksNormally?: boolean;
  usesWheelchair?: boolean;
  usesCane?: boolean;
  usesWalker?: boolean;
  needsWalkingAssistance?: boolean;
  difficultyUsingStairs?: boolean;
  isBedridden?: boolean;
  note?: string | null;
};

/** Emergency contact payload for USER onboarding */
export type EmergencyContactInput = {
  name: string;
  relationship: string;
  phone: string;
  isPrimary?: boolean;
};

export type PatientInput = {
  firstName: string;
  lastName: string;
  gender: Gender | string;
  birthDate: string;
  phone?: string | null;
  address: string;
  mobility: MobilityProfileInput;
};

/** USER onboarding payload */
export type UserProfileInput = BaseProfileInput & {
  role: "USER";
  applicantType?: "PATIENT" | "PATIENT_CAREGIVER" | "";
  caregiverName?: string | null;
  caregiverPhone?: string | null;
  address?: string | null;
  patient?: PatientInput;
  mobility?: MobilityProfileInput;
  emergencyContacts?: EmergencyContactInput[];
};

/** BUDDY qualification onboarding payload */
export type BuddyQualificationInput = {
  qualificationType: QualificationType; // STRICT: Only "BEDRIDDEN_CARE_TRAINING" | "VILLAGE_HEALTH_VOLUNTEER" | "CAREGIVER_420_HOURS"
  issuedBy?: string | null;
  certificateNo?: string | null;
  issuedAt?: string | null;
  expiresAt?: string | null;
  certificatePath?: string | null;
};

/** BUDDY onboarding payload */
export type BuddyProfileInput = BaseProfileInput & {
  role: "BUDDY";
  serviceArea?: string | null;
  religion: string;
  gender: string;
  workModes: ("DAILY" | "MONTHLY")[];
  qualifications?: BuddyQualificationInput[];
};

export type ProfileInput = UserProfileInput | BuddyProfileInput;

/** Database row representations */
export type ProfileRecord = {
  id: string;
  auth_user_id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  birth_date: string | null;
  gender: string | null;
  created_at: string;
  updated_at: string;
};

export type MobilityProfileRecord = {
  id: string;
  user_id: string;
  uses_wheelchair: boolean;
  uses_cane: boolean;
  uses_walker: boolean;
  needs_walking_assistance: boolean;
  difficulty_using_stairs: boolean;
  is_bedridden: boolean;
  note: string | null;
  created_at: string;
  updated_at: string;
};

export type EmergencyContactRecord = {
  id: string;
  user_id: string;
  name: string;
  relationship: string;
  phone: string;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
};

export type BuddyProfileRecord = {
  id: string;
  buddy_id: string;
  service_area: string | null;
  religion?: string | null;
  gender?: string | null;
  work_modes?: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type BuddyQualificationRecord = {
  id: string;
  buddy_id: string;
  qualification_type: QualificationType;
  status: "PENDING" | "VERIFIED" | "REJECTED" | "EXPIRED";
  issued_by: string | null;
  certificate_no: string | null;
  issued_at: string | null;
  expires_at: string | null;
  certificate_path: string | null;
  created_at: string;
  updated_at: string;
};

/** Result of the createProfile contract validation */
export type ProfileCreationContractResult =
  | {
      success: true;
      data: {
        profile: {
          auth_user_id: string;
          role: UserRole;
          first_name: string;
          last_name: string;
          phone: string | null;
          email: string | null;
          birth_date: string | null;
          gender: string | null;
          applicant_type?: "PATIENT" | "PATIENT_CAREGIVER" | "";
        };
        mobilityProfile?: Omit<MobilityProfileRecord, "id" | "user_id" | "created_at" | "updated_at"> & {
          walks_normally?: boolean;
        };
        emergencyContacts?: Omit<EmergencyContactRecord, "id" | "user_id" | "created_at" | "updated_at">[];
        patient?: {
          first_name: string;
          last_name: string;
          gender: string;
          birth_date: string;
          phone: string | null;
          address: string;
          mobility: Omit<MobilityProfileRecord, "id" | "user_id" | "created_at" | "updated_at"> & { walks_normally?: boolean };
        };
        buddyProfile?: Omit<BuddyProfileRecord, "id" | "buddy_id" | "created_at" | "updated_at">;
        qualifications?: Omit<BuddyQualificationRecord, "id" | "buddy_id" | "created_at" | "updated_at">[];
      };
    }
  | {
      success: false;
      error: string;
      isSchemaGap?: boolean;
      issues?: Array<{ message: string }>;
    };

/** Resolution state for first-login check */
export type ProfileResolution =
  | {
      status: "PROFILE_COMPLETED";
      profile: ProfileRecord;
      redirectPath: "/user" | "/buddy";
    }
  | {
      status: "PROFILE_REQUIRED";
      authUserId: string;
    }
  | {
      status: "UNAUTHENTICATED";
    }
  | {
      status: "SERVICE_UNAVAILABLE";
      error?: string;
    };
