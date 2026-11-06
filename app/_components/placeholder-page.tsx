type PlaceholderPageProps = {
  title: string;
  description: string;
  tone?: "user" | "buddy" | "admin";
};

const toneStyles = {
  user: "border-teal-200 bg-teal-50 text-teal-950",
  buddy: "border-blue-200 bg-blue-50 text-blue-950",
  admin: "border-slate-200 bg-white text-slate-900",
};

export function PlaceholderPage({
  title,
  description,
  tone = "user",
}: PlaceholderPageProps) {
  return (
    <section className={`rounded-3xl border p-6 shadow-sm sm:p-10 ${toneStyles[tone]}`}>
      <p className="text-sm font-bold tracking-wide">Health Buddy</p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
      <p className="mt-4 max-w-2xl text-lg leading-8">{description}</p>
      <div className="mt-8 rounded-2xl border border-current/10 bg-white/70 p-5 text-base">
        {tone === "buddy"
          ? "หน้านี้เป็นส่วนแสดงผลตัวอย่างสำหรับ อสม. บนระบบ Health Buddy กำลังอยู่ระหว่างการพัฒนาระบบข้อมูล"
          : "หน้านี้เป็นโครงสร้างเริ่มต้นสำหรับ Health Buddy ยังไม่มีการเชื่อมต่อข้อมูลหรือการดำเนินการจริง"}
      </div>
    </section>
  );
}
