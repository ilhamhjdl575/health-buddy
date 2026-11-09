"use client";

import { useState, useEffect } from "react";
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

export function UserNav({
  profileId,
  notifications,
}: {
  profileId?: string;
  notifications?: NotificationItem[];
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Close mobile drawer when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Close mobile drawer on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMobileMenuOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const isItemActive = (item: UserNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <header className="sticky top-0 z-30 border-b-2 border-teal-200/80 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Header Bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3.5">
        {/* Brand / Logo */}
        <Link
          href="/user"
          className="flex items-center gap-2.5 sm:gap-3 rounded-2xl p-1 focus-visible:outline-3 focus-visible:outline-teal-700 min-w-0"
          aria-label="Health Buddy หน้าหลักสำหรับผู้สูงอายุ"
        >
          <HealthBuddyLogo className="size-10 sm:size-12 rounded-xl sm:rounded-2xl shrink-0" />
          <div className="text-left min-w-0">
            <span className="text-lg font-black tracking-tight text-teal-900 sm:text-2xl block leading-tight truncate">
              Health Buddy
            </span>
            <span className="text-[11px] font-bold text-teal-700 sm:text-sm block truncate">
              เพื่อนสุขภาพผู้สูงอายุ
            </span>
          </div>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 md:gap-3 shrink-0">
          {profileId ? (
            <NotificationBell profileId={profileId} initial={notifications ?? []} />
          ) : null}

          {/* Emergency Button - Top Priority & Visible Always */}
          <Link
            className="flex min-h-10 sm:min-h-12 items-center justify-center gap-1 sm:gap-2 rounded-xl sm:rounded-2xl bg-red-600 px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2.5 text-xs sm:text-base md:text-lg font-black text-white shadow-md shadow-red-700/20 transition hover:bg-red-700 focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-red-600 active:scale-[0.98] shrink-0"
            href="/emergency"
            aria-label="โทรฉุกเฉิน 1669"
          >
            <svg
              className="size-4 shrink-0 sm:size-5 md:size-6"
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

          {/* Sign Out Button */}
          <form action={signOut} className="shrink-0">
            <button
              className="flex min-h-10 sm:min-h-12 items-center justify-center gap-1.5 rounded-xl sm:rounded-2xl border-2 border-teal-300 bg-teal-50/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-extrabold text-teal-950 transition hover:bg-teal-100 hover:border-teal-400 focus-visible:outline-3 focus-visible:outline-teal-700 active:scale-[0.98]"
              type="submit"
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
            >
              <svg
                className="size-4 shrink-0 sm:hidden"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </button>
          </form>

          {/* Mobile/Tablet Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex min-h-10 sm:min-h-12 items-center justify-center gap-1 rounded-xl sm:rounded-2xl border-2 border-teal-300 bg-white px-2.5 sm:px-3 text-teal-950 transition hover:bg-teal-50 focus-visible:outline-3 focus-visible:outline-teal-700 active:scale-[0.98] md:hidden shrink-0"
            aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนูหลัก"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className="size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            ) : (
              <svg
                className="size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
            <span className="text-xs sm:text-sm font-black hidden min-[360px]:inline">
              {mobileMenuOpen ? "ปิด" : "เมนู"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile/Tablet Drawer Menu (Elderly-Friendly Large Cards) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t-2 border-teal-200/80 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="mx-auto max-w-6xl px-4 py-4 space-y-2.5">
            <p className="px-1 text-xs font-black uppercase tracking-wider text-teal-800">
              เมนูสำหรับผู้สูงอายุ
            </p>
            <div className="grid gap-2">
              {userNavItems.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-14 items-center justify-between rounded-2xl px-4 py-3 text-base font-extrabold transition-all active:scale-[0.99] ${
                      active
                        ? "bg-teal-800 text-white shadow-md shadow-teal-950/20 ring-2 ring-teal-700"
                        : "border-2 border-teal-200/80 bg-teal-50/40 text-slate-800 hover:bg-teal-100/70"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`size-6 shrink-0 ${
                          active ? "text-white" : "text-teal-700"
                        }`}
                      />
                      <span className="text-lg">{item.label}</span>
                    </div>
                    {active ? (
                      <span className="flex items-center gap-1.5 rounded-full bg-teal-900/60 px-2.5 py-1 text-xs text-teal-200">
                        <span className="size-2 rounded-full bg-teal-300" />
                        กำลังเปิด
                      </span>
                    ) : (
                      <svg
                        className="size-5 text-slate-400"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Emergency Quick Action in Menu */}
            <div className="pt-2">
              <Link
                href="/emergency"
                onClick={() => setMobileMenuOpen(false)}
                className="flex min-h-13 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 py-3 text-base font-black text-white shadow-md hover:bg-red-700 active:scale-[0.99]"
              >
                <svg
                  className="size-5 shrink-0"
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
                <span>ขอความช่วยเหลือฉุกเฉิน (โทร 1669)</span>
              </Link>
            </div>

            {/* Sign Out Action in Menu */}
            <div className="pt-1">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex min-h-12 items-center justify-center gap-2 rounded-2xl border-2 border-slate-300 bg-slate-50 px-4 py-2.5 text-sm font-extrabold text-slate-800 hover:bg-slate-100 active:scale-[0.99]"
                >
                  <svg
                    className="size-4.5 shrink-0 text-slate-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  <span>ออกจากระบบ</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Select Tab Bar Designed Specially for Elderly Users */}
      <nav
        aria-label="เมนูหลักสำหรับผู้สูงอายุ"
        className="border-t border-teal-100 bg-teal-50/60 px-2 py-2 sm:px-6"
      >
        <div className="mx-auto max-w-6xl">
          <div
            role="tablist"
            className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none scroll-smooth touch-pan-x"
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
                  className={`group flex min-h-11 sm:min-h-13 md:min-h-14 shrink-0 items-center gap-2 sm:gap-2.5 rounded-xl sm:rounded-2xl px-3 sm:px-4 md:px-5 py-1.5 sm:py-2.5 text-sm sm:text-base md:text-lg font-extrabold transition-all duration-150 focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-teal-800 active:scale-[0.98] ${
                    active
                      ? "bg-teal-800 text-white shadow-md shadow-teal-950/20 ring-2 ring-teal-700"
                      : "border-2 border-teal-200/90 bg-white text-slate-800 hover:border-teal-400 hover:bg-teal-100/70 hover:text-teal-950"
                  }`}
                >
                  <Icon
                    className={`size-5 sm:size-6 shrink-0 transition-colors ${
                      active ? "text-white" : "text-teal-700 group-hover:text-teal-900"
                    }`}
                  />
                  <span className="whitespace-nowrap tracking-wide">{item.label}</span>
                  {active && (
                    <span
                      className="size-1.5 sm:size-2 rounded-full bg-teal-200 ring-2 ring-white/50"
                      aria-hidden="true"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </nav>
    </header>
  );
}
