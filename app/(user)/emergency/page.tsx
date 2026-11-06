import Link from "next/link";

const emergencyAddress = "123 หมู่ 4 ตำบลตัวอย่าง อำเภอตัวอย่าง จังหวัดยะลา";

export default function EmergencyPage() {
  return (
    <div className="mx-auto max-w-3xl">
      <section aria-labelledby="emergency-title" className="rounded-3xl border-2 border-red-300 bg-red-50 p-6 shadow-sm sm:p-10">
        <p className="text-xl font-bold text-red-800">กรณีฉุกเฉิน</p>
        <h1 className="mt-3 text-3xl font-bold leading-tight text-red-950 sm:text-4xl" id="emergency-title">กรณีฉุกเฉิน อย่ารอ อสม. รับงาน</h1>
        <p className="mt-5 text-lg leading-8 text-red-950">หากผู้รับบริการมีอาการฉุกเฉิน ให้ติดต่อหน่วยแพทย์ฉุกเฉินทันที</p>
        <a className="mt-8 flex min-h-20 w-full items-center justify-center rounded-2xl bg-red-700 px-6 text-2xl font-bold text-white shadow-sm hover:bg-red-800 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-red-800" href="tel:1669">โทร 1669</a>
        <p className="mt-3 text-center text-base font-semibold text-red-900">โทรขอความช่วยเหลือทางการแพทย์ฉุกเฉิน</p>
      </section>

      <section aria-labelledby="address-title" className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950" id="address-title">ที่อยู่ผู้รับบริการ</h2>
        <p className="mt-2 text-lg text-slate-600">ใช้ที่อยู่นี้แจ้งเจ้าหน้าที่</p>
        <p className="mt-5 rounded-2xl bg-slate-100 p-5 text-xl font-bold leading-8 text-slate-900">{emergencyAddress}</p>
      </section>

      <section aria-labelledby="contact-title" className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-bold text-slate-950" id="contact-title">ผู้ติดต่อฉุกเฉิน</h2>
        <dl className="mt-5 space-y-3 text-lg text-slate-800">
          <div><dt className="font-semibold text-slate-600">ชื่อ</dt><dd className="text-xl font-bold">คุณสมหญิง</dd></div>
          <div><dt className="font-semibold text-slate-600">ความสัมพันธ์</dt><dd className="text-xl font-bold">ญาติ</dd></div>
          <div><dt className="font-semibold text-slate-600">เบอร์โทร</dt><dd className="text-xl font-bold">081-234-5678</dd></div>
        </dl>
        <a className="mt-6 flex min-h-16 w-full items-center justify-center rounded-2xl border-2 border-teal-700 bg-white px-5 text-xl font-bold text-teal-800 hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-teal-700" href="tel:0812345678">โทรหาผู้ติดต่อฉุกเฉิน</a>
      </section>

      <section aria-labelledby="coordinator-title" className="mt-6 rounded-3xl border border-teal-200 bg-teal-50 p-6">
        <h2 className="text-2xl font-bold text-teal-950" id="coordinator-title">ผู้ประสานงานในพื้นที่</h2>
        <p className="mt-3 text-lg leading-8 text-slate-800">ระบบสามารถแจ้งผู้ประสานงานหรือ อสม. ในพื้นที่เพิ่มเติมได้</p>
        <p className="mt-4 rounded-xl border border-teal-300 bg-white p-4 text-lg font-semibold text-teal-900">สถานะ: ยังไม่ได้ส่งการแจ้งเตือน</p>
      </section>

      <Link className="mt-8 inline-flex min-h-16 w-full items-center justify-center rounded-2xl border-2 border-slate-500 bg-white px-6 text-xl font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-slate-700" href="/user">กลับหน้าหลัก</Link>
    </div>
  );
}
