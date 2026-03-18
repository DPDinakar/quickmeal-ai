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
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  // 🔐 PASSWORD REGEX
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const isValidPassword = passwordRegex.test(password);

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
        // ✅ VALIDATE PASSWORD BEFORE SIGNUP
        if (!isValidPassword) {
          setError(
            "Password must be 8+ chars, include uppercase, lowercase, number & special character"
          );
          setLoading(false);
          return;
        }

        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: "http://localhost:3000/login",
          },
        });

        if (err) throw err;

        setMessage("📧 Check your email to verify your account");
        setMode("login");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Auth failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError(null);
    setMessage(null);

    if (!email) {
      setError("Enter your email first");
      return;
    }

    try {
      const supabase = createSupabaseBrowserClient();

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: "http://localhost:3000/update-password",
      });

      if (error) throw error;

      setMessage("📧 Password reset email sent!");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md px-4">
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
          <h1 className="text-2xl text-white font-semibold text-center">
            {title}
          </h1>

          <form className="space-y-4 mt-6" onSubmit={onSubmit}>
            {/* EMAIL */}
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
            />

            {/* PASSWORD */}
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full p-3 pr-16 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>

            {/* PASSWORD RULES (ONLY FOR SIGNUP) */}
            {mode === "signup" && (
              <div className="text-sm space-y-1">
                <p className={password.length >= 8 ? "text-green-400" : "text-gray-400"}>
                  • At least 8 characters
                </p>
                <p className={/[A-Z]/.test(password) ? "text-green-400" : "text-gray-400"}>
                  • One uppercase letter
                </p>
                <p className={/[a-z]/.test(password) ? "text-green-400" : "text-gray-400"}>
                  • One lowercase letter
                </p>
                <p className={/\d/.test(password) ? "text-green-400" : "text-gray-400"}>
                  • One number
                </p>
                <p className={/[@$!%*?&]/.test(password) ? "text-green-400" : "text-gray-400"}>
                  • One special character
                </p>
              </div>
            )}

            {/* BUTTON */}
            <button
              type="submit"
              disabled={loading || (mode === "signup" && !isValidPassword)}
              className="w-full bg-white text-black p-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
            >
              {loading
                ? "Loading..."
                : mode === "login"
                ? "Login"
                : "Signup"}
            </button>

            {/* FORGOT PASSWORD */}
            {mode === "login" && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-400 hover:underline w-full text-left"
              >
                Forgot Password?
              </button>
            )}

            {/* SWITCH MODE */}
            <button
              type="button"
              onClick={() =>
                setMode(mode === "login" ? "signup" : "login")
              }
              className="text-sm text-gray-300"
            >
              {mode === "login"
                ? "Don't have an account? Signup"
                : "Already have an account? Login"}
            </button>

            {/* ERROR / MESSAGE */}
            {error && <p className="text-red-400 text-sm">{error}</p>}
            {message && <p className="text-green-400 text-sm">{message}</p>}
          </form>
        </div>
      </div>
    </main>
  );
}