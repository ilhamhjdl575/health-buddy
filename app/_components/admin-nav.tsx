"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HealthBuddyLogo } from "@/app/_components/health-buddy-logo";

interface NavItem {
  href: string;
  label: string;
  exact?: boolean;
  icon: (props: { className?: string }) => React.ReactNode;
}

const navItems: NavItem[] = [
  {
    href: "/admin",
    label: "ภาพรวม",
    exact: true,
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="7" height="9" x="3" y="3" rx="1" />
        <rect width="7" height="5" x="14" y="3" rx="1" />
        <rect width="7" height="9" x="14" y="12" rx="1" />
        <rect width="7" height="5" x="3" y="16" rx="1" />
      </svg>
    ),
  },
  {
    href: "/admin/cases",
    label: "เคส",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
        <path d="M9 12h6" />
        <path d="M9 16h6" />
      </svg>
    ),
  },
  {
    href: "/admin/users",
    label: "ผู้รับบริการ",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: "/admin/buddies",
    label: "อสม.",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/admin/facilities",
    label: "หน่วยงาน",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
        <path d="M9 22v-4h6v4" />
        <path d="M8 6h.01" />
        <path d="M16 6h.01" />
        <path d="M12 6h.01" />
        <path d="M12 10h.01" />
        <path d="M12 14h.01" />
        <path d="M16 10h.01" />
        <path d="M16 14h.01" />
        <path d="M8 10h.01" />
        <path d="M8 14h.01" />
      </svg>
    ),
  },
  {
    href: "/admin/follow-up",
    label: "ติดตามผล",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    href: "/admin/analytics",
    label: "สถิติ",
    icon: ({ className }) => (
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
];

export function AdminNav() {
  const pathname = usePathname();

  const isItemActive = (item: NavItem) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname === item.href || pathname.startsWith(`${item.href}/`);
  };

  return (
    <aside className="bg-slate-950 p-4 text-white md:min-h-screen md:w-64 md:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-800/80">
      <div>
        {/* Brand Header */}
        <div className="flex items-center gap-3 px-2 py-2">
          <HealthBuddyLogo className="size-10 rounded-2xl" />
          <div>
            <Link
              href="/admin"
              className="text-lg font-bold tracking-tight text-white hover:text-teal-300 transition-colors block"
            >
              Health Buddy
            </Link>
            <span className="inline-block rounded-md bg-teal-900/60 px-2 py-0.5 text-xs font-semibold text-teal-300 border border-teal-700/50">
              ผู้ดูแลระบบ
            </span>
          </div>
        </div>

        {/* Tab Navigation List */}
        <nav
          aria-label="เมนูผู้ดูแลระบบ"
          className="mt-6 flex gap-1.5 overflow-x-auto pb-1 md:flex-col md:overflow-visible md:pb-0"
        >
          {navItems.map((item) => {
            const active = isItemActive(item);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`group flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all duration-150 ${
                  active
                    ? "bg-teal-700 text-white shadow-sm shadow-teal-950/40 ring-1 ring-teal-500/40"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                <Icon
                  className={`size-4.5 shrink-0 transition-colors ${
                    active ? "text-white" : "text-slate-400 group-hover:text-teal-300"
                  }`}
                />
                <span className="whitespace-nowrap">{item.label}</span>
                {active && (
                  <span
                    className="ml-auto hidden size-1.5 rounded-full bg-teal-300 md:inline-block"
                    aria-hidden="true"
                  />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Role Switcher in Sidebar Footer */}
      <div className="mt-6 pt-4 border-t border-slate-800/80">
        <Link
          href="/login"
          className="group flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-slate-200 transition-colors"
        >
          <svg
            className="size-4 shrink-0 text-slate-500 group-hover:text-slate-300"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
          <span>สลับบทบาท</span>
        </Link>
      </div>
    </aside>
  );
}

