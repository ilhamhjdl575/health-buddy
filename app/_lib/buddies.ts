import type { QualificationType, ServiceType } from "@/app/_lib/services";

export type AvailableBuddy = {
  id: string;
  name: string;
  roleLabel: string;
  serviceArea: string;
  qualifications: QualificationType[];
  experience: string;
  ratingText: string;
  completedJobsCount: number;
};

export const AVAILABLE_BUDDIES: AvailableBuddy[] = [
  {
    id: "buddy-1",
    name: "คุณอาหมัด สุขใจ",
    roleLabel: "อสม. ประจำเขตเทศบาลเมืองยะลา",
    serviceArea: "เขตเทศบาลเมืองยะลา, ต.สะเตง",
    qualifications: ["BEDRIDDEN_CARE_TRAINING"],
    experience: "มีประสบการณ์ดูแลผู้สูงอายุและผู้ป่วยติดเตียง 5 ปี",
    ratingText: "4.9 คะแนน",
    completedJobsCount: 42,
  },
  {
    id: "buddy-2",
    name: "คุณฟาติมะห์ แวสะมะแอ",
    roleLabel: "ผู้ดูแลจิตอาสาชุมชน",
    serviceArea: "เขตเทศบาลเมืองยะลา, ต.บุดี",
    qualifications: ["BEDRIDDEN_CARE_TRAINING"],
    experience: "ผ่านการอบรมหลักสูตรดูแลผู้ป่วยติดเตียงของกระทรวงสาธารณสุข",
    ratingText: "5.0 คะแนน",
    completedJobsCount: 38,
  },
  {
    id: "buddy-3",
    name: "คุณวีระ ยะลาจิตอาสา",
    roleLabel: "ผู้ดูแลจิตอาสาช่วยเดินทาง",
    serviceArea: "เขตเมืองยะลา, ต.ท่าสาป",
    qualifications: [],
    experience: "ชำนาญเส้นทางโรงพยาบาลศูนย์ยะลาและคลินิกชุมชน",
    ratingText: "4.8 คะแนน",
    completedJobsCount: 29,
  },
  {
    id: "buddy-4",
    name: "คุณมาลินี ใจดี",
    roleLabel: "อสม. ชุมชนตลาดเก่า",
    serviceArea: "ต.สะเตงนอก, เขตเทศบาลเมืองยะลา",
    qualifications: [],
    experience: "ช่วยเหลือผู้สูงอายุพาไปพบแพทย์เป็นประจำ 3 ปี",
    ratingText: "4.9 คะแนน",
    completedJobsCount: 35,
  },
];

/**
 * Filters available Buddies by service requirements.
 * RULE: BEDRIDDEN_CARE strictly requires BEDRIDDEN_CARE_TRAINING.
 */
export function getAvailableBuddiesForService(serviceType: ServiceType): AvailableBuddy[] {
  if (serviceType === "BEDRIDDEN_CARE") {
    return AVAILABLE_BUDDIES.filter((buddy) =>
      buddy.qualifications.includes("BEDRIDDEN_CARE_TRAINING"),
    );
  }
  return AVAILABLE_BUDDIES;
}

export function getBuddyById(id: string): AvailableBuddy | undefined {
  return AVAILABLE_BUDDIES.find((b) => b.id === id);
}
