import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdminCaseDetail } from "@/app/_components/admin-case-detail";
import { getAdminCase } from "@/app/_lib/admin-cases";

async function CaseDetail({ params }: PageProps<"/admin/cases/[caseId]">) {
  const { caseId } = await params;
  const caseItem = getAdminCase(caseId);

  if (!caseItem) notFound();

  return <AdminCaseDetail caseItem={caseItem} />;
}

export default function AdminCasePage(props: PageProps<"/admin/cases/[caseId]">) {
  return (
    <Suspense fallback={<p className="text-lg text-slate-600">กำลังโหลดรายละเอียดเคส...</p>}>
      <CaseDetail {...props} />
    </Suspense>
  );
}
