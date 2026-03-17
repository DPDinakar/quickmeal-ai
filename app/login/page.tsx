"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(() => (mode === "login" ? "Welcome back" : "Create your account"), [mode]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);
    try {
      const supabase = createSupabaseBrowserClient();
      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
        router.push(nextPath);
        router.refresh();
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password });
        if (err) throw err;
        setMessage("Account created. You can now log in.");
        setMode("login");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auth failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-hidden">
      <h1 style={{ color: "red" }}>LOGIN PAGE</h1>

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7 shadow-soft">
          <div className="mb-5">
            <div className="text-xs font-semibold tracking-wide text-slate-300">QuickMeal AI</div>
            <h1 className="mt-1 text-2xl font-semibold text-white">{title}</h1>
            <p className="mt-2 text-sm text-slate-300">
              Sign in to save your daily meal plans and track what you cooked.
            </p>
          </div>

          <div className="mb-4 grid grid-cols-2 rounded-2xl border border-white/10 bg-slate-950/30 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                mode === "login" ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              Log in
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                mode === "signup" ? "bg-white text-slate-950" : "text-slate-200 hover:bg-white/5"
              }`}
            >
              Sign up
            </button>
          </div>

          <form className="space-y-4" onSubmit={onSubmit}>
            <label className="space-y-2">
              <div className="text-xs font-medium text-slate-300">Email</div>
              <input
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-white/25 focus:bg-slate-950/55"
                placeholder="you@company.com"
              />
            </label>

            <label className="space-y-2">
              <div className="text-xs font-medium text-slate-300">Password</div>
              <input
                type="password"
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-white/25 focus:bg-slate-950/55"
                placeholder="••••••••"
              />
              <div className="text-xs text-slate-400">
                Use at least 8 characters. For production, enable email confirmations in Supabase Auth settings.
              </div>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>

            {message ? (
              <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-50">
                {message}
              </div>
            ) : null}

            {error ? (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                {error}
              </div>
            ) : null}
          </form>
        </div>

        <div className="text-center text-xs text-slate-400">
          After login you’ll be able to view your history at <span className="text-slate-200">/history</span>.
        </div>
      </div>
    </main>
  );
}

