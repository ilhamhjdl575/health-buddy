import type { ServiceType } from "@/app/_lib/services";

export type MyJobStatus =
  | "ACCEPTED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "IN_PROGRESS"
  | "IN_SERVICE"
  | "COMPLETED";

export type MyJob = {
  id: string;
  serviceType: ServiceType;
  date: string;
  time: string;
  status: MyJobStatus;
};

export const statusLabels: Record<MyJobStatus, string> = {
  ACCEPTED: "รับงานแล้ว",
  ON_THE_WAY: "กำลังเดินทาง",
  ARRIVED: "ถึงจุดรับแล้ว",
  IN_PROGRESS: "กำลังให้ความช่วยเหลือ",
  IN_SERVICE: "กำลังให้ความช่วยเหลือ",
  COMPLETED: "เสร็จสิ้น",
};

export const myJobs: MyJob[] = [
  { id: "HB-001", serviceType: "DOCTOR_VISIT", date: "10 พ.ย. 2026", time: "08:00–09:00", status: "ACCEPTED" },
  { id: "HB-004", serviceType: "BEDRIDDEN_CARE", date: "10 พ.ย. 2026", time: "13:00–14:00", status: "ON_THE_WAY" },
];

export function getMyJob(jobId: string) {
  return myJobs.find((job) => job.id === jobId);
}
