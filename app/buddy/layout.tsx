import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { BuddyNav } from "@/app/_components/buddy-nav";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getMyNotifications } from "@/lib/notifications/actions";
import { requireRole } from "@/lib/auth/route-guard";

export const instant = false;

async function NavContent(){
  await connection();
  const profile=await getCurrentProfile();
  const notifications=profile.status==="AUTHENTICATED"?await getMyNotifications():[];
  return <BuddyNav profileId={profile.status==="AUTHENTICATED"?profile.profileId:undefined} notifications={notifications} />;
}
export default async function BuddyLayout({ children }: { children: ReactNode }) {
  await requireRole("BUDDY");
  return (
    <div className="min-h-screen bg-blue-50/50 flex flex-col">
      <Suspense fallback={null}>
        <NavContent />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
