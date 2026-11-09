import Link from "next/link";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";

export function SplashScreen() {
  return (
    <div className="relative flex min-h-screen flex-col justify-between bg-linear-to-b from-teal-50 via-white to-teal-100/70 px-4 py-8 sm:px-6 sm:py-12">
      {/* Top Bar / Small Branding */}
      <header className="mx-auto w-full max-w-md text-center">
        <p className="text-base font-bold tracking-wide text-teal-800">
          ระบบช่วยเหลือและบริการสุขภาพชุมชน
        </p>
      </header>

      {/* Main Hero & Welcome */}
      <main className="mx-auto flex w-full max-w-md flex-col items-center text-center">
        {/* Large Logo */}
        <div className="mb-6">
          <HealthBuddyLogo className="size-28 sm:size-36" />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-extrabold tracking-tight text-teal-950 sm:text-5xl">
          Health Buddy
        </h1>

        {/* Essential Tagline Required by Specification */}
        <p className="mt-4 text-2xl font-bold leading-snug text-teal-900 sm:text-3xl">
          “คนใกล้บ้าน เชื่อมทุกการดูแลอย่างเท่าเทียม”
        </p>

        {/* Subtitle explaining the system clearly for elders and families */}
        <p className="mt-4 text-lg leading-relaxed text-slate-700 sm:text-xl">
          แอปพลิเคชันเพื่อการดูแลสุขภาพผู้สูงอายุในชุมชน
          เชื่อมต่อคุณกับผู้ดูแลใกล้บ้านอย่างอบอุ่นและปลอดภัย
        </p>

        {/* Key Community Highlights */}
        <div className="mt-8 grid w-full gap-3 text-left">
          <div className="flex items-center gap-3.5 rounded-2xl border border-teal-200/80 bg-white/90 p-4 shadow-xs">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800" aria-hidden="true">
              <svg className="size-6 fill-current" viewBox="0 0 24 24">
                <path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/>
              </svg>
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">ผู้ดูแลคนคุ้นเคย</p>
              <p className="text-base text-slate-600">พาไปพบแพทย์ และดูแลผู้ป่วยติดเตียงโดยผู้ผ่านการอบรม</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5 rounded-2xl border border-teal-200/80 bg-white/90 p-4 shadow-xs">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-teal-100 text-teal-800" aria-hidden="true">
              <svg className="size-6 fill-current" viewBox="0 0 24 24">
                <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
              </svg>
            </span>
            <div>
              <p className="text-lg font-bold text-slate-900">เข้าถึงง่าย ปลอดภัย</p>
              <p className="text-base text-slate-600">เข้าใช้งานสะดวกด้วยเบอร์โทรศัพท์หรือ Google เหมาะสำหรับทุกวัย</p>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Actions */}
      <footer className="mx-auto mt-8 w-full max-w-md">
        <Link
          href="/login"
          className="flex min-h-16 w-full items-center justify-center rounded-2xl bg-teal-700 px-6 text-2xl font-bold text-white shadow-lg shadow-teal-900/20 transition hover:bg-teal-800 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-teal-800 active:scale-[0.99]"
        >
          เริ่มใช้งาน
        </Link>
      </footer>
    </div>
  );
}

