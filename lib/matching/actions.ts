"use server";
import { createClient } from "@/lib/supabase/server";

export type CandidateBuddy = {
  buddyProfileId: string;
  displayName: string;
  buddyTypes: string[];
  verifiedQualifications: string[];
  serviceArea: string | null;
  workModes: string[];
  hasCar: boolean;
};

export async function getCandidateBuddies(
  requestId: string
): Promise<{ success: true; buddies: CandidateBuddy[] } | { success: false; error: string }> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_candidate_buddies_for_request", {
    p_request_id: requestId,
  });
  if (error) return { success: false, error: "ไม่สามารถโหลดรายชื่อ Buddy ได้" };
  return {
    success: true,
    buddies: (data ?? []).map(
      (b: {
        buddy_profile_id: string;
        display_name: string;
        buddy_types: string[] | null;
        verified_qualifications: string[] | null;
        service_area: string | null;
        work_modes: string[] | null;
      }) => ({
        buddyProfileId: b.buddy_profile_id,
        displayName: b.display_name,
        buddyTypes: b.buddy_types ?? [],
        verifiedQualifications: b.verified_qualifications ?? [],
        serviceArea: b.service_area,
        workModes: b.work_modes ?? [],
        hasCar: b.work_modes?.includes("HAS_CAR") ?? false,
      })
    ),
  };
}
export async function selectBuddy(requestId: string, buddyProfileId: string) { const supabase = await createClient(); const { error } = await supabase.rpc("select_buddy_for_request", { p_request_id: requestId, p_buddy_profile_id: buddyProfileId }); return error ? { success: false as const, error: "ไม่สามารถเลือก Buddy ได้" } : { success: true as const }; }
