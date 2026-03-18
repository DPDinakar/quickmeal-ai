"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

type Mode = "login" | "signup";

export default function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const nextPath = params.get("next") || "/";

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const title = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create your account"),
    [mode]
  );

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    try {
      const supabase = createSupabaseBrowserClient();

      if (mode === "login") {
        const { error: err } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (err) throw err;

        router.push(nextPath);
        router.refresh();
      } else {
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
        });

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

      <div className="mx-auto flex w-full max-w-xl flex-col gap-6 px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-7">
          <h1 className="text-2xl text-white">{title}</h1>

          <form className="space-y-4 mt-4" onSubmit={onSubmit}>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="w-full p-2 rounded"
            />

            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full p-2 rounded"
            />

            <button type="submit" className="w-full bg-white text-black p-2 rounded">
              {loading ? "Loading..." : mode === "login" ? "Login" : "Signup"}
            </button>

            <button
              type="button"
              onClick={() => setMode(mode === "login" ? "signup" : "login")}
              className="text-sm text-gray-300"
            >
              Switch to {mode === "login" ? "Signup" : "Login"}
            </button>

            {error && <p className="text-red-400">{error}</p>}
            {message && <p className="text-green-400">{message}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}