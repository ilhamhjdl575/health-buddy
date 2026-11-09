import { z } from "zod";
import { ALLOWED_GENDERS } from "./types";

const phoneRegex = /^[0-9+\s\-]{9,15}$/;
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Common base profile validation.
 * Role MUST be strictly "USER" or "BUDDY" - NO ADMIN, NO PROFESSIONAL.
 */
export const baseProfileSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกชื่อ"),
  lastName: z
    .string()
    .trim()
    .min(1, "กรุณากรอกนามสกุล"),
  phone: z
    .string()
    .trim()
    .regex(phoneRegex, "เบอร์โทรศัพท์ไม่ถูกต้อง (9-12 หลัก)")
    .nullable()
    .optional(),
  email: z
    .string()
    .trim()
    .email("รูปแบบอีเมลไม่ถูกต้อง")
    .nullable()
    .optional(),
  birthDate: z
    .string()
    .trim()
    .regex(dateRegex, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD")
    .nullable()
    .optional(),
  gender: z
    .enum(ALLOWED_GENDERS)
    .or(z.string().trim())
    .nullable()
    .optional(),
});

/**
 * Emergency contact validation schema for USER.
 */
export const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "กรุณาระบุชื่อผู้ติดต่อฉุกเฉิน"),
  relationship: z.string().trim().min(1, "กรุณาระบุความสัมพันธ์"),
  phone: z.string().trim().regex(phoneRegex, "เบอร์โทรศัพท์ผู้ติดต่อฉุกเฉินไม่ถูกต้อง"),
  isPrimary: z.boolean().default(true),
});

/**
 * Mobility profile validation for USER.
 * Strict: only standard mobility assistance flags, no extra medical fields.
 */
export const mobilityProfileSchema = z
  .object({
    walksNormally: z.boolean().default(false),
    usesWheelchair: z.boolean().default(false),
    usesCane: z.boolean().default(false),
    usesWalker: z.boolean().default(false),
    needsWalkingAssistance: z.boolean().default(false),
    difficultyUsingStairs: z.boolean().default(false),
    isBedridden: z.boolean().default(false),
    note: z.string().trim().nullable().optional(),
  })
  .transform((data) => {
    // Business rule: If "walksNormally" is selected, all limitations MUST be false
    if (data.walksNormally) {
      return {
        ...data,
        usesWheelchair: false,
        usesCane: false,
        usesWalker: false,
        needsWalkingAssistance: false,
        difficultyUsingStairs: false,
        isBedridden: false,
      };
    }
    return data;
  });

/**
 * USER profile onboarding schema.
 */
export const userProfileSchema = baseProfileSchema.extend({
  role: z.literal("USER"),
  applicantType: z.enum(["PATIENT", "PATIENT_CAREGIVER", ""]).optional(),
  caregiverName: z.string().trim().nullable().optional(),
  caregiverPhone: z.string().trim().nullable().optional(),
  address: z.string().trim().nullable().optional(),
  mobility: mobilityProfileSchema.optional(),
  emergencyContacts: z.array(emergencyContactSchema).optional(),
  patient: z.object({
    firstName: z.string().trim().min(1, "กรุณากรอกชื่อผู้ป่วย"),
    lastName: z.string().trim().min(1, "กรุณากรอกนามสกุลผู้ป่วย"),
    gender: z.enum(ALLOWED_GENDERS).or(z.string().trim().min(1)),
    birthDate: z.string().trim().regex(dateRegex, "รูปแบบวันเกิดต้องเป็น YYYY-MM-DD"),
    phone: z.string().trim().regex(phoneRegex, "เบอร์โทรศัพท์ผู้ป่วยไม่ถูกต้อง").nullable().optional(),
    address: z.string().trim().min(1, "กรุณากรอกที่อยู่ผู้ป่วย"),
    mobility: mobilityProfileSchema,
  }).optional(),
}).superRefine((data, ctx) => {
  if (data.applicantType === "PATIENT_CAREGIVER" && !data.patient) {
    ctx.addIssue({ code: "custom", path: ["patient"], message: "กรุณากรอกข้อมูลผู้ป่วย" });
  }
});

/**
 * BUDDY qualification validation.
 * Strict: qualificationType must be an allowed qualification enum.
 */
export const buddyQualificationSchema = z.object({
  qualificationType: z.enum([
    "BEDRIDDEN_CARE_TRAINING",
    "VILLAGE_HEALTH_VOLUNTEER",
    "CAREGIVER_420_HOURS",
  ]),
  issuedBy: z.string().trim().nullable().optional(),
  certificateNo: z.string().trim().nullable().optional(),
  issuedAt: z.string().trim().regex(dateRegex, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD").nullable().optional(),
  expiresAt: z.string().trim().regex(dateRegex, "รูปแบบวันที่ต้องเป็น YYYY-MM-DD").nullable().optional(),
  certificatePath: z.string().trim().nullable().optional(),
});

/**
 * BUDDY profile onboarding schema.
 */
export const buddyProfileSchema = baseProfileSchema
  .extend({
    role: z.literal("BUDDY"),
    serviceArea: z.string().trim().nullable().optional(),
    religion: z.string().trim().min(1, "กรุณาเลือกศาสนา"),
    gender: z.string().trim().min(1, "กรุณาเลือกเพศ"),
    workModes: z.array(z.enum(["DAILY", "MONTHLY", "HAS_CAR"])),
    qualifications: z
      .array(buddyQualificationSchema)
      .min(1, "กรุณาเลือกประเภท Buddy อย่างน้อย 1 ประเภท"),
  })
  .refine(
    (data) => {
      const hasCaregiver = (data.qualifications ?? []).some(
        (q) => q.qualificationType === "CAREGIVER_420_HOURS",
      );
      if (hasCaregiver) {
        return data.workModes.length > 0;
      }
      return true;
    },
    {
      message: "พนักงานผู้ช่วยผู้ป่วย (Caregiver) ต้องเลือกรูปแบบการทำงานอย่างน้อย 1 แบบ (รายวัน หรือ รายเดือน)",
      path: ["workModes"],
    },
  );

/**
 * Discriminated union for validating any profile onboarding input based on `role`.
 */
export const profileInputSchema = z.discriminatedUnion("role", [
  userProfileSchema,
  buddyProfileSchema,
]);

export type ValidatedProfileInput = z.infer<typeof profileInputSchema>;
export type ValidatedUserProfileInput = z.infer<typeof userProfileSchema>;
export type ValidatedBuddyProfileInput = z.infer<typeof buddyProfileSchema>;
export type ValidatedEmergencyContactInput = z.infer<typeof emergencyContactSchema>;
