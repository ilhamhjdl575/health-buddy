import { Suspense, type ReactNode } from "react";
import { connection } from "next/server";
import { UserNav } from "@/app/_components/user-nav";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";
import { getMyNotifications } from "@/lib/notifications/actions";

export const instant = false;

async function NavContent(){
  await connection();
  const profile=await getCurrentProfile();
  const notifications=profile.status==="AUTHENTICATED"?await getMyNotifications():[];
  return <UserNav profileId={profile.status==="AUTHENTICATED"?profile.profileId:undefined} notifications={notifications} />;
}
export default function UserLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-teal-50/50 text-slate-900 flex flex-col">
      <Suspense fallback={null}>
        <NavContent />
      </Suspense>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
