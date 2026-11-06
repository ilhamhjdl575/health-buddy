import { AdminCasesList } from "@/app/_components/admin-cases-list";
import { adminCases } from "@/app/_lib/admin-cases";
export default function CasesPage() { return <AdminCasesList cases={adminCases} />; }
