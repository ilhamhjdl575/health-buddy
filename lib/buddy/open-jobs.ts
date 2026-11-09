"use server";

import type { ServiceType } from "@/app/_lib/services";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export type OpenJob = { id: string; serviceType: ServiceType; scheduledDate: string; startTime: string; endTime: string | null; mobilitySummary: string[]; approximateArea: string | null; requiresVerifiedBedriddenQualification: boolean };
type OpenJobRpcRow = { id: string; service_type: string; scheduled_date: string; start_time: string; end_time: string | null; mobility_summary: string[] | null; approximate_area: string | null; requires_verified_bedridden_qualification: boolean };

export async function getOpenJobsForCurrentBuddy(jobId?: string): Promise<{ success: true; jobs: OpenJob[] } | { success: false; error: string }> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "BUDDY") return { success: false, error: "ไม่มีสิทธิ์ดูงานนี้" };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_open_jobs_for_current_buddy", { p_job_id: jobId ?? null });
  if (error) return { success: false, error: error.message.includes("No active") ? "ไม่มีสิทธิ์ดูงานนี้" : "ไม่สามารถโหลดข้อมูลงานได้" };
  return { success: true, jobs: ((data ?? []) as OpenJobRpcRow[]).map((job) => ({ id: job.id, serviceType: job.service_type as ServiceType, scheduledDate: job.scheduled_date, startTime: job.start_time, endTime: job.end_time, mobilitySummary: job.mobility_summary ?? [], approximateArea: job.approximate_area, requiresVerifiedBedriddenQualification: job.requires_verified_bedridden_qualification })) };
}
