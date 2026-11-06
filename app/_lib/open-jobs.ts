export type OpenJob = {
  id: string;
  helpType: string;
  date: string;
  time: string;
  area: string;
  distance: string;
  mobilityRequirement: string;
  status: "OPEN";
};

export const openJobs: OpenJob[] = [
  {
    id: "HB-001",
    helpType: "เดินทาง",
    date: "10 พ.ย. 2026",
    time: "08:00–09:00",
    area: "เขตเทศบาลเมืองยะลา",
    distance: "1.2 กม.",
    mobilityRequirement: "ใช้ไม้เท้า",
    status: "OPEN",
  },
  {
    id: "HB-002",
    helpType: "นัดหมาย",
    date: "10 พ.ย. 2026",
    time: "10:30–11:30",
    area: "ตำบลสะเตง",
    distance: "2.4 กม.",
    mobilityRequirement: "ใช้รถเข็น",
    status: "OPEN",
  },
  {
    id: "HB-003",
    helpType: "ช่วยสื่อสาร",
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
