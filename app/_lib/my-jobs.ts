export type MyJobStatus = "ACCEPTED" | "ON_THE_WAY" | "ARRIVED" | "IN_SERVICE" | "COMPLETED";

export type MyJob = {
  id: string;
  helpType: string;
  date: string;
  time: string;
  status: MyJobStatus;
};

export const statusLabels: Record<MyJobStatus, string> = {
  ACCEPTED: "รับงานแล้ว",
  ON_THE_WAY: "กำลังเดินทาง",
  ARRIVED: "ถึงจุดรับแล้ว",
  IN_SERVICE: "กำลังให้ความช่วยเหลือ",
  COMPLETED: "เสร็จสิ้น",
};

export const myJobs: MyJob[] = [
  { id: "HB-001", helpType: "เดินทาง", date: "10 พ.ย. 2026", time: "08:00–09:00", status: "ACCEPTED" },
  { id: "HB-004", helpType: "นัดหมาย", date: "10 พ.ย. 2026", time: "13:00–14:00", status: "ON_THE_WAY" },
];

export function getMyJob(jobId: string) {
  return myJobs.find((job) => job.id === jobId);
}
