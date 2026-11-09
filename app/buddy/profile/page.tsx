import { connection } from "next/server";
import { Suspense } from "react";
import { requireRole } from "@/lib/auth/route-guard";
import { getBuddyProfileData } from "@/lib/profile/buddy-profile-actions";
import { BuddyProfileView } from "@/app/_components/buddy-profile-view";

export const instant = false;

async function ProfileContent() {
  await connection();
  const result = await getBuddyProfileData();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-xl font-bold text-red-900">
          {result.error}
        </p>
      </div>
    );
  }

  return <BuddyProfileView initialData={result.data} />;
}

export default async function BuddyProfilePage() {
  await requireRole("BUDDY", "/buddy/profile");

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-4xl py-12 text-center">
          <p className="text-xl font-bold text-slate-600">กำลังโหลดข้อมูลผู้ดูแล...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
