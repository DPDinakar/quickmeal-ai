"use client";

import { useMemo, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { MealPlanResponse } from "@/lib/mealplan-schema";

type FormState = {
  goal: "weight_loss" | "muscle_gain" | "maintenance";
  dietType: "vegetarian" | "non_vegetarian" | "vegan";
  cookingTimeMinutes: 5 | 10 | 20;
  caloriesTarget: number;
  ingredients: string;
};

const defaultForm: FormState = {
  goal: "maintenance",
  dietType: "non_vegetarian",
  cookingTimeMinutes: 10,
  caloriesTarget: 2000,
  ingredients: "eggs, spinach, oats, yogurt, chicken, rice, olive oil, tomatoes"
};

function Icon({ name, className }: { name: "bolt" | "leaf" | "target" | "clock" | "spark"; className?: string }) {
  const cls = className || "h-4 w-4";
  switch (name) {
    case "bolt":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M13 2 3 14h7l-1 8 12-14h-7l-1-6Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
    case "leaf":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M20 4c-6 0-12 4-14 10-1 3 1 6 4 6 6 0 10-8 10-16Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M6 18c2-3 7-7 12-10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "target":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 17a5 5 0 1 1 0-10 5 5 0 0 1 0 10Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 13a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" fill="currentColor" />
        </svg>
      );
    case "clock":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path d="M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Z" stroke="currentColor" strokeWidth="1.8" />
          <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case "spark":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={cls} aria-hidden>
          <path
            d="M12 2l1.2 6.1L20 10l-6.8 1.9L12 18l-1.2-6.1L4 10l6.8-1.9L12 2Z"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
      );
  }
}

function Card({
  title,
  icon,
  right,
  children
}: {
  title: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft transition will-change-transform hover:-translate-y-0.5 hover:border-white/20">
      <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
        <div className="absolute -left-24 -top-24 h-56 w-56 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      </div>
      <div className="relative mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {icon ? (
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100">
              {icon}
            </span>
          ) : null}
          <h3 className="text-base font-semibold text-white">{title}</h3>
        </div>
        {right ? <div className="text-xs text-slate-300">{right}</div> : null}
      </div>
      <div className="relative text-sm text-slate-200">{children}</div>
    </div>
  );
}

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-slate-100">
      {children}
    </span>
  );
}

function SkeletonCard({ title }: { title: string }) {
  return (
    <div className="animate-pulse rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="h-4 w-16 rounded bg-white/10" />
      </div>
      <div className="h-5 w-3/4 rounded bg-white/10" />
      <div className="mt-3 space-y-2">
        <div className="h-3 w-full rounded bg-white/10" />
        <div className="h-3 w-11/12 rounded bg-white/10" />
        <div className="h-3 w-10/12 rounded bg-white/10" />
      </div>
    </div>
  );
}

export default function HomePage() {
  const [form, setForm] = useState<FormState>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<MealPlanResponse | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const supabase = createSupabaseBrowserClient();
  const toastTimer = useRef<number | null>(null);

  const ingredientsList = useMemo(() => {
    return form.ingredients
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 40);
  }, [form.ingredients]);

  const goalLabel = useMemo(() => {
    switch (form.goal) {
      case "weight_loss":
        return "Weight loss";
      case "muscle_gain":
        return "Muscle gain";
      case "maintenance":
        return "Maintenance";
    }
  }, [form.goal]);

  const dietLabel = useMemo(() => {
    switch (form.dietType) {
      case "non_vegetarian":
        return "Non-veg";
      case "vegetarian":
        return "Vegetarian";
      case "vegan":
        return "Vegan";
    }
  }, [form.dietType]);

  function showToast(msg: string) {
    setToast(msg);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  }

  async function copyText(text: string, successMsg: string) {
    try {
      await navigator.clipboard.writeText(text);
      showToast(successMsg);
    } catch {
      showToast("Copy failed (browser permission).");
    }
  }

  async function onSubmit(e: React.FormEvent) {
  e.preventDefault();
  setLoading(true);
  setError(null);
  setResult(null);

  try {
    const res = await fetch("/api/mealplan", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        goal: form.goal,
        dietType: form.dietType,
        cookingTimeMinutes: form.cookingTimeMinutes,
        caloriesTarget: form.caloriesTarget,
        ingredientsAvailable: ingredientsList,
      }),
    });

    const data = await res.json().catch(() => ({}));

    console.log("🔥 FULL API RESPONSE:", data);

    if (!res.ok) {
      throw new Error(data?.error || "Request failed");
    }

    // ✅ HANDLE MULTIPLE API FORMATS
    const meals = data?.meals ?? data;

    const mapMeal = (meal: any) => ({
      name:
        meal?.name ??
        meal?.title ??
        meal?.mealName ??
        "N/A",

      calories:
        meal?.calories ??
        meal?.kcal ??
        meal?.energy ??
        0,

      timeMinutes:
        meal?.timeMinutes ??
        meal?.time ??
        meal?.duration ??
        0,

      steps:
        meal?.steps ??
        meal?.instructions ??
        meal?.method ??
        [],
    });

    const safeData: MealPlanResponse = {
      breakfast: mapMeal(meals?.breakfast),
      lunch: mapMeal(meals?.lunch),
      dinner: mapMeal(meals?.dinner),
      snack: mapMeal(meals?.snack),

      dailyTotals: {
        calories:
          data?.dailyTotals?.calories ??
          data?.totals?.calories ??
          data?.nutrition?.calories ??
          0,

        proteinGrams:
          data?.dailyTotals?.proteinGrams ??
          data?.totals?.protein ??
          data?.nutrition?.protein ??
          0,

        carbsGrams:
          data?.dailyTotals?.carbsGrams ??
          data?.totals?.carbs ??
          data?.nutrition?.carbs ??
          0,

        fatGrams:
          data?.dailyTotals?.fatGrams ??
          data?.totals?.fat ??
          data?.nutrition?.fat ??
          0,
      },

      groceryList: Array.isArray(data?.groceryList)
        ? data.groceryList
        : Array.isArray(data?.groceries)
        ? data.groceries
        : Array.isArray(data?.ingredients)
        ? data.ingredients.map((i: any) => ({
            item: i,
            quantity: "",
          }))
        : [],
    };

    console.log("✅ FINAL UI DATA:", safeData);

    setResult(safeData);

    // ✅ SAVE TO DB
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      await supabase.from("meal_history").insert({
        user_id: user.id,
        meal_plan: JSON.stringify(safeData),
      });
    }
  } catch (err) {
    console.error(err);
    setError(err instanceof Error ? err.message : "Something went wrong.");
  } finally {
    setLoading(false);
  }
}

  const calorieMeter = useMemo(() => {
    if (!result) return null;
    const target = Math.max(1, form.caloriesTarget);
    const actual = result?.dailyTotals?.calories ?? 0;
    const ratio = actual / target;
    const pct = Math.max(0, Math.min(120, Math.round(ratio * 100)));
    const within = Math.abs(actual - target) / target <= 0.1;
    const tone = within ? "bg-emerald-400" : actual > target ? "bg-amber-400" : "bg-cyan-400";
    return { target, actual, pct, within, tone };
  }, [result, form.caloriesTarget]);

  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full bg-cyan-400/15 blur-3xl" />
        <div className="absolute -bottom-56 left-1/2 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,255,255,0.06),transparent_55%)]" />
      </div>

      <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
        <header className="mb-10 flex flex-col gap-6">
          <div className="flex items-center justify-between gap-4">
            <div className="inline-flex items-center gap-2">
              <span className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold tracking-wide text-slate-200 shadow-soft">
                <span className="inline-flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-300/90 to-cyan-300/90 text-slate-950">
                  <Icon name="spark" className="h-4 w-4" />
                </span>
                QuickMeal AI
              </span>
            </div>
            <div className="hidden items-center gap-2 text-xs text-slate-300 sm:flex">
              <Pill>
                <Icon name="target" className="h-3.5 w-3.5" />
                {goalLabel}
              </Pill>
              <Pill>
                <Icon name="leaf" className="h-3.5 w-3.5" />
                {dietLabel}
              </Pill>
              <Pill>
                <Icon name="clock" className="h-3.5 w-3.5" />
                {form.cookingTimeMinutes} min
              </Pill>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div className="space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
                Fast meal plans that feel like a fitness app.
              </h1>
              <p className="max-w-2xl text-sm text-slate-300 sm:text-base">
                Pick your goal and time. We’ll generate a clean, structured day plan with calories, steps, and a grocery list.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Pill>
                  <Icon name="bolt" className="h-3.5 w-3.5" />
                  Under {form.cookingTimeMinutes} minutes per meal
                </Pill>
                <Pill>
                  <Icon name="leaf" className="h-3.5 w-3.5" />
                  Whole-food focused
                </Pill>
                <Pill>
                  <Icon name="target" className="h-3.5 w-3.5" />
                  Calorie-targeted day
                </Pill>
              </div>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
              <div className="text-xs font-medium text-slate-300">Today’s target</div>
              <div className="mt-1 flex items-end justify-between gap-3">
                <div className="text-2xl font-semibold text-white">{form.caloriesTarget}</div>
                <div className="text-xs text-slate-400">kcal/day</div>
              </div>
              <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full w-[55%] rounded-full bg-gradient-to-r from-emerald-300 to-cyan-300"
                  style={{ width: "55%" }}
                />
              </div>
              <div className="mt-3 text-xs text-slate-300">
                Tip: add ingredients you already have to reduce grocery items.
              </div>
            </div>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-6 shadow-soft">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-white">Your preferences</h2>
                <p className="mt-1 text-sm text-slate-300">Dial in goal, diet, time and calories.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2">
                <Pill>
                  <Icon name="target" className="h-3.5 w-3.5" />
                  {goalLabel}
                </Pill>
                <Pill>
                  <Icon name="leaf" className="h-3.5 w-3.5" />
                  {dietLabel}
                </Pill>
              </div>
            </div>
          <form className="space-y-4" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <div className="text-xs font-medium text-slate-300">Goal</div>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 transition focus:border-white/25 focus:bg-slate-950/55"
                  value={form.goal}
                  onChange={(e) => setForm((p) => ({ ...p, goal: e.target.value as FormState["goal"] }))}
                >
                  <option value="weight_loss">Weight loss</option>
                  <option value="muscle_gain">Muscle gain</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </label>

              <label className="space-y-2">
                <div className="text-xs font-medium text-slate-300">Diet type</div>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 transition focus:border-white/25 focus:bg-slate-950/55"
                  value={form.dietType}
                  onChange={(e) => setForm((p) => ({ ...p, dietType: e.target.value as FormState["dietType"] }))}
                >
                  <option value="non_vegetarian">Non-vegetarian</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </label>

              <label className="space-y-2">
                <div className="text-xs font-medium text-slate-300">Cooking time</div>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 outline-none ring-0 transition focus:border-white/25 focus:bg-slate-950/55"
                  value={form.cookingTimeMinutes}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, cookingTimeMinutes: Number(e.target.value) as FormState["cookingTimeMinutes"] }))
                  }
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={20}>20 minutes</option>
                </select>
              </label>

              <label className="space-y-2">
                <div className="text-xs font-medium text-slate-300">Calories target (daily)</div>
                <input
                  type="number"
                  min={800}
                  max={5000}
                  step={50}
                  className="w-full rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-white/25 focus:bg-slate-950/55"
                  value={form.caloriesTarget}
                  onChange={(e) => setForm((p) => ({ ...p, caloriesTarget: Number(e.target.value || 0) }))}
                />
              </label>
            </div>

            <label className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <div className="text-xs font-medium text-slate-300">Ingredients at home</div>
                <div className="text-xs text-slate-400">{ingredientsList.length}/40</div>
              </div>
              <textarea
                rows={4}
                className="w-full resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-3 py-2.5 text-sm text-slate-100 outline-none transition focus:border-white/25 focus:bg-slate-950/55"
                value={form.ingredients}
                onChange={(e) => setForm((p) => ({ ...p, ingredients: e.target.value }))}
                placeholder="e.g., eggs, spinach, oats, yogurt..."
              />
              <div className="flex flex-wrap gap-2 pt-1">
                {ingredientsList.slice(0, 10).map((ing) => (
                  <Pill key={ing}>{ing}</Pill>
                ))}
                {ingredientsList.length > 10 ? <Pill>+{ingredientsList.length - 10} more</Pill> : null}
              </div>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-300 to-cyan-300 px-4 py-3 text-sm font-semibold text-slate-950 shadow-soft transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70"
              >
                <Icon name="spark" className="h-4 w-4" />
                {loading ? "Generating…" : "Generate meal plan"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => {
                  setForm(defaultForm);
                  setResult(null);
                  setError(null);
                  showToast("Reset to defaults");
                }}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-white/90 transition hover:border-white/20 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-70"
              >
                Reset
              </button>
            </div>

            {error ? (
              <div className="rounded-3xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-100">
                <div className="font-semibold text-red-100">Couldn’t generate a plan</div>
                <pre className="mt-2 whitespace-pre-wrap break-words text-xs text-red-100/90">{error}</pre>
              </div>
            ) : null}
          </form>
          </section>

          <section className="space-y-4">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Meal plan</h2>
                  <p className="text-sm text-slate-300">Your day plan appears here, with steps and grocery list.</p>
                </div>
                {result ? (
                  <button
                    type="button"
                    onClick={() => copyText(JSON.stringify(result, null, 2), "Copied JSON")}
                    className="hidden sm:inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10"
                  >
                    Copy JSON
                  </button>
                ) : null}
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="text-xs text-slate-400">Goal</div>
                  <div className="mt-1 font-semibold text-white">{goalLabel}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="text-xs text-slate-400">Diet</div>
                  <div className="mt-1 font-semibold text-white">{dietLabel}</div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                  <div className="text-xs text-slate-400">Max cook time</div>
                  <div className="mt-1 font-semibold text-white">{form.cookingTimeMinutes} min</div>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SkeletonCard title="Breakfast" />
                  <SkeletonCard title="Lunch" />
                  <SkeletonCard title="Dinner" />
                  <SkeletonCard title="Snack" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <SkeletonCard title="Daily totals" />
                  <SkeletonCard title="Grocery list" />
                </div>
              </div>
            ) : null}

            {result ? (
              <div className="grid gap-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Card
                    title="Breakfast"
                    icon={<Icon name="bolt" className="h-4 w-4" />}
                    right={
                      <span className="inline-flex items-center gap-2">
                        <Pill>{result.breakfast.calories} kcal</Pill>
                        <Pill>
                          <Icon name="clock" className="h-3.5 w-3.5" />
                          {result.breakfast.timeMinutes}m
                        </Pill>
                      </span>
                    }
                  >
                    <div className="font-medium text-white">{result.breakfast.name}</div>
                    <details className="mt-3">
                      <summary className="cursor-pointer select-none text-xs font-semibold text-slate-100/90">
                        View steps
                      </summary>
                      <ol className="mt-3 space-y-2 text-sm text-slate-200">
                        {result.breakfast.steps.map((s: string, i: number) => (
                            <li key={`breakfast-step-${i}`} className="flex gap-2">
                              <span className="font-semibold text-cyan-300">{i + 1}.</span>
                              <span>{s}</span>
                            </li>
                          ))}
                      </ol>
                    </details>
                  </Card>

                  <Card
                    title="Lunch"
                    icon={<Icon name="leaf" className="h-4 w-4" />}
                    right={
                      <span className="inline-flex items-center gap-2">
                        <Pill>{result.lunch.calories} kcal</Pill>
                        <Pill>
                          <Icon name="clock" className="h-3.5 w-3.5" />
                          {result.lunch.timeMinutes}m
                        </Pill>
                      </span>
                    }
                  >
                    <div className="font-medium text-white">{result.lunch.name}</div>
                    <details className="mt-3">
                      <summary className="cursor-pointer select-none text-xs font-semibold text-slate-100/90">
                        View steps
                      </summary>
                      <ol className="mt-3 space-y-2 text-sm text-slate-200">
                        {result.lunch.steps.map((s: string, i: number) => (
                          <li key={`lunch-step-${i}`}className="flex gap-2">
                          <span className="font-semibold text-cyan-300">{i + 1}.</span>
                              <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </Card>

                  <Card
                    title="Dinner"
                    icon={<Icon name="target" className="h-4 w-4" />}
                    right={
                      <span className="inline-flex items-center gap-2">
                        <Pill>{result.dinner.calories} kcal</Pill>
                        <Pill>
                          <Icon name="clock" className="h-3.5 w-3.5" />
                          {result.dinner.timeMinutes}m
                        </Pill>
                      </span>
                    }
                  >
                    <div className="font-medium text-white">{result.dinner.name}</div>
                    <details className="mt-3">
                      <summary className="cursor-pointer select-none text-xs font-semibold text-slate-100/90">
                        View steps
                      </summary>
                      <ol className="mt-3 space-y-2 text-sm text-slate-200">
                        {result.dinner.steps.map((s: string, i: number) => (
                          <li key={`dinner-step-${i}` }className="flex gap-2">
                          <span className="font-semibold text-cyan-300">{i + 1}.</span>
                          <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </Card>

                  <Card
                    title="Snack"
                    icon={<Icon name="spark" className="h-4 w-4" />}
                    right={
                      <span className="inline-flex items-center gap-2">
                        <Pill>{result.snack.calories} kcal</Pill>
                        <Pill>
                          <Icon name="clock" className="h-3.5 w-3.5" />
                          {result.snack.timeMinutes}m
                        </Pill>
                      </span>
                    }
                  >
                    <div className="font-medium text-white">{result.snack.name}</div>
                    <details className="mt-3">
                      <summary className="cursor-pointer select-none text-xs font-semibold text-slate-100/90">
                        View steps
                      </summary>
                      <ol className="mt-3 space-y-2 text-sm text-slate-200">
                        {result.snack.steps.map((s: string, i: number) => (
                          <li key={`snack-step-${i}`} className="flex gap-2">
                            <span className="font-semibold text-cyan-300">{i + 1}.</span>
                             <span>{s}</span>
                          </li>
                        ))}
                      </ol>
                    </details>
                  </Card>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Card title="Daily totals" icon={<Icon name="target" className="h-4 w-4" />}>
                    <div className="flex flex-wrap gap-2">
                      <Pill>Total: {result.dailyTotals.calories} kcal</Pill>
                      <Pill>Protein: {result.dailyTotals.proteinGrams} g</Pill>
                      <Pill>Carbs: {result.dailyTotals.carbsGrams} g</Pill>
                      <Pill>Fat: {result.dailyTotals.fatGrams} g</Pill>
                    </div>

                    {calorieMeter ? (
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-300">
                          <span>
                            Target: <span className="text-white">{calorieMeter.target}</span>
                          </span>
                          <span>
                            Actual: <span className="text-white">{calorieMeter.actual}</span>
                          </span>
                        </div>
                        <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${calorieMeter.tone}`}
                            style={{ width: `${calorieMeter.pct}%` }}
                          />
                        </div>
                        <div className="mt-2 text-xs text-slate-300">
                          {calorieMeter.within ? "On target (±10%)." : "Adjust portions to get closer to target."}
                        </div>
                      </div>
                    ) : null}
                  </Card>

                  <Card
                    title="Grocery list"
                    icon={<Icon name="leaf" className="h-4 w-4" />}
                    right={
                      <button
                        type="button"
                        onClick={() =>
                          copyText(
                            result.groceryList.map((g) => `${g.item}${g.quantity ? ` — ${g.quantity}` : ""}`).join("\n"),
                            "Copied grocery list"
                          )
                        }
                        className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10"
                      >
                        Copy list
                      </button>
                    }
                  >
                    <ul className="space-y-2">
                      {result.groceryList.map((g, i) => (
                      <li
                        key={`grocery-${g.item}-${i}`}
                        className="flex items-start justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2"
                      >
                        <span className="text-white">{g.item}</span>
                        {g.quantity ? (
                          <span className="text-xs text-slate-300">{g.quantity}</span>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </li>
                    ))}
                    </ul>
                  </Card>
                </div>

                <details className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-soft">
                  <summary className="cursor-pointer select-none text-sm font-semibold text-white">
                    View raw JSON
                  </summary>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyText(JSON.stringify(result, null, 2), "Copied JSON")}
                      className="inline-flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-slate-100 transition hover:border-white/20 hover:bg-white/10"
                    >
                      Copy JSON
                    </button>
                  </div>
                  <pre className="mt-3 overflow-auto rounded-2xl bg-slate-950/50 p-4 text-xs text-slate-200">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </details>
              </div>
            ) : null}
          </section>
        </div>
      </div>

      {toast ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-5 z-50 flex justify-center px-4">
          <div className="pointer-events-auto rounded-2xl border border-white/10 bg-slate-950/80 px-4 py-2 text-xs font-semibold text-slate-100 shadow-soft backdrop-blur">
            {toast}
          </div>
        </div>
      ) : null}
    </main>
  );
}

