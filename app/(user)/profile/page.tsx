import { connection } from "next/server";
import { Suspense } from "react";
import { requireRole } from "@/lib/auth/route-guard";
import { getUserProfileData } from "@/lib/profile/user-profile-actions";
import { UserProfileView } from "@/app/_components/user-profile-view";

export const instant = false;

async function ProfileContent() {
  await connection();
  const result = await getUserProfileData();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-2xl py-12 text-center">
        <p className="rounded-2xl border-2 border-red-200 bg-red-50 p-6 text-xl font-bold text-red-900">
          {result.error}
        </p>
      </div>
    );
  }

  return <UserProfileView initialData={result.data} />;
}

export default async function UserProfilePage() {
  await requireRole("USER", "/profile");

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl py-12 text-center">
          <p className="text-xl font-bold text-slate-600">กำลังโหลดข้อมูลส่วนตัว...</p>
        </div>
      }
    >
      <ProfileContent />
    </Suspense>
  );
}
