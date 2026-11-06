export type AcceptedJobDetails = {
  recipientName: string;
  age: number;
  phone: string;
  pickup: string;
  destination: string;
  mobilityRequirement: string;
  emergencyContactName: string;
  emergencyContactRelation: string;
  emergencyContactPhone: string;
};

const acceptedJobDetails: Record<string, AcceptedJobDetails> = {
  "HB-001": {
    recipientName: "คุณสมชาย ใจดี",
    age: 72,
    phone: "081-111-1111",
    pickup: "25 ถนนตัวอย่าง เขตเทศบาลเมืองยะลา",
    destination: "โรงพยาบาลยะลา",
    mobilityRequirement: "ใช้ไม้เท้า",
    emergencyContactName: "คุณสมหญิง",
    emergencyContactRelation: "บุตรสาว",
    emergencyContactPhone: "081-999-9999",
  },
  "HB-002": {
    recipientName: "คุณมาลี พูนสุข",
    age: 68,
    phone: "082-222-2222",
    pickup: "12 ซอยตัวอย่าง ตำบลสะเตง อำเภอเมืองยะลา",
    destination: "คลินิกชุมชนสะเตง",
    mobilityRequirement: "ใช้รถเข็น",
    emergencyContactName: "คุณวิชัย",
    emergencyContactRelation: "บุตรชาย",
    emergencyContactPhone: "082-999-9999",
  },
  "HB-003": {
    recipientName: "คุณอารีย์ แสงทอง",
    age: 75,
    phone: "083-333-3333",
    pickup: "48 ถนนชุมชน เขตเมืองยะลา",
    destination: "ศูนย์บริการสาธารณสุขเมืองยะลา",
    mobilityRequirement: "ต้องมีผู้ช่วยเดิน",
    emergencyContactName: "คุณนพ",
    emergencyContactRelation: "หลานชาย",
    emergencyContactPhone: "083-999-9999",
  },
  "HB-004": {
    recipientName: "คุณอับดุลเลาะ มะดี",
    age: 70,
    phone: "084-444-4444",
    pickup: "7 ถนนประชาสงเคราะห์ ตำบลสะเตง อำเภอเมืองยะลา",
    destination: "ที่ว่าการอำเภอเมืองยะลา",
    mobilityRequirement: "ไม่สะดวกใช้บันได",
    emergencyContactName: "คุณฟาตีมะห์",
    emergencyContactRelation: "ภรรยา",
    emergencyContactPhone: "084-999-9999",
  },
};

export function getAcceptedJobDetails(jobId: string) {
  return acceptedJobDetails[jobId];
}
