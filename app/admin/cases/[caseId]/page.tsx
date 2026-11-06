import { notFound } from "next/navigation";
import { AdminCaseDetail } from "@/app/_components/admin-case-detail";
import { getAdminCase } from "@/app/_lib/admin-cases";
export default async function AdminCasePage({ params }: PageProps<"/admin/cases/[caseId]">) { const { caseId } = await params; const caseItem = getAdminCase(caseId); if (!caseItem) notFound(); return <AdminCaseDetail caseItem={caseItem} />; }
