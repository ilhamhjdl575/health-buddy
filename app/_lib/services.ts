export const SERVICE_TYPES = ["DOCTOR_VISIT", "BEDRIDDEN_CARE"] as const;

export type ServiceType = (typeof SERVICE_TYPES)[number];

export const QUALIFICATION_TYPES = ["BEDRIDDEN_CARE_TRAINING", "VILLAGE_HEALTH_VOLUNTEER", "CAREGIVER_420_HOURS"] as const;

export type QualificationType = (typeof QUALIFICATION_TYPES)[number];

export const SERVICE_LABELS: Record<ServiceType, string> = {
  DOCTOR_VISIT: "พาไปพบแพทย์",
  BEDRIDDEN_CARE: "ดูแลผู้ป่วยติดเตียง",
};

export const QUALIFICATION_LABELS: Record<QualificationType, string> = {
  BEDRIDDEN_CARE_TRAINING: "ผ่านการอบรมการดูแลผู้ป่วยติดเตียง",
  VILLAGE_HEALTH_VOLUNTEER: "อสม.",
  CAREGIVER_420_HOURS: "พนักงานผู้ช่วยผู้ป่วย Caregiver (อบรม 420 ชั่วโมง)",
};

export const SERVICE_REQUIRED_QUALIFICATION: Partial<Record<ServiceType, QualificationType>> = {
  BEDRIDDEN_CARE: "BEDRIDDEN_CARE_TRAINING",
};
