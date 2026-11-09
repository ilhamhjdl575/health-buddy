"use client";

import { useState, useEffect } from "react";
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

export function BuddyNav({
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

  const isItemActive = (item: BuddyNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  const isAvailabilityActive =
    pathname === "/buddy/availability" || pathname.startsWith("/buddy/availability/");

  return (
    <header className="sticky top-0 z-30 border-b border-blue-100 bg-white/95 backdrop-blur-md shadow-xs">
      {/* Top Header Bar */}
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 px-3 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        {/* Brand & Badge */}
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 min-w-0">
          <HealthBuddyLogo className="size-9 sm:size-10 rounded-xl sm:rounded-2xl shrink-0" />
          <div className="min-w-0">
            <Link
              href="/buddy"
              className="text-base font-bold tracking-tight text-blue-950 hover:text-blue-800 transition-colors block sm:text-xl leading-tight truncate"
            >
              Health Buddy
            </Link>
            <span className="inline-block rounded-md bg-blue-100 px-1.5 sm:px-2 py-0.5 text-[10px] sm:text-xs font-bold text-blue-800 border border-blue-200">
              <span className="hidden sm:inline">สำหรับ</span>ผู้ดูแลชุมชน
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Tablet Quick Availability Pill */}
          <Link
            href="/buddy/availability"
            className="hidden sm:inline-flex lg:hidden items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50/80 px-2.5 py-1.5 text-xs font-bold text-blue-900 hover:bg-blue-100 active:scale-[0.98]"
            title="สถานะความพร้อม"
          >
            <span className="relative flex size-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
            </span>
            <span>ความพร้อม</span>
          </Link>

          {profileId ? (
            <NotificationBell profileId={profileId} initial={notifications ?? []} />
          ) : null}

          {/* Sign Out Button */}
          <form action={signOut} className="shrink-0">
            <button
              type="submit"
              title="ออกจากระบบ"
              aria-label="ออกจากระบบ"
              className="flex min-h-10 sm:min-h-11 items-center justify-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50/80 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold text-blue-900 transition hover:bg-blue-100 active:scale-[0.98]"
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

          {/* Mobile & Tablet Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex min-h-10 sm:min-h-11 items-center justify-center gap-1 rounded-xl border border-blue-300 bg-white px-2.5 sm:px-3 text-blue-950 transition hover:bg-blue-50 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98] lg:hidden shrink-0"
            aria-label={mobileMenuOpen ? "ปิดเมนู" : "เปิดเมนูผู้ดูแล"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <svg
                className="size-5 shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
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
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </svg>
            )}
            <span className="text-xs sm:text-sm font-bold hidden min-[360px]:inline">
              {mobileMenuOpen ? "ปิด" : "เมนู"}
            </span>
          </button>
        </div>
      </div>

      {/* Mobile & Tablet Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-blue-100 bg-white shadow-xl animate-in slide-in-from-top-2 duration-150">
          <div className="mx-auto max-w-6xl px-4 py-4 space-y-3">
            {/* Featured Availability Card */}
            <Link
              href="/buddy/availability"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center justify-between rounded-2xl border p-3.5 transition active:scale-[0.99] ${
                isAvailabilityActive
                  ? "border-blue-500 bg-blue-50 text-blue-950 ring-1 ring-blue-500"
                  : "border-blue-200 bg-gradient-to-r from-blue-50/60 to-emerald-50/60 hover:bg-blue-50 text-slate-900"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="relative flex size-3 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex size-3 rounded-full bg-emerald-600" />
                </span>
                <div>
                  <p className="font-bold text-sm text-slate-900">สถานะความพร้อมรับงาน</p>
                  <p className="text-xs text-slate-600">กดเพื่อเปิด/ปิด หรือตั้งเวลาพร้อมรับงาน</p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-white border border-blue-200 rounded-lg px-2.5 py-1">
                จัดการ
              </span>
            </Link>

            <p className="px-1 text-xs font-bold uppercase tracking-wider text-blue-800">
              เมนูงานและบริการ
            </p>

            {/* Grid of Work Items */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {buddyNavItems.map((item) => {
                const active = isItemActive(item);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex min-h-12 items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-bold transition active:scale-[0.99] ${
                      active
                        ? "bg-blue-700 text-white shadow-xs"
                        : "border border-blue-200/80 bg-blue-50/40 text-slate-800 hover:bg-blue-100/60"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon
                        className={`size-5 shrink-0 ${
                          active ? "text-white" : "text-blue-700"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>
                    {active && (
                      <span className="size-2 rounded-full bg-white ring-2 ring-blue-300" />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Sign Out Action in Drawer */}
            <div className="pt-2">
              <form action={signOut}>
                <button
                  type="submit"
                  className="w-full flex min-h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-bold text-slate-800 hover:bg-slate-100 active:scale-[0.99]"
                >
                  <svg
                    className="size-4 shrink-0 text-slate-600"
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

      {/* Select Tab Bar */}
      <nav
        aria-label="เมนูผู้ดูแล"
        className="border-t border-blue-100/80 bg-blue-50/50 px-2 py-1.5 sm:px-6"
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-2 sm:gap-4">
          {/* Scrollable Tab Bar */}
          <div
            role="tablist"
            className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none min-w-0 flex-1 scroll-smooth touch-pan-x"
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
                  className={`group flex min-h-10 sm:min-h-11 shrink-0 items-center gap-1.5 sm:gap-2 rounded-xl px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98] ${
                    active
                      ? "bg-blue-700 text-white shadow-xs ring-1 ring-blue-600"
                      : "border border-blue-200/80 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-100/60 hover:text-blue-950"
                  }`}
                >
                  <Icon
                    className={`size-4 sm:size-4.5 shrink-0 transition-colors ${
                      active ? "text-white" : "text-blue-700 group-hover:text-blue-900"
                    }`}
                  />
                  <span className="whitespace-nowrap">{item.label}</span>
                </Link>
              );
            })}

            {/* Mobile-only inline Availability Pill so mobile users can swipe to it without freezing half the screen */}
            <Link
              href="/buddy/availability"
              role="tab"
              aria-selected={isAvailabilityActive}
              className={`lg:hidden group flex min-h-10 shrink-0 items-center gap-1.5 rounded-xl px-2.5 py-1.5 text-xs font-bold transition-all duration-150 focus-visible:outline-2 focus-visible:outline-blue-700 active:scale-[0.98] ${
                isAvailabilityActive
                  ? "bg-blue-700 text-white shadow-xs ring-1 ring-blue-600"
                  : "border border-blue-200/80 bg-white text-slate-700 hover:border-blue-300 hover:bg-blue-100/60 hover:text-blue-950"
              }`}
            >
              <span className="relative flex size-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex size-2 rounded-full bg-emerald-600" />
              </span>
              <span className="whitespace-nowrap">ความพร้อม</span>
            </Link>
          </div>

          {/* Desktop Pinned Availability Tab (lg:flex) */}
          <div className="hidden lg:flex shrink-0 items-center border-l border-blue-200/90 pl-3">
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
