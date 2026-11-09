import { Suspense } from "react";
import { getSupabaseConfigStatus } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";

async function SupabaseConfigurationStatus() {
  const configuration = getSupabaseConfigStatus();

  if (!configuration.ready) {
    return <p className="mt-4 text-2xl font-bold text-amber-800">Supabase configuration: Missing</p>;
  }

  let clientInitialized = false;

  try {
    await createClient();
    clientInitialized = true;
  } catch {
    clientInitialized = false;
  }

  return clientInitialized ? (
    <p className="mt-4 text-2xl font-bold text-emerald-800">Supabase configuration: Ready</p>
  ) : (
    <p className="mt-4 text-2xl font-bold text-amber-800">Supabase configuration: Missing</p>
  );
}

export default function SystemCheckPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">Health Buddy</p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">System check</h1>
        <Suspense fallback={<p className="mt-4 text-lg text-slate-600">Checking configuration…</p>}>
          <SupabaseConfigurationStatus />
        </Suspense>
        <p className="mt-4 text-base text-slate-600">
          This page reports configuration presence only. It never displays environment values or credentials.
        </p>
      </section>
    </main>
  );
}
