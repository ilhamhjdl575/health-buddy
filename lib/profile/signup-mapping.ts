import type { UserProfileInput, BuddyProfileInput } from "./types";

/**
 * Raw data shape from USER signup form in `signup-view.tsx`
 */
export interface UserSignupFormRaw {
  applicantType: "PATIENT_CAREGIVER" | "PATIENT" | "";
  caregiverFirstName?: string;
  caregiverLastName?: string;
  caregiverPhone?: string;
  caregiverGender?: string;
  fullName: string;
  phone: string;
  birthYear: string;
  gender?: string;
  address?: string;
  hasCar?: boolean;
  mobilityStatuses?: string[];
  emergencyName?: string;
  emergencyRelation?: string;
  emergencyPhone?: string;
}

/**
 * Raw data shape from BUDDY signup form in `signup-view.tsx`
 */
export interface BuddySignupFormRaw {
  firstName: string;
  lastName: string;
  phone: string;
  religion: string;
  gender: string;
  hasCar?: boolean;
  buddyTypes: ("VILLAGE_HEALTH_VOLUNTEER" | "CAREGIVER_420_HOURS")[];
  workModes: ("DAILY" | "MONTHLY" | "HAS_CAR")[];
}

/**
 * Helper to split Thai or standard full name into firstName and lastName.
 */
function splitFullName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  const firstName = parts[0] ?? "";
  const lastName = parts.slice(1).join(" ");
  return { firstName, lastName };
}

/**
 * Helper to parse a 4-digit birth year (CE or BE) to an approximate ISO YYYY-MM-DD.
 */
function parseBirthDate(birthYear?: string): string | null {
  if (!birthYear) return null;
  const num = parseInt(birthYear.trim(), 10);
  if (isNaN(num)) return null;

  // If year > 2400, assume Buddhist Era (BE) and convert to CE
  const yearCE = num > 2400 ? num - 543 : num;
  if (yearCE < 1900 || yearCE > 2100) return null;

  return `${yearCE}-01-01`;
}

/**
 * Maps raw USER signup form data to UserProfileInput contract.
 */
export function mapUserFormDataToProfileInput(form: UserSignupFormRaw): UserProfileInput {
  const patientName = splitFullName(form.fullName);
  const isCaregiver = form.applicantType === "PATIENT_CAREGIVER";
  const firstName = isCaregiver ? form.caregiverFirstName?.trim() || "" : patientName.firstName;
  const lastName = isCaregiver ? form.caregiverLastName?.trim() || "" : patientName.lastName;

  const mobilityStatuses = form.mobilityStatuses ?? [];
  const walksNormally = mobilityStatuses.includes("walks-normally");

  // Enforce mutual exclusion: If "เดินได้คล่อง" is true, all other limitations MUST be false
  const isBedridden = !walksNormally && mobilityStatuses.includes("bedridden");
  const usesCane = !walksNormally && mobilityStatuses.includes("uses-cane");
  const usesWalker = !walksNormally && mobilityStatuses.includes("uses-walker");
  const usesWheelchair = !walksNormally && mobilityStatuses.includes("uses-wheelchair");
  const needsWalkingAssistance = !walksNormally && mobilityStatuses.includes("needs-assistant");
  const difficultyUsingStairs = !walksNormally && mobilityStatuses.includes("avoids-stairs");

  const noteParts = [
    form.address ? `ที่อยู่: ${form.address}` : null,
    form.hasCar !== undefined
      ? form.hasCar
        ? "รถยนต์: มีรถยนต์ส่วนตัว"
        : "รถยนต์: ไม่มีรถยนต์ส่วนตัว"
      : null,
  ].filter(Boolean);

  const emergencyContacts =
    form.emergencyName?.trim() && form.emergencyPhone?.trim()
      ? [
          {
            name: form.emergencyName.trim(),
            relationship: form.emergencyRelation?.trim() || "ผู้ติดต่อฉุกเฉิน",
            phone: form.emergencyPhone.trim(),
            isPrimary: true,
          },
        ]
      : [];

  return {
    role: "USER",
    applicantType: form.applicantType,
    caregiverName: isCaregiver ? `${firstName} ${lastName}` : null,
    caregiverPhone: form.caregiverPhone?.trim() || null,
    address: form.address?.trim() || null,
    firstName,
    lastName,
    phone: isCaregiver ? form.caregiverPhone?.trim() || null : form.phone.trim() || null,
    gender: isCaregiver ? form.caregiverGender?.trim() || null : form.gender?.trim() || null,
    birthDate: isCaregiver ? null : parseBirthDate(form.birthYear),
    mobility: {
      walksNormally,
      usesWheelchair,
      usesCane,
      usesWalker,
      needsWalkingAssistance,
      difficultyUsingStairs,
      isBedridden,
      note: noteParts.join(" | ") || null,
    },
    emergencyContacts,
    patient: isCaregiver
      ? {
          firstName: patientName.firstName,
          lastName: patientName.lastName,
          gender: form.gender?.trim() || "",
          birthDate: parseBirthDate(form.birthYear) || "",
          phone: form.phone.trim() || null,
          address: form.address?.trim() || "",
          mobility: {
            walksNormally,
            usesWheelchair,
            usesCane,
            usesWalker,
            needsWalkingAssistance,
            difficultyUsingStairs,
            isBedridden,
            note: noteParts.join(" | ") || null,
          },
        }
      : undefined,
  };
}

/**
 * Maps raw BUDDY signup form data to BuddyProfileInput contract.
 */
export function mapBuddyFormDataToProfileInput(form: BuddySignupFormRaw): BuddyProfileInput {
  const qualifications = form.buddyTypes.map((buddyType) => ({
    qualificationType: buddyType,
  }));

  let workModes: BuddyProfileInput["workModes"] = [...form.workModes];
  if (form.hasCar) {
    workModes = Array.from(new Set([...workModes, "HAS_CAR"]));
  }

  return {
    role: "BUDDY",
    firstName: form.firstName.trim(),
    lastName: form.lastName.trim(),
    phone: form.phone.trim() || null,
    religion: form.religion.trim(),
    gender: form.gender.trim(),
    workModes,
    qualifications,
  };
}
