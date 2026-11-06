import { Suspense, type ReactNode } from "react";
import { UserNav } from "@/app/_components/user-nav";

export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-teal-50/50 text-slate-900 flex flex-col">
      <Suspense fallback={null}>
        <UserNav />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
