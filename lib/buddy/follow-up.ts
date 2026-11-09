"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type FollowUpAction = {
  id: string;
  actionType: string;
  note: string;
  createdAt: string;
};

export type FollowUpCase = {
  id: string;
  requestId: string;
  recipientName: string;
  serviceDate: string;
  serviceType: string;
  status: string;
  note: string | null;
  latestAt: string;
  actions: FollowUpAction[];
};

export async function getMyFollowUpCases(): Promise<
  { success: true; cases: FollowUpCase[] } | { success: false; error: string }
> {
  const s = await createClient();
  const { data, error } = await s.rpc("get_my_follow_up_cases");
  if (error) return { success: false, error: "ไม่สามารถโหลดรายการติดตามผลได้" };

  return {
    success: true,
    cases: (
      (data ?? []) as Array<{
        case_id: string;
        request_id: string;
        recipient_name: string;
        service_date: string;
        service_type: string;
        follow_up_status: string;
        case_note: string | null;
        latest_at: string;
        actions: FollowUpAction[];
      }>
    ).map((r) => ({
      id: r.case_id,
      requestId: r.request_id,
      recipientName: r.recipient_name,
      serviceDate: r.service_date,
      serviceType: r.service_type,
      status: r.follow_up_status,
      note: r.case_note,
      latestAt: r.latest_at,
      actions: r.actions ?? [],
    })),
  };
}

export async function finishFollowUpCase(caseId: string, note?: string) {
  const s = await createClient();
  const followUpNote = note?.trim() || "สิ้นสุดการบริการ: ผู้ป่วยไม่มีการรักษาต่อเนื่อง";
  const { error } = await s.rpc("add_my_follow_up_action", {
    p_case_id: caseId,
    p_action_type: "CLOSE_CASE",
    p_note: followUpNote,
  });

  if (error) {
    return { success: false as const, error: "ไม่สามารถบันทึกสิ้นสุดการบริการได้: " + error.message };
  }

  revalidatePath("/buddy/follow-up");
  revalidatePath("/buddy/history");
  return { success: true as const };
}

export async function contactHealthCenterFollowUp(caseId: string, reason: string) {
  const trimmed = reason.trim();
  if (!trimmed) {
    return { success: false as const, error: "กรุณาระบุว่าผู้ป่วยเป็นอะไร หรือทำไมต้องติดตามผล" };
  }

  const s = await createClient();
  const followUpNote = `ติดต่อเจ้าหน้าที่ รพ.สต. เนื่องจากต้องติดตามอาการ: ${trimmed}`;
  const { error } = await s.rpc("add_my_follow_up_action", {
    p_case_id: caseId,
    p_action_type: "CALL_HEALTH_CENTER",
    p_note: followUpNote,
  });

  if (error) {
    return { success: false as const, error: "ไม่สามารถบันทึกการติดต่อ รพ.สต. ได้: " + error.message };
  }

  revalidatePath("/buddy/follow-up");
  revalidatePath("/buddy/history");
  return { success: true as const };
}

export async function completeJobWithFollowUp(
  requestId: string,
  outcome: "FINISH" | "CONTACT_HEALTH_CENTER",
  reason?: string
) {
  const s = await createClient();

  // 1. Advance job status to COMPLETED
  const { error: advanceErr } = await s.rpc("advance_job_status", {
    p_request_id: requestId,
    p_target_status: "COMPLETED",
  });

  if (advanceErr) {
    return { success: false as const, error: "ไม่สามารถเปลี่ยนสถานะเป็นสำเร็จได้: " + advanceErr.message };
  }

  // 2. Locate the follow_up_cases row created by trigger
  const { data: fc } = await s
    .from("follow_up_cases")
    .select("id")
    .eq("service_request_id", requestId)
    .maybeSingle();

  if (fc?.id) {
    if (outcome === "FINISH") {
      await s.rpc("add_my_follow_up_action", {
        p_case_id: fc.id,
        p_action_type: "CLOSE_CASE",
        p_note: "สิ้นสุดการบริการ: ผู้ป่วยไม่มีการรักษาต่อเนื่อง",
      });
    } else {
      const trimmed = (reason || "").trim();
      const followUpNote = trimmed
        ? `ติดต่อเจ้าหน้าที่ รพ.สต. เนื่องจากต้องติดตามอาการ: ${trimmed}`
        : "ติดต่อเจ้าหน้าที่ รพ.สต. เนื่องจากต้องติดตามอาการ";
      await s.rpc("add_my_follow_up_action", {
        p_case_id: fc.id,
        p_action_type: "CALL_HEALTH_CENTER",
        p_note: followUpNote,
      });
    }
  }

  revalidatePath("/buddy/my-jobs");
  revalidatePath(`/buddy/my-jobs/${requestId}`);
  revalidatePath("/buddy/follow-up");
  revalidatePath("/buddy/history");
  revalidatePath("/buddy/today");

  return { success: true as const };
}

export async function addFollowUpAction(caseId: string, actionType: string, note: string) {
  const allowed = new Set(["CALL_USER", "CALL_FAMILY", "CALL_HEALTH_CENTER", "CLOSE_CASE"]);
  if (!allowed.has(actionType) || !note.trim()) {
    return { success: false as const, error: "กรุณาเลือกการดำเนินการและเขียนบันทึก" };
  }

  const s = await createClient();
  const { error } = await s.rpc("add_my_follow_up_action", {
    p_case_id: caseId,
    p_action_type: actionType,
    p_note: note.trim(),
  });

  if (error) {
    return { success: false as const, error: "ไม่สามารถบันทึกการติดตามได้" };
  }

  revalidatePath("/buddy/follow-up");
  revalidatePath("/buddy/history");
  return { success: true as const };
}
