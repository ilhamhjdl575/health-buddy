"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { saveLocalCoordinator } from "@/lib/coordinator/data";

export type CoordinatorFormState = { success: boolean; message: string };

const coordinatorSchema = z.object({
  healthCenterName: z.string().trim().min(1, "กรุณากรอกชื่อ รพ.สต.").max(200),
  coordinatorName: z.string().trim().min(1, "กรุณากรอกชื่อผู้ประสานงาน").max(200),
  phone: z.string().trim().min(1, "กรุณากรอกเบอร์โทร").max(30),
  lineId: z.string().trim().min(1, "กรุณากรอก ID LINE").max(100),
});

export async function saveCoordinatorAction(
  _previousState: CoordinatorFormState,
  formData: FormData,
): Promise<CoordinatorFormState> {
  const parsed = coordinatorSchema.safeParse({
    healthCenterName: formData.get("healthCenterName"),
    coordinatorName: formData.get("coordinatorName"),
    phone: formData.get("phone"),
    lineId: formData.get("lineId"),
  });
  if (!parsed.success) {
    return { success: false, message: parsed.error.issues[0]?.message ?? "ข้อมูลไม่ถูกต้อง" };
  }

  try {
    await saveLocalCoordinator(parsed.data);
    revalidatePath("/emergency");
    return { success: true, message: "บันทึกข้อมูลผู้ประสานงานเรียบร้อยแล้ว" };
  } catch {
    return { success: false, message: "ไม่สามารถบันทึกข้อมูลได้ กรุณาลองใหม่อีกครั้ง" };
  }
}

