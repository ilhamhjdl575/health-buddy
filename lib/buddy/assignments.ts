"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export type PendingAssignment = {
  requestId: string;
  assignmentId: string;
  serviceType: string;
  serviceDate: string;
  startTime: string;
  endTime: string | null;
  mobilitySummary: string[];
};

export type MyJobSummary = {
  requestId: string;
  serviceType: string;
  serviceDate: string;
  startTime: string;
  endTime: string | null;
  requestStatus: string;
  recipientName: string;
};

export type JobStatusHistoryItem = {
  fromStatus: string | null;
  toStatus: string;
  createdAt: string;
};

export async function getPendingAssignments() {
  const s = await createClient();
  const { data, error } = await s.rpc("get_pending_assignments_for_current_buddy");
  if (error) return { success: false as const, error: "ไม่สามารถโหลดงานได้" };
  return {
    success: true as const,
    assignments: (data ?? []).map((x: {
      request_id: string;
      assignment_id: string;
      service_type: string;
      service_date: string;
      start_time: string;
      end_time: string | null;
      mobility_summary: string[] | null;
    }) => ({
      requestId: x.request_id,
      assignmentId: x.assignment_id,
      serviceType: x.service_type,
      serviceDate: x.service_date,
      startTime: x.start_time,
      endTime: x.end_time,
      mobilitySummary: x.mobility_summary ?? [],
    })),
  };
}

export async function respondAssignment(id: string, accept: boolean) {
  const s = await createClient();
  const { data, error } = await s.rpc("respond_to_assignment", {
    p_assignment_id: id,
    p_accept: accept,
  });
  return error
    ? { success: false as const, error: accept ? "ไม่สามารถตอบรับงานได้" : "ไม่สามารถปฏิเสธงานได้" }
    : { success: true as const, requestId: data as string };
}

export async function getPrivateJob(id: string) {
  const s = await createClient();
  const { data, error } = await s.rpc("get_my_job_detail", { p_request_id: id });
  return error ? null : (data?.[0] as {
    recipient_name: string;
    recipient_phone: string;
    service_type: string;
    service_date: string;
    start_time: string;
    end_time: string | null;
    pickup_address: string;
    destination_address: string | null;
    request_status: string;
    mobility_summary: string[] | null;
    emergency_name: string | null;
    emergency_phone: string | null;
  } | undefined) ?? null;
}

export async function getMyAcceptedJobs(): Promise<MyJobSummary[]> {
  const s = await createClient();
  const { data, error } = await s.rpc("get_my_accepted_jobs");
  if (error || !data) return [];
  return (data as Array<{
    request_id: string;
    service_type: string;
    service_date: string;
    start_time: string;
    end_time: string | null;
    request_status: string;
    recipient_name: string;
  }>).map((row) => ({
    requestId: row.request_id,
    serviceType: row.service_type,
    serviceDate: row.service_date,
    startTime: row.start_time,
    endTime: row.end_time,
    requestStatus: row.request_status,
    recipientName: row.recipient_name,
  }));
}

export async function getMyTodayJobs(): Promise<MyJobSummary[]> {
  const s = await createClient();
  const { data, error } = await s.rpc("get_my_today_jobs");
  if (error || !data) return [];
  return (data as Array<{
    request_id: string;
    service_type: string;
    service_date: string;
    start_time: string;
    end_time: string | null;
    request_status: string;
    recipient_name: string;
  }>).map((row) => ({
    requestId: row.request_id,
    serviceType: row.service_type,
    serviceDate: row.service_date,
    startTime: row.start_time,
    endTime: row.end_time,
    requestStatus: row.request_status,
    recipientName: row.recipient_name,
  }));
}

export async function advanceJobStatus(
  requestId: string,
  targetStatus: string
): Promise<
  | { success: true; status: string; history: JobStatusHistoryItem[] }
  | { success: false; error: string }
> {
  const allowedTargets = new Set(["ON_THE_WAY", "ARRIVED", "IN_PROGRESS", "COMPLETED"]);
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(requestId)) {
    return { success: false, error: "รหัสงานไม่ถูกต้อง" };
  }
  if (!allowedTargets.has(targetStatus)) {
    return { success: false, error: "สถานะปลายทางไม่ถูกต้อง" };
  }

  const s = await createClient();
  const { data, error } = await s.rpc("advance_job_status", {
    p_request_id: requestId,
    p_target_status: targetStatus,
  });
  if (error) {
    return { success: false, error: "ไม่สามารถเปลี่ยนสถานะงานได้ กรุณาโหลดหน้าใหม่แล้วลองอีกครั้ง" };
  }

  const { data: historyData, error: historyError } = await s.rpc("get_job_status_history", {
    p_request_id: requestId,
  });
  if (historyError) {
    return { success: false, error: "เปลี่ยนสถานะแล้ว แต่ไม่สามารถโหลดประวัติล่าสุดได้ กรุณาโหลดหน้าใหม่" };
  }

  const history = ((historyData ?? []) as Array<{
    from_status: string | null;
    to_status: string;
    created_at: string;
  }>).map((row) => ({
    fromStatus: row.from_status,
    toStatus: row.to_status,
    createdAt: row.created_at,
  }));

  revalidatePath("/buddy/my-jobs");
  revalidatePath(`/buddy/my-jobs/${requestId}`);
  revalidatePath("/buddy/today");
  revalidatePath("/my-bookings");

  return { success: true, status: data as string, history };
}

export async function getJobStatusHistory(requestId: string): Promise<JobStatusHistoryItem[]> {
  const s = await createClient();
  const { data, error } = await s.rpc("get_job_status_history", {
    p_request_id: requestId,
  });
  if (error || !data) return [];
  return (data as Array<{
    from_status: string | null;
    to_status: string;
    created_at: string;
  }>).map((row) => ({
    fromStatus: row.from_status,
    toStatus: row.to_status,
    createdAt: row.created_at,
  }));
}
