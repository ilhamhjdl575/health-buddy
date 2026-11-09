import type { SVGProps } from "react";

/**
 * 1. ไอคอนรถเข็น (Wheelchair)
 * สัญลักษณ์สากลเข้าใจง่ายสำหรับผู้สูงอายุและผู้ดูแล
 */
export function WheelchairIcon({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", width: "1em", height: "1em", verticalAlign: "-0.125em", ...style }}
      {...props}
    >
      {/* ศีรษะ */}
      <circle cx="10" cy="4" r="2.2" />
      {/* ล้อรถเข็นขนาดใหญ่ */}
      <path d="M5 19.5a5.5 5.5 0 1 0 7.4-8" />
      <circle cx="10" cy="15" r="1" fill="currentColor" />
      {/* ลำตัวและแขนจับล้อ */}
      <path d="M10 9h4l2.5 5.5H20" />
      <path d="M14 14.5l-3.5-5.5" />
      <path d="M6.8 13l3.2-4" />
      {/* ที่วางเท้า */}
      <path d="M16.5 14.5l1.5 3h-2.5" />
    </svg>
  );
}

/**
 * 2. ไอคอนไม้เท้าช่วยเดิน (Walking Cane / Elder with Cane)
 * สัญลักษณ์ผู้สูงอายุเดินพร้อมไม้เท้าช่วยพยุง
 */
export function CaneIcon({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", width: "1em", height: "1em", verticalAlign: "-0.125em", ...style }}
      {...props}
    >
      {/* ศีรษะคนเดิน */}
      <circle cx="15.5" cy="4.5" r="2.2" />
      {/* ลำตัวโน้มไปข้างหน้าเล็กน้อยแบบผู้สูงอายุ */}
      <path d="M14.5 8c-1.5 1-2.5 2.5-2.5 5.5" />
      {/* ขาเดินก้าว */}
      <path d="M12 13.5l-2.5 7.5" />
      <path d="M12 13.5l3.5 7.5" />
      {/* แขนยื่นจับไม้เท้า */}
      <path d="M13.5 9.5l-4.5 3l-1.5 1" />
      {/* ไม้เท้าด้ามจับโค้งจรดพื้น */}
      <path d="M6 13.5a1.5 1.5 0 0 1 2.5 0v7.5" strokeWidth="2.6" />
      <path d="M7 21h3" strokeWidth="2.8" />
    </svg>
  );
}

/**
 * 3. ไอคอนเครื่องช่วยเดิน / วอล์กเกอร์ 4 ขา (Walker)
 * วอล์กเกอร์ 4 ขาพร้อมมือจับและคานเสริมความแข็งแรง
 */
export function WalkerIcon({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", width: "1em", height: "1em", verticalAlign: "-0.125em", ...style }}
      {...props}
    >
      {/* ด้ามจับด้านบนพร้อมปลอกจับ */}
      <path d="M5.5 5.5h13" strokeWidth="2.6" />
      <path d="M5.5 4.5v2" strokeWidth="2.6" />
      <path d="M18.5 4.5v2" strokeWidth="2.6" />
      {/* ขาหน้าและหลัง 4 ขาเอียงกระจายน้ำหนัก */}
      <path d="M7 5.5l-2.2 14.5" />
      <path d="M17 5.5l2.2 14.5" />
      {/* คานขวางเสริมความแข็งแรง */}
      <path d="M5.5 13h13" strokeWidth="2" />
      {/* เสาค้ำแนวตั้ง */}
      <path d="M10 5.5v7.5" />
      <path d="M14 5.5v7.5" />
      {/* ยางรองขาด้านล่าง */}
      <path d="M3.8 20.2h2" strokeWidth="3" />
      <path d="M18.2 20.2h2" strokeWidth="3" />
    </svg>
  );
}

/**
 * 4. ไอคอนคนช่วยพยุงเดิน (Walking Assistant)
 * ผู้ดูแล ช่วยประคองแขนเดินเคียงข้างผู้สูงอายุ
 */
export function WalkingAssistantIcon({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", width: "1em", height: "1em", verticalAlign: "-0.125em", ...style }}
      {...props}
    >
      {/* ผู้ดูแล (ซ้าย) */}
      <circle cx="7" cy="4" r="2" />
      <path d="M4.5 21v-6l2.5-3.5L9.5 14v7" />
      {/* ผู้สูงอายุ (ขวา) */}
      <circle cx="17" cy="5" r="1.9" />
      <path d="M14.5 21v-5.5l2.5-3L19.5 14.5V21" />
      {/* แขนช่วยประคอง คล้องแขนเดินด้วยกัน */}
      <path d="M7 11.5c2.5 1.5 5 1.5 7.5-0.5" strokeWidth="2.8" />
      <path d="M10.5 13.5l2 2" strokeWidth="2.5" />
    </svg>
  );
}

/**
 * 5. ไอคอนขึ้น-ลงบันไดไม่สะดวก / เลี่ยงบันได (Avoid Stairs)
 * บันได 4 ขั้นพร้อมเครื่องหมายเตือนความไม่สะดวก
 */
export function AvoidStairsIcon({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", width: "1em", height: "1em", verticalAlign: "-0.125em", ...style }}
      {...props}
    >
      {/* ขั้นบันได 4 ขั้น */}
      <path d="M3 20h4.5v-4h4.5v-4h4.5V8H21" />
      <path d="M3 20v1.5h18" />
      {/* เครื่องหมายเตือนเลี่ยงบันได */}
      <circle cx="17.5" cy="4.5" r="3.2" className="stroke-amber-600 fill-amber-100" strokeWidth="1.8" />
      <path d="M17.5 3v2" className="stroke-amber-800" strokeWidth="2" />
      <circle cx="17.5" cy="6.2" r="0.6" className="fill-amber-800" />
    </svg>
  );
}

/** ไอคอนผู้ป่วยติดเตียง */
export function BedriddenIcon({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", width: "1em", height: "1em", verticalAlign: "-0.125em", ...style }}
      {...props}
    >
      <path d="M3 5v15" />
      <path d="M3 16h18v4" />
      <path d="M6 12h12a3 3 0 0 1 3 3v1H6z" />
      <circle cx="8" cy="9" r="2.5" />
      <path d="M10.5 10.5 15 12" />
    </svg>
  );
}

/**
 * 6. ไอคอนหัวข้อหน้าการเคลื่อนไหว (Mobility Header Banner)
 */
export function MobilityHeaderIcon({ className, style, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ display: "inline-block", width: "1em", height: "1em", verticalAlign: "-0.125em", ...style }}
      {...props}
    >
      <circle cx="12" cy="4" r="2.2" />
      <path d="M10 8.5l2 3.5l3-2" />
      <path d="M12 12v4.5l3.5 5.5" />
      <path d="M12 16.5l-3.5 5.5" />
      <path d="M9 13.5l-3-1" />
    </svg>
  );
}

