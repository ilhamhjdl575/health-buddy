import { Suspense, type ReactNode } from "react";
import { BuddyNav } from "@/app/_components/buddy-nav";

export default function BuddyLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col">
      <Suspense fallback={null}>
        <BuddyNav />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
