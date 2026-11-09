import type { QualificationType, ServiceType } from "@/app/_lib/services";

/** Safe to show before a Buddy accepts a job. No name, phone, or exact address. */
export type PublicOpenJob = {
  id: string;
  serviceType: ServiceType;
  date: string;
  time: string;
  area: string;
  distance: string;
  mobilityRequirement: string;
  requiredQualification?: QualificationType;
  status: "OPEN";
};

export const openJobs: PublicOpenJob[] = [
  {
    id: "HB-001",
    serviceType: "DOCTOR_VISIT",
    date: "10 พ.ย. 2026",
    time: "08:00–09:00",
    area: "เขตเทศบาลเมืองยะลา",
    distance: "1.2 กม.",
    mobilityRequirement: "ใช้ไม้เท้า",
    status: "OPEN",
  },
  {
    id: "HB-002",
    serviceType: "BEDRIDDEN_CARE",
    date: "10 พ.ย. 2026",
    time: "10:30–11:30",
    area: "ตำบลสะเตง",
    distance: "2.4 กม.",
    mobilityRequirement: "ใช้รถเข็น",
    requiredQualification: "BEDRIDDEN_CARE_TRAINING",
    status: "OPEN",
  },
  {
    id: "HB-003",
    serviceType: "DOCTOR_VISIT",
    date: "11 พ.ย. 2026",
    time: "09:00–10:00",
    area: "เขตเมืองยะลา",
    distance: "3.1 กม.",
    mobilityRequirement: "ต้องมีผู้ช่วยเดิน",
    status: "OPEN",
  },
];

export function getOpenJob(jobId: string) {
  return openJobs.find((job) => job.id === jobId);
}
