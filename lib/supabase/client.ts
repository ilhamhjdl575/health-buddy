"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "@/lib/supabase/env";

let browserClient: ReturnType<typeof createBrowserClient> | undefined;

/** Use only in Client Components. */
export function createClient() {
  const { url, publishableKey } = getSupabaseEnv();

  browserClient ??= createBrowserClient(url, publishableKey, {
    auth: {
      experimental: {
        appendPkceFlowIdToRedirects: true,
      },
    },
  });
  return browserClient;
}
