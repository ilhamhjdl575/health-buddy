import "server-only";

import { createClient } from "@/lib/supabase/server";

export type LocalCoordinator = {
  healthCenterName: string;
  coordinatorName: string;
  phone: string;
  lineId: string;
};

type CoordinatorRow = {
  health_center_name: string;
  coordinator_name: string;
  phone: string;
  line_id: string;
};

function toCoordinator(row: CoordinatorRow): LocalCoordinator {
  return {
    healthCenterName: row.health_center_name,
    coordinatorName: row.coordinator_name,
    phone: row.phone,
    lineId: row.line_id,
  };
}

export async function getLocalCoordinatorForUser(): Promise<LocalCoordinator | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("local_coordinator")
    .select("health_center_name, coordinator_name, phone, line_id")
    .eq("id", true)
    .maybeSingle();

  if (error || !data) return null;
  return toCoordinator(data as CoordinatorRow);
}

export async function getLocalCoordinatorForManagement(): Promise<LocalCoordinator | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("get_local_coordinator_for_management");

  if (error) throw new Error(error.message);
  const row = Array.isArray(data) ? data[0] : null;
  return row ? toCoordinator(row as CoordinatorRow) : null;
}

export async function saveLocalCoordinator(data: LocalCoordinator) {
  const supabase = await createClient();
  const { error } = await supabase.rpc("save_local_coordinator", {
    p_health_center_name: data.healthCenterName,
    p_coordinator_name: data.coordinatorName,
    p_phone: data.phone,
    p_line_id: data.lineId,
  });

  if (error) throw new Error(error.message);
}

