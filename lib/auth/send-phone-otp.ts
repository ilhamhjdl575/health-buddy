import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { normalizeThaiPhoneNumber } from "./normalize-phone";

export type SendPhoneOtpResult =
  | {
      success: true;
      e164: string;
      display: string;
    }
  | {
      success: false;
      error: string;
      isRateLimited?: boolean;
      isProviderUnconfigured?: boolean;
    };

/**
 * Sends a one-time password (OTP) via SMS to the specified phone number using Supabase Auth.
 *
 * Security:
 * - Normalizes phone to E.164 before dispatch.
 * - Never logs OTP codes or leaks internal provider secrets.
 * - Formats errors into user-friendly Thai messages.
 */
export async function sendPhoneOtp(rawPhone: string): Promise<SendPhoneOtpResult> {
  const norm = normalizeThaiPhoneNumber(rawPhone);
  if (!norm.success) {
    return {
      success: false,
      error: norm.error,
    };
  }

  const config = getSupabaseConfigStatus();
  if (!config.ready) {
    return {
      success: false,
      error: "ระบบฐานข้อมูลยังไม่พร้อมใช้งาน กรุณาลองใหม่อีกครั้งในภายหลัง",
      isProviderUnconfigured: true,
    };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      phone: norm.e164,
    });

    if (error) {
      const msg = error.message.toLowerCase();

      // Check for rate limiting
      if (error.status === 429 || msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("over_email_send_rate_limit")) {
        return {
          success: false,
          error: "คุณขอรหัส OTP ถี่เกินไป กรุณารอสักครู่แล้วลองใหม่อีกครั้ง",
          isRateLimited: true,
        };
      }

      // Check for unconfigured SMS provider
      if (
        msg.includes("sms provider") ||
        msg.includes("provider is not enabled") ||
        msg.includes("unsupported phone provider") ||
        msg.includes("twilio") ||
        msg.includes("messagebird")
      ) {
        return {
          success: false,
          error: "ผู้ให้บริการส่ง SMS ยังไม่พร้อมใช้งานในระบบขณะนี้ กรุณาติดต่อผู้ดูแลระบบ",
          isProviderUnconfigured: true,
        };
      }

      return {
        success: false,
        error: "ไม่สามารถส่งรหัส OTP ได้ กรุณาตรวจสอบหมายเลขโทรศัพท์และลองใหม่อีกครั้ง",
      };
    }

    return {
      success: true,
      e164: norm.e164,
      display: norm.display,
    };
  } catch {
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
    };
  }
}
