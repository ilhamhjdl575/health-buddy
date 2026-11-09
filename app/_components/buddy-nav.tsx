"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";
import { NotificationBell } from "@/app/_components/notification-bell";
import type { NotificationItem } from "@/lib/notifications/actions";
import { signOut } from "@/lib/auth/sign-out";

interface BuddyNavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon: (props: { className?: string }) => React.ReactNode;
}

const buddyNavItems: BuddyNavItem[] = [
  {
    href: "/buddy",
    label: "หน้าหลัก",
    exact: true,
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/buddy/open-jobs",
    label: "งานที่เปิดรับ",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  {
    href: "/buddy/my-jobs",
    label: "งานของฉัน",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="m9 14 2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/buddy/today",
    label: "งานวันนี้",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 14 14" />
      </svg>
    ),
  },
  {
    href: "/buddy/history",
    label: "ประวัติงาน",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
  },
  {
    href: "/buddy/follow-up",
    label: "ติดตามผล",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/buddy/profile",
    label: "ข้อมูลส่วนตัว",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function BuddyNav({profileId,notifications}:{profileId?:string;notifications?:NotificationItem[]}) {
  const pathname = usePathname();

  const isItemActive = (item: BuddyNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const isAvailabilityActive =
    pathname === "/buddy/availability" || pathname.startsWith("/buddy/availability/");

  return (
    <header className="border-b border-blue-100 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Header */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <HealthBuddyLogo className="size-10 rounded-2xl" />
          <div>
            <Link
              href="/buddy"
              className="text-lg font-bold tracking-tight text-blue-950 hover:text-blue-800 transition-colors block sm:text-xl"
            >
              Health Buddy
            </Link>
            <span className="inline-block rounded-md bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-800 border border-blue-200">
              สำหรับผู้ดูแล (Buddy)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {profileId ? <NotificationBell profileId={profileId} initial={notifications ?? []} /> : null}
          <form action={signOut}>
            <button
              type="submit"
              className="flex min-h-11 items-center justify-center rounded-xl border border-blue-300 bg-blue-50/80 px-3.5 py-2 text-sm font-bold text-blue-900 transition hover:bg-blue-100 active:scale-[0.98]"
            >
              ออกจากระบบ
            </button>
          </form>
        </div>
      </div>

      {/* Select Tab Bar for Buddy Navigation */}
      <nav
        aria-label="เมนูผู้ดูแล"
        className="border-t border-blue-100/80 bg-blue-50/50 px-3 py-1.5 sm:px-6"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4">
          {/* Scrollable Tab Bar */}
          <div
            role="tablist"
            className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none min-w-0 flex-1"
          >
            {buddyNavItems.map((item) => {
              const active = isItemActive(item);
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  role="tab"
                  aria-selected={active}
                  className={`group flex min-h-11 shrink-0 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98] ${
                    active
                      ? "bg-blue-700 text-white shadow-xs ring-1 ring-blue-600"
                      : "border border-blue-200/80 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-100/60 hover:text-blue-950"
                  }`}
                >
                  <Icon
                    className={`size-4.5 shrink-0 transition-colors ${
                      active ? "text-white" : "text-blue-700 group-hover:text-blue-900"
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* มุมบน บน Select Tab: สถานะความพร้อม (แท็บเดี่ยว ไม่ซ้ำซ้อน) */}
          <div className="flex shrink-0 items-center border-l border-blue-200/90 pl-2 sm:pl-3">
            <Link
              href="/buddy/availability"
              role="tab"
              aria-selected={isAvailabilityActive}
              className={`group flex min-h-11 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98] ${
                isAvailabilityActive
                  ? "bg-blue-700 text-white shadow-xs ring-1 ring-blue-600"
                  : "border border-blue-200/90 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-100/60 hover:text-blue-950"
              }`}
            >
              <span className="relative flex size-2.5 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2.5 rounded-full bg-emerald-600" />
              </span>
              <span className="whitespace-nowrap">สถานะความพร้อม</span>
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
