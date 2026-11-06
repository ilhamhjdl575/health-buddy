import { Suspense, type ReactNode } from "react";
import { AdminNav } from "@/app/_components/admin-nav";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 md:flex">
      <Suspense fallback={null}>
        <AdminNav />
      </Suspense>
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
