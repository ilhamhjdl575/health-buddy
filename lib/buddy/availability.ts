"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-current-profile";

export type AvailabilityStatus = "AVAILABLE" | "OFFLINE";
export type AvailabilitySlot = { id: string; date: string; startTime: string; endTime: string };

export async function getMyAvailability(): Promise<
  { success: true; status: AvailabilityStatus; slots: AvailabilitySlot[]; activePeriods: string[] } | { success: false; error: string }
> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_my_availability");
  if (error) return { success: false, error: "ไม่สามารถโหลดเวลาพร้อมรับงานได้" };
  const rows = (data ?? []) as Array<{
    availability_status: AvailabilityStatus;
    slot_id: string | null;
    available_date: string | null;
    start_time: string | null;
    end_time: string | null;
  }>;

  const slots = rows
    .filter((r) => r.slot_id)
    .map((r) => ({
      id: r.slot_id!,
      date: r.available_date!,
      startTime: r.start_time!.slice(0, 5),
      endTime: r.end_time!.slice(0, 5),
    }));

  const activePeriods = new Set<string>();
  for (const s of slots) {
    const d = new Date(`${s.date}T00:00:00`);
    const day = d.getDay();
    const isWeekday = day >= 1 && day <= 5;
    const isWeekend = day === 0 || day === 6;

    if (isWeekday) {
      if (s.startTime <= "08:30" && s.endTime >= "16:30") activePeriods.add("OFFICIAL");
      if (s.endTime >= "20:00" || (s.startTime >= "16:00" && s.endTime >= "20:00")) activePeriods.add("OVERTIME_WEEKDAY");
    } else if (isWeekend) {
      activePeriods.add("WEEKEND_HOLIDAY");
    }
  }

  return {
    success: true,
    status: rows[0]?.availability_status ?? "AVAILABLE",
    slots,
    activePeriods: Array.from(activePeriods),
  };
}

export async function saveRecurringAvailability(selectedPeriods: string[]): Promise<{ success: true } | { success: false; error: string }> {
  const current = await getCurrentProfile();
  if (current.status !== "AUTHENTICATED" || current.role !== "BUDDY") {
    return { success: false, error: "ไม่มีสิทธิ์ดำเนินการ" };
  }

  const supabase = await createClient();
  const todayDate = new Date();
  const localToday = new Date(todayDate.getTime() - todayDate.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);

  // Clear future slots for this buddy so the new recurring schedule replaces it cleanly
  const { error: delError } = await supabase
    .from("availability_slots")
    .delete()
    .eq("buddy_id", current.profileId)
    .gte("available_date", localToday);

  if (delError) {
    return { success: false, error: "ไม่สามารถลบตารางเดิมได้: " + delError.message };
  }

  if (!selectedPeriods || selectedPeriods.length === 0) {
    revalidatePath("/buddy/availability");
    return { success: true };
  }

  // Generate availability slots for the next 45 days
  const slotsToInsert: Array<{ buddy_id: string; available_date: string; start_time: string; end_time: string }> = [];

  for (let i = 0; i < 45; i++) {
    const d = new Date(todayDate.getTime() + i * 24 * 60 * 60 * 1000);
    const dateStr = new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 10);
    const dayOfWeek = d.getDay();
    const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5;
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    if (isWeekday) {
      const hasOfficial = selectedPeriods.includes("OFFICIAL");
      const hasOvertime = selectedPeriods.includes("OVERTIME_WEEKDAY");

      if (hasOfficial && hasOvertime) {
        slotsToInsert.push({
          buddy_id: current.profileId,
          available_date: dateStr,
          start_time: "08:30:00",
          end_time: "20:30:00",
        });
      } else if (hasOfficial) {
        slotsToInsert.push({
          buddy_id: current.profileId,
          available_date: dateStr,
          start_time: "08:30:00",
          end_time: "16:30:00",
        });
      } else if (hasOvertime) {
        slotsToInsert.push({
          buddy_id: current.profileId,
          available_date: dateStr,
          start_time: "16:30:00",
          end_time: "20:30:00",
        });
      }
    } else if (isWeekend) {
      if (selectedPeriods.includes("WEEKEND_HOLIDAY")) {
        slotsToInsert.push({
          buddy_id: current.profileId,
          available_date: dateStr,
          start_time: "08:30:00",
          end_time: "16:30:00",
        });
      }
    }
  }

  if (slotsToInsert.length > 0) {
    const { error: insErr } = await supabase.from("availability_slots").insert(slotsToInsert);
    if (insErr) {
      return { success: false, error: "ไม่สามารถบันทึกตารางเวลาได้: " + insErr.message };
    }
  }

  revalidatePath("/buddy/availability");
  return { success: true };
}

export async function saveAvailabilitySlot(input: { id?: string; date: string; startTime: string; endTime: string }) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.date) || !/^\d{2}:\d{2}$/.test(input.startTime) || !/^\d{2}:\d{2}$/.test(input.endTime)) {
    return { success: false as const, error: "กรุณากรอกวันและเวลาให้ครบถ้วน" };
  }
  const supabase = await createClient();
  const { error } = await supabase.rpc("upsert_my_availability_slot", {
    p_slot_id: input.id ?? null,
    p_available_date: input.date,
    p_start_time: input.startTime,
    p_end_time: input.endTime,
  });
  if (error) {
    return {
      success: false as const,
      error: error.code === "23P01" ? "ช่วงเวลานี้ทับกับเวลาที่ตั้งไว้แล้ว" : "ไม่สามารถบันทึกช่วงเวลาได้ กรุณาตรวจสอบวันที่และเวลา",
    };
  }
  revalidatePath("/buddy/availability");
  return { success: true as const };
}

export async function removeAvailabilitySlot(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("delete_my_availability_slot", { p_slot_id: id });
  if (error) return { success: false as const, error: "ไม่สามารถลบช่วงเวลาได้" };
  revalidatePath("/buddy/availability");
  return { success: true as const };
}

export async function changeAvailabilityStatus(status: AvailabilityStatus) {
  if (status !== "AVAILABLE" && status !== "OFFLINE") return { success: false as const, error: "สถานะไม่ถูกต้อง" };
  const supabase = await createClient();
  const { error } = await supabase.rpc("set_my_availability_status", { p_status: status });
  if (error) return { success: false as const, error: "ไม่สามารถเปลี่ยนสถานะได้" };
  revalidatePath("/buddy/availability");
  return { success: true as const };
}
