import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/get-user";

async function AuthStatusDisplay() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="space-y-2">
        <p className="text-2xl font-bold text-slate-800">
          Authentication status: Signed out
        </p>
        <p className="text-sm text-slate-600">
          No active session detected. You are currently browsing as a guest.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-2xl font-bold text-emerald-800">
        Authentication status: Signed in
      </p>
      <p className="text-sm font-semibold text-slate-700">
        User ID: available
      </p>
    </div>
  );
}

export default function AuthCheckPage() {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-12 sm:px-6">
      <section className="mx-auto max-w-2xl rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
          Health Buddy
        </p>
        <h1 className="mt-2 text-3xl font-extrabold text-slate-950">
          Authentication check
        </h1>
        <div className="mt-6">
          <Suspense fallback={<p className="text-lg text-slate-600">Checking authentication…</p>}>
            <AuthStatusDisplay />
          </Suspense>
        </div>
        <p className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-500">
          This debug page reports authentication presence only. It never exposes tokens, secrets, or personal credentials.
        </p>
      </section>
    </main>
  );
}
