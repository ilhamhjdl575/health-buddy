export type CaseStatus = "REQUESTED" | "MATCHING" | "OPEN" | "ACCEPTED" | "ON_THE_WAY" | "ARRIVED" | "IN_SERVICE" | "COMPLETED" | "FOLLOW_UP" | "CLOSED" | "CANCELLED" | "NO_BUDDY_FOUND";
export type CaseTimelineEvent = { status: CaseStatus; dateTime: string };
export type AdminCase = {
  id: string; helpType: string; date: string; time: string; area: string; status: CaseStatus; buddy?: string; attentionReason?: string;
  recipient: { name: string; age: number; phone: string; pickup: string; destination: string; mobility: string };
  timeline: CaseTimelineEvent[];
};

export const caseStatusLabels: Record<CaseStatus, string> = {
  REQUESTED: "คำขอใหม่", MATCHING: "กำลังหา อสม.", OPEN: "เปิดรับงาน", ACCEPTED: "มี อสม. รับงานแล้ว", ON_THE_WAY: "กำลังเดินทาง", ARRIVED: "ถึงจุดรับแล้ว", IN_SERVICE: "กำลังให้บริการ", COMPLETED: "เสร็จสิ้น", FOLLOW_UP: "รอติดตามผล", CLOSED: "ปิดเคส", CANCELLED: "ยกเลิก", NO_BUDDY_FOUND: "หา อสม. ไม่ได้",
};

export const adminSummary = [
  { status: "REQUESTED" as const, label: "คำขอใหม่", count: 3 }, { status: "MATCHING" as const, label: "กำลังหา อสม.", count: 2 }, { status: "ACCEPTED" as const, label: "มี อสม. รับงานแล้ว", count: 4 }, { status: "IN_SERVICE" as const, label: "กำลังให้บริการ", count: 1 }, { status: "FOLLOW_UP" as const, label: "รอติดตามผล", count: 2 }, { status: "COMPLETED" as const, label: "เสร็จสิ้น", count: 12 },
];

export const adminCases: AdminCase[] = [
  { id: "HC-101", helpType: "เดินทาง", date: "10 พ.ย. 2026", time: "08:00", area: "เขตเทศบาลเมืองยะลา", status: "MATCHING", attentionReason: "กำลังหา อสม. ที่พร้อมรับงาน", recipient: { name: "คุณสมชาย ใจดี", age: 72, phone: "081-111-1111", pickup: "25 ถนนตัวอย่าง เขตเทศบาลเมืองยะลา", destination: "โรงพยาบาลยะลา", mobility: "ใช้ไม้เท้า" }, timeline: [{ status: "REQUESTED", dateTime: "9 พ.ย. 2026, 14:20" }, { status: "MATCHING", dateTime: "9 พ.ย. 2026, 14:25" }] },
  { id: "HC-102", helpType: "นัดหมาย", date: "10 พ.ย. 2026", time: "10:30", area: "ตำบลสะเตง", status: "NO_BUDDY_FOUND", attentionReason: "ยังไม่มี อสม. ตอบรับงาน", recipient: { name: "คุณมาลี พูนสุข", age: 68, phone: "082-222-2222", pickup: "12 ซอยตัวอย่าง ตำบลสะเตง", destination: "คลินิกชุมชนสะเตง", mobility: "ใช้รถเข็น" }, timeline: [{ status: "REQUESTED", dateTime: "9 พ.ย. 2026, 15:00" }, { status: "MATCHING", dateTime: "9 พ.ย. 2026, 15:05" }, { status: "NO_BUDDY_FOUND", dateTime: "9 พ.ย. 2026, 16:00" }] },
  { id: "HC-103", helpType: "ช่วยสื่อสาร", date: "10 พ.ย. 2026", time: "13:00", area: "เขตเมืองยะลา", status: "FOLLOW_UP", attentionReason: "ผู้ใช้ต้องการความช่วยเหลือเพิ่มเติม", recipient: { name: "คุณอารีย์ แสงทอง", age: 75, phone: "083-333-3333", pickup: "48 ถนนชุมชน เขตเมืองยะลา", destination: "ศูนย์บริการสาธารณสุขเมืองยะลา", mobility: "ต้องมีผู้ช่วยเดิน" }, buddy: "อสม. Ahmad", timeline: [{ status: "REQUESTED", dateTime: "8 พ.ย. 2026, 09:00" }, { status: "ACCEPTED", dateTime: "8 พ.ย. 2026, 09:20" }, { status: "COMPLETED", dateTime: "8 พ.ย. 2026, 11:30" }, { status: "FOLLOW_UP", dateTime: "9 พ.ย. 2026, 10:00" }] },
  { id: "HC-104", helpType: "ประสานงาน", date: "10 พ.ย. 2026", time: "14:00", area: "ตำบลบุดี", status: "ACCEPTED", buddy: "อสม. Fatimah", recipient: { name: "คุณนภา ดีพร้อม", age: 70, phone: "084-444-4444", pickup: "7 ถนนประชาสงเคราะห์ ตำบลบุดี", destination: "ที่ว่าการอำเภอเมืองยะลา", mobility: "ไม่สะดวกใช้บันได" }, timeline: [{ status: "REQUESTED", dateTime: "9 พ.ย. 2026, 11:10" }, { status: "MATCHING", dateTime: "9 พ.ย. 2026, 11:15" }, { status: "ACCEPTED", dateTime: "9 พ.ย. 2026, 11:40" }] },
  { id: "HC-105", helpType: "เดินทาง", date: "10 พ.ย. 2026", time: "15:30", area: "เขตเทศบาลเมืองยะลา", status: "IN_SERVICE", buddy: "อสม. Ahmad", recipient: { name: "คุณวิชัย มั่นคง", age: 76, phone: "085-555-5555", pickup: "89 ถนนสุขใจ เขตเทศบาลเมืองยะลา", destination: "โรงพยาบาลยะลา", mobility: "ใช้รถเข็น" }, timeline: [{ status: "REQUESTED", dateTime: "10 พ.ย. 2026, 09:00" }, { status: "ACCEPTED", dateTime: "10 พ.ย. 2026, 09:25" }, { status: "ON_THE_WAY", dateTime: "10 พ.ย. 2026, 14:50" }, { status: "ARRIVED", dateTime: "10 พ.ย. 2026, 15:20" }, { status: "IN_SERVICE", dateTime: "10 พ.ย. 2026, 15:30" }] },
  { id: "HC-106", helpType: "นำทาง", date: "11 พ.ย. 2026", time: "09:00", area: "ตำบลสะเตง", status: "COMPLETED", buddy: "อสม. Somchai", recipient: { name: "คุณประยูร สุขใจ", age: 73, phone: "086-666-6666", pickup: "33 หมู่ 2 ตำบลสะเตง", destination: "ศูนย์ราชการยะลา", mobility: "ใช้ไม้เท้า" }, timeline: [{ status: "REQUESTED", dateTime: "8 พ.ย. 2026, 13:00" }, { status: "ACCEPTED", dateTime: "8 พ.ย. 2026, 13:35" }, { status: "COMPLETED", dateTime: "8 พ.ย. 2026, 16:00" }] },
  { id: "HC-107", helpType: "โทร / ช่วยติดต่อ", date: "11 พ.ย. 2026", time: "11:00", area: "เขตเมืองยะลา", status: "CANCELLED", attentionReason: "อสม. ยกเลิกก่อนเริ่มงาน", recipient: { name: "คุณศิริพร แก้วดี", age: 66, phone: "087-777-7777", pickup: "55 ถนนตัวอย่าง เขตเมืองยะลา", destination: "บ้านพักผู้รับบริการ", mobility: "ไม่มีข้อจำกัด" }, timeline: [{ status: "REQUESTED", dateTime: "9 พ.ย. 2026, 08:30" }, { status: "ACCEPTED", dateTime: "9 พ.ย. 2026, 09:00" }, { status: "CANCELLED", dateTime: "9 พ.ย. 2026, 12:00" }] },
];

export function getAdminCase(caseId: string) { return adminCases.find((caseItem) => caseItem.id === caseId); }
