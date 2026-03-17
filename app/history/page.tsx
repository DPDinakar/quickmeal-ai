"use client";

import { useEffect, useMemo, useState } from "react";

type Plan = {
  id: string;
  day: string;
  input: any;
  output: any;
  created_at: string;
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-100">
      {children}
    </span>
  );
}

export default function HistoryPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/plans");
        const data = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(data?.error || "Failed to load plans.");
        if (!alive) return;
        setPlans(Array.isArray(data?.plans) ? data.plans : []);
      } catch (e) {
        if (!alive) return;
        setError(e instanceof Error ? e.message : "Failed to load plans.");
      } finally {
        if (!alive) return;
        setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const grouped = useMemo(() => {
    const map = new Map<string, Plan[]>();
    for (const p of plans) {
      const key = p.day;
      map.set(key, [...(map.get(key) || []), p]);
    }
    return [...map.entries()].sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [plans]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-400/12 blur-3xl" />
        <div className="absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-cyan-400/12 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-8">
          <h1 className="text-2xl font-semibold text-white sm:text-3xl">Your history</h1>
          <p className="mt-2 text-sm text-slate-300">Meal plans you generated (saved automatically).</p>
        </header>

        {loading ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-soft">
            Loading your plans…
          </div>
        ) : error ? (
          <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-6 text-sm text-red-100 shadow-soft">
            {error}
          </div>
        ) : plans.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm text-slate-300 shadow-soft">
            No saved plans yet. Generate a meal plan on the home page and it will appear here.
          </div>
        ) : (
          <div className="grid gap-6">
            {grouped.map(([day, items]) => (
              <section key={day} className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-white">{day}</div>
                  <Pill>{items.length} plan{items.length === 1 ? "" : "s"}</Pill>
                </div>

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {items.map((p) => (
                    <details
                      key={p.id}
                      className="rounded-3xl border border-white/10 bg-slate-950/30 p-5"
                    >
                      <summary className="cursor-pointer select-none">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {p.output?.dailyTotals?.calories ? `${p.output.dailyTotals.calories} kcal day` : "Meal plan"}
                            </div>
                            <div className="mt-1 text-xs text-slate-400">
                              {p.input?.goal ? `Goal: ${p.input.goal}` : ""}
                              {p.input?.dietType ? ` • Diet: ${p.input.dietType}` : ""}
                              {p.input?.cookingTimeMinutes ? ` • ${p.input.cookingTimeMinutes} min` : ""}
                            </div>
                          </div>
                          <div className="text-xs text-slate-400">
                            {new Date(p.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </div>
                        </div>
                      </summary>
                      <pre className="mt-4 overflow-auto rounded-2xl bg-slate-950/50 p-4 text-xs text-slate-200">
                        {JSON.stringify(p.output, null, 2)}
                      </pre>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

