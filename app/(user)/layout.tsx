import Link from "next/link";
import type { ReactNode } from "react";

const userLinks = [
  { href: "/user", label: "หน้าหลัก" },
  { href: "/booking", label: "ขอความช่วยเหลือ" },
  { href: "/my-bookings", label: "การจองของฉัน" },
  { href: "/mobility", label: "การเคลื่อนไหว" },
  { href: "/follow-up", label: "ติดตามผล" },
];

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-teal-50 text-slate-900">
      <header className="border-b border-teal-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link className="text-xl font-bold text-teal-800" href="/user">Health Buddy</Link>
          <div className="flex items-center gap-3">
            <Link className="rounded-xl border border-teal-300 bg-teal-50 px-3.5 py-2.5 text-sm font-bold text-teal-900 hover:bg-teal-100" href="/login">สลับบทบาท</Link>
            <Link className="rounded-xl bg-red-600 px-4 py-3 text-base font-bold text-white" href="/emergency">ฉุกเฉิน</Link>
          </div>
        </div>
      </header>
      <nav aria-label="เมนูผู้รับบริการ" className="border-b border-teal-100 bg-white">
        <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 py-3 sm:px-6">
          {userLinks.map((link) => <Link className="shrink-0 rounded-xl px-4 py-3 text-base font-semibold hover:bg-teal-100" href={link.href} key={link.href}>{link.label}</Link>)}
        </div>
      </nav>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
