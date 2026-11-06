import Link from "next/link";
import { HomeIcon } from "@/app/_components/home-icon";
import { LargeMenuButton } from "@/app/_components/large-menu-button";

export default function UserHomePage() {
  return (
    <div className="mx-auto max-w-3xl pb-6">
      <section aria-labelledby="welcome-title">
        <p className="text-lg font-bold text-teal-800">Health Buddy</p>
        <h1 id="welcome-title" className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">
          สวัสดีค่ะ คุณสมชาย
        </h1>
        <p className="mt-4 text-2xl font-semibold leading-9 text-slate-800">
          ต้องการให้ช่วยอะไรคะ?
        </p>
      </section>

      <Link
        className="mt-8 flex min-h-80 flex-col items-center justify-center rounded-3xl bg-amber-400 px-6 py-9 text-center shadow-lg transition hover:bg-amber-500 focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-teal-700 sm:min-h-96 sm:py-12 active:scale-[0.99]"
        href="/booking"
      >
        <span className="mb-5 flex size-32 items-center justify-center rounded-full bg-amber-100 shadow-inner sm:size-40">
          <HomeIcon className="text-8xl text-teal-950 sm:text-9xl" name="help" />
        </span>
        <span className="text-3xl font-extrabold tracking-wide text-slate-950 sm:text-4xl">
          ขอความช่วยเหลือ
        </span>
      </Link>

      <section aria-label="เลือกประเภทความช่วยเหลือ" className="mt-8">
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <LargeMenuButton href="/booking?service=call" icon="phone" title="โทร" />
          <LargeMenuButton href="/booking?service=appointment" icon="calendar" title="นัดหมาย" />
          <LargeMenuButton href="/booking?service=travel" icon="travel" title="เดินทาง" />
        </div>
      </section>

      <section aria-labelledby="emergency-title" className="mt-10 rounded-2xl border border-red-200 bg-red-50 p-5 sm:flex sm:items-center sm:justify-between sm:gap-6">
        <div>
          <h2 id="emergency-title" className="text-xl font-bold text-red-900">กรณีฉุกเฉิน</h2>
          <p className="mt-1 text-base leading-6 text-red-900">หากมีเหตุฉุกเฉินทางการแพทย์ อย่ารอ อสม. รับงาน</p>
        </div>
        <Link className="mt-4 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-red-700 bg-white px-5 py-3 text-lg font-bold text-red-800 hover:bg-red-100 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-red-700 sm:mt-0" href="/emergency"><HomeIcon name="phone" />ดูวิธีขอความช่วยเหลือฉุกเฉิน</Link>
      </section>
    </div>
  );
}

