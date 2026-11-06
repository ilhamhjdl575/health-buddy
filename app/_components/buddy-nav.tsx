"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";

interface BuddyNavItem {
  href: string;
  label: string;
  exact?: boolean;
  badge?: number;
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
    badge: 3,
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
    badge: 2,
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
    href: "/buddy/availability",
    label: "เวลาพร้อมรับงาน",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
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
];

export function BuddyNav() {
  const pathname = usePathname();

  const isItemActive = (item: BuddyNavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

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
              สำหรับ อสม. (อาสาสมัครชุมชน)
            </span>
          </div>
        </div>

        <Link
          className="flex min-h-11 items-center justify-center rounded-xl border border-blue-300 bg-blue-50/80 px-3.5 py-2 text-sm font-bold text-blue-900 transition hover:bg-blue-100 active:scale-[0.98]"
          href="/login"
        >
          ← สลับบทบาท
        </Link>
      </div>

      {/* Select Tab Bar for Buddy Navigation */}
      <nav
        aria-label="เมนู อสม."
        className="border-t border-blue-100/80 bg-blue-50/50 px-3 py-2 sm:px-6"
      >
        <div
          role="tablist"
          className="mx-auto flex max-w-6xl gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none"
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
                {item.badge !== undefined && (
                  <span
                    className={`inline-flex items-center justify-center rounded-full px-1.5 py-0.2 text-xs font-black ${
                      active
                        ? "bg-blue-900 text-blue-100 border border-blue-500"
                        : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </nav>
    </header>
  );
}

