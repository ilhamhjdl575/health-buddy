"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";
import { NotificationBell } from "@/app/_components/notification-bell";
import type { NotificationItem } from "@/lib/notifications/actions";
import { signOut } from "@/lib/auth/sign-out";

interface UserNavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon: (props: { className?: string }) => React.ReactNode;
}

const userNavItems: UserNavItem[] = [
  {
    href: "/user",
    label: "หน้าหลัก",
    exact: true,
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: "/booking",
    label: "รับบริการ",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
      </svg>
    ),
  },
  {
    href: "/my-bookings",
    label: "การจองของฉัน",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    href: "/mobility",
    label: "การเคลื่อนไหว",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="5" r="2" />
        <path d="m9 20 3-6 3 6" />
        <path d="m6 8 6 2 6-2" />
        <path d="M12 10v4" />
      </svg>
    ),
  },
  {
    href: "/profile",
    label: "ข้อมูลส่วนตัว",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
];

export function UserNav({profileId,notifications}:{profileId?:string;notifications?:NotificationItem[]}) {
  const pathname = usePathname();

  const isItemActive = (item: UserNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <header className="border-b-2 border-teal-200/80 bg-white sticky top-0 z-30 shadow-xs">
      {/* Top Header Bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3.5 sm:px-6">
        <Link
          href="/user"
          className="flex items-center gap-3 rounded-2xl focus-visible:outline-3 focus-visible:outline-teal-700 p-1"
          aria-label="Health Buddy หน้าหลักสำหรับผู้สูงอายุ"
        >
          <HealthBuddyLogo className="size-12 rounded-2xl" />
          <div className="text-left">
            <span className="text-xl font-black tracking-tight text-teal-900 sm:text-2xl block leading-none">
              Health Buddy
            </span>
            <span className="text-xs font-bold text-teal-700 sm:text-sm">
              เพื่อนสุขภาพผู้สูงอายุ
            </span>
          </div>
        </Link>

        {/* Action Buttons: Sign out & Big Emergency Button */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {profileId ? <NotificationBell profileId={profileId} initial={notifications ?? []} /> : null}
          <form action={signOut}>
            <button
              className="flex min-h-12 items-center justify-center rounded-2xl border-2 border-teal-300 bg-teal-50/80 px-3.5 py-2 text-sm font-extrabold text-teal-950 transition hover:bg-teal-100 hover:border-teal-400 focus-visible:outline-3 focus-visible:outline-teal-700 active:scale-[0.98]"
              type="submit"
            >
              ออกจากระบบ
            </button>
          </form>

          <Link
            className="flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-2.5 text-base font-black text-white shadow-md shadow-red-700/20 transition hover:bg-red-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:scale-[0.98] sm:px-5 sm:text-lg"
            href="/emergency"
            aria-label="โทรฉุกเฉิน 1669"
          >
            <svg
              className="size-5 shrink-0 sm:size-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            <span>ฉุกเฉิน</span>
          </Link>
        </div>
      </div>

      {/* Select Tab Bar Designed Specially for Elderly Users */}
      <nav
        aria-label="เมนูหลักสำหรับผู้สูงอายุ"
        className="border-t border-teal-100 bg-teal-50/60 px-2 py-2.5 sm:px-6"
      >
        <div
          role="tablist"
          className="mx-auto flex max-w-6xl gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
        >
          {userNavItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                role="tab"
                aria-selected={active}
                className={`group flex min-h-14 shrink-0 items-center gap-2.5 rounded-2xl px-4 py-2.5 text-base font-extrabold transition-all duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-800 active:scale-[0.98] sm:px-5 sm:text-lg ${
                  active
                    ? "bg-teal-800 text-white shadow-md shadow-teal-950/20 ring-2 ring-teal-700"
                    : "border-2 border-teal-200/90 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-100/70 hover:text-teal-950"
                }`}
              >
                <Icon
                  className={`size-6 shrink-0 transition-colors ${
                    active ? "text-white" : "text-teal-700 group-hover:text-teal-900"
                  }`}
                />
                <span className="whitespace-nowrap tracking-wide">{item.label}</span>
                {active && (
                  <span
                    className="size-2 rounded-full bg-teal-200 ring-2 ring-white/50"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

