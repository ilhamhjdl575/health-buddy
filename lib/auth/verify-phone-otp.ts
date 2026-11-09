import { createClient } from "@/lib/supabase/client";
import { resolvePostLoginRedirect } from "./resolve-redirect";
import { normalizeThaiPhoneNumber } from "./normalize-phone";

export type VerifyPhoneOtpResult =
  | {
      success: true;
      destination: string;
    }
  | {
      success: false;
      error: string;
    };

/**
 * Verifies the SMS OTP token entered by the user.
 *
 * Security:
 * - Validates numeric OTP format before sending to server.
 * - Never logs OTP codes or sensitive credentials.
 * - Resolves destination URL from server database role (never trusts client role).
 */
export async function verifyPhoneOtp(
  rawPhone: string,
  tokenInput: string,
): Promise<VerifyPhoneOtpResult> {
  const norm = normalizeThaiPhoneNumber(rawPhone);
  if (!norm.success) {
    return {
      success: false,
      error: norm.error,
    };
  }

  const token = tokenInput.trim();
  if (!token) {
    return {
      success: false,
      error: "กรุณากรอกรหัส OTP",
    };
  }

  if (!/^[0-9]{4,8}$/.test(token)) {
    return {
      success: false,
      error: "รหัส OTP ต้องเป็นตัวเลขเท่านั้น",
    };
  }

  try {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      phone: norm.e164,
      token,
      type: "sms",
    });

    if (error) {
      const msg = error.message.toLowerCase();
      if (
        msg.includes("expired") ||
        msg.includes("invalid") ||
        msg.includes("token has expired") ||
        msg.includes("otp expired")
      ) {
        return {
          success: false,
          error: "รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาลองใหม่อีกครั้ง",
        };
      }

      if (error.status === 429 || msg.includes("rate limit") || msg.includes("too many requests")) {
        return {
          success: false,
          error: "คุณกรอกรหัสผิดหลายครั้งเกินไป กรุณารอสักครู่แล้วขอรหัสใหม่",
        };
      }

      return {
        success: false,
        error: "ไม่สามารถยืนยันรหัส OTP ได้ กรุณาตรวจสอบรหัสแล้วลองใหม่อีกครั้ง",
      };
    }

    // Resolve post-login destination safely from server database
    const redirectInfo = await resolvePostLoginRedirect();

    return {
      success: true,
      destination: redirectInfo.destination,
    };
  } catch {
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่อีกครั้ง",
    };
  }
}
