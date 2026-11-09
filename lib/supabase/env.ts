export type SupabaseEnv = {
  url: string;
  publishableKey: string;
};

export function getSupabaseConfigStatus() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const missing: string[] = [];

  if (!supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!supabasePublishableKey) missing.push("NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");

  return {
    ready: missing.length === 0,
    missing,
  };
}

export function getSupabaseEnv(): SupabaseEnv {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim();
  const status = getSupabaseConfigStatus();

  if (!status.ready) {
    throw new Error(
      `Supabase configuration is missing: ${status.missing.join(", ")}. Add the missing values to .env.local.`,
    );
  }

  return {
    url: supabaseUrl as string,
    publishableKey: supabasePublishableKey as string,
  };
}
