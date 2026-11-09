/**
 * Normalizes and validates Thai phone numbers to E.164 format.
 *
 * Rules:
 * 1. Strips spaces, dashes, parentheses, and non-digit characters (except leading +).
 * 2. If starts with "0", converts leading "0" to "+66" (e.g. 0812345678 -> +66812345678).
 * 3. If starts with "66" without "+", prepends "+" -> +66...
 * 4. If already starts with "+66", preserves it.
 * 5. Validates against E.164 Thai phone pattern (+66 followed by 8-9 digits).
 */

export type PhoneNormalizationResult =
  | {
      success: true;
      e164: string;
      display: string;
    }
  | {
      success: false;
      error: string;
    };

export function normalizeThaiPhoneNumber(rawInput: string): PhoneNormalizationResult {
  if (!rawInput || typeof rawInput !== "string") {
    return {
      success: false,
      error: "กรุณากรอกหมายเลขโทรศัพท์",
    };
  }

  // Strip all whitespace, dashes, and brackets
  let cleaned = rawInput.trim().replace(/[\s\-\(\)\.]/g, "");

  // Handle leading 0 (Thai local format)
  if (cleaned.startsWith("0")) {
    cleaned = "+66" + cleaned.slice(1);
  } else if (cleaned.startsWith("66")) {
    cleaned = "+" + cleaned;
  } else if (!cleaned.startsWith("+66")) {
    return {
      success: false,
      error: "กรุณากรอกหมายเลขโทรศัพท์ในประเทศไทยที่ขึ้นต้นด้วย 0 หรือ +66",
    };
  }

  // Validate E.164 format: +66 followed by 8 or 9 digits
  const thaiPhoneRegex = /^\+66[0-9]{8,9}$/;
  if (!thaiPhoneRegex.test(cleaned)) {
    return {
      success: false,
      error: "หมายเลขโทรศัพท์ไม่ถูกต้อง กรุณากรอกเบอร์โทรศัพท์ 9-10 หลัก (เช่น 0812345678)",
    };
  }

  // Format display as +66 81 234 5678 or +66 8x xxx xxxx
  const digitsAfterCountry = cleaned.slice(3); // e.g. "812345678"
  const display =
    digitsAfterCountry.length === 9
      ? `+66 ${digitsAfterCountry.slice(0, 2)} ${digitsAfterCountry.slice(2, 5)} ${digitsAfterCountry.slice(5)}`
      : `+66 ${digitsAfterCountry.slice(0, 1)} ${digitsAfterCountry.slice(1, 4)} ${digitsAfterCountry.slice(4)}`;

  return {
    success: true,
    e164: cleaned,
    display,
  };
}
