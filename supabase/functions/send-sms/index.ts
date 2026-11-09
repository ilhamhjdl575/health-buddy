import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

/**
 * Normalizes an E.164 Thai phone number to local Thai format (e.g. +66855830612 -> 0855830612)
 * for compatibility with the THSMS API.
 */
function normalizePhoneForThsms(rawPhone: string): { success: true; phone: string } | { success: false; error: string } {
  if (!rawPhone || typeof rawPhone !== "string") {
    return { success: false, error: "Phone number is missing" };
  }

  // Strip whitespace, dashes, brackets
  let cleaned = rawPhone.trim().replace(/[\s\-\(\)\.]/g, "");

  if (cleaned.startsWith("+66")) {
    cleaned = "0" + cleaned.slice(3);
  } else if (cleaned.startsWith("66")) {
    cleaned = "0" + cleaned.slice(2);
  }

  // Validate Thai domestic mobile format: 10 digits starting with 0
  const thaiPhoneRegex = /^0[0-9]{8,9}$/;
  if (!thaiPhoneRegex.test(cleaned)) {
    return { success: false, error: "Invalid Thai phone number format" };
  }

  return { success: true, phone: cleaned };
}

/**
 * Masks a phone number for safe privacy-compliant logging (e.g. 0855830612 -> 085****612).
 */
function maskPhone(phone: string): string {
  if (phone.length <= 6) return "****";
  const start = phone.slice(0, 3);
  const end = phone.slice(-3);
  return `${start}****${end}`;
}

Deno.serve(async (req: Request) => {
  // Only accept POST requests from Supabase Auth Hooks
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 1. Read environment secrets
  const thsmsAccessToken = Deno.env.get("THSMS_ACCESS_TOKEN");
  const thsmsSender = Deno.env.get("THSMS_SENDER") || "Target SMS";
  const rawHookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");

  if (!thsmsAccessToken || !rawHookSecret) {
    console.error(
      `[${new Date().toISOString()}] Configuration error: THSMS_ACCESS_TOKEN or SEND_SMS_HOOK_SECRET is not configured.`
    );
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: "SMS service configuration is incomplete",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 2. Verify webhook signature
  // Supabase Dashboard provides secrets with prefix "v1,whsec_..." or "whsec_..."
  let hookSecret = rawHookSecret.trim();
  if (hookSecret.startsWith("v1,")) {
    hookSecret = hookSecret.slice(3);
  }

  const rawBody = await req.text();
  const headers = Object.fromEntries(req.headers.entries());

  let verifiedPayload: any;
  try {
    const wh = new Webhook(hookSecret);
    verifiedPayload = wh.verify(rawBody, headers);
  } catch (err) {
    console.error(
      `[${new Date().toISOString()}] Webhook signature verification failed:`,
      err instanceof Error ? err.message : "Invalid signature"
    );
    return new Response(
      JSON.stringify({
        error: {
          http_code: 401,
          message: "Invalid webhook signature",
        },
      }),
      {
        status: 401,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 3. Extract user phone and generated OTP from payload
  const data = typeof verifiedPayload === "string" ? JSON.parse(verifiedPayload) : verifiedPayload;
  const rawPhone = data?.user?.phone;
  const otp = data?.sms?.otp;

  if (!rawPhone || !otp) {
    console.error(`[${new Date().toISOString()}] Payload error: missing user.phone or sms.otp`);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 400,
          message: "Payload missing user.phone or sms.otp",
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // 4. Normalize phone for THSMS
  const normResult = normalizePhoneForThsms(rawPhone);
  if (!normResult.success) {
    console.error(`[${new Date().toISOString()}] Invalid phone format received from auth hook`);
    return new Response(
      JSON.stringify({
        error: {
          http_code: 400,
          message: normResult.error,
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  const localPhone = normResult.phone;
  const masked = maskPhone(localPhone);

  // 5. Dispatch SMS request to THSMS API
  try {
    const thsmsResponse = await fetch("https://thsms.com/api/send-sms", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${thsmsAccessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sender: thsmsSender,
        msisdn: [localPhone],
        message: `Health Buddy: รหัส OTP ของคุณคือ ${otp}`,
      }),
    });

    const thsmsData = await thsmsResponse.json().catch(() => null);

    // Validate response from THSMS
    if (!thsmsResponse.ok || !thsmsData || thsmsData.success !== true) {
      console.error(
        `[${new Date().toISOString()}] THSMS dispatch failed for ${masked}. HTTP ${thsmsResponse.status}, response:`,
        thsmsData?.message || "Unknown error"
      );
      return new Response(
        JSON.stringify({
          error: {
            http_code: 500,
            message: "THSMS provider failed to deliver message",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.log(
      `[${new Date().toISOString()}] SMS dispatched successfully via ${thsmsSender} to ${masked}. Status code: ${thsmsData.code ?? 200}`
    );

    // Return HTTP 200 to Supabase Auth Hook to confirm successful SMS dispatch
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (dispatchError) {
    console.error(
      `[${new Date().toISOString()}] Network exception while calling THSMS for ${masked}:`,
      dispatchError instanceof Error ? dispatchError.message : "Fetch failed"
    );
    return new Response(
      JSON.stringify({
        error: {
          http_code: 500,
          message: "Internal network error while contacting SMS provider",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
});
