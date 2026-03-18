"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

export default function UpdatePasswordPage() {
  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  // 🔐 PASSWORD REGEX
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  const isValidPassword = passwordRegex.test(password);
  const isMatch = password === confirmPassword;

  async function handleUpdate() {
    if (!isValidPassword) {
      setMessage("❌ Password does not meet requirements");
      return;
    }

    if (!isMatch) {
      setMessage("❌ Passwords do not match");
      return;
    }

    setLoading(true);

    const supabase = createSupabaseBrowserClient();

    const { error } = await supabase.auth.updateUser({
      password,
    });

    setLoading(false);

    if (error) {
      setMessage("❌ " + error.message);
    } else {
      setMessage("✅ Password updated successfully!");
      setTimeout(() => router.push("/login"), 2000);
    }
  }

  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-black via-gray-900 to-gray-800">
      <div className="w-full max-w-md px-4">
        <div className="rounded-3xl border border-white/10 bg-white/10 backdrop-blur-lg p-8 shadow-xl">
          <h1 className="text-white text-xl font-semibold text-center mb-6">
            Reset Password
          </h1>

          {/* PASSWORD */}
          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password"
              className="w-full p-3 pr-16 rounded-lg bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/30"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400 hover:text-white"
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Confirm password"
            className="w-full p-3 rounded-lg bg-gray-800 text-white placeholder-gray-400 mb-4 focus:outline-none focus:ring-2 focus:ring-white/30"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />

          {/* PASSWORD RULES */}
          <div className="text-sm mb-4 space-y-1">
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

          {/* BUTTON */}
          <button
            onClick={handleUpdate}
            disabled={!isValidPassword || !isMatch || loading}
            className="w-full bg-white text-black p-3 rounded-lg font-medium hover:bg-gray-200 transition disabled:opacity-50"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          {/* MESSAGE */}
          {message && (
            <p className="text-sm mt-4 text-center text-white">{message}</p>
          )}
        </div>
      </div>
    </main>
  );
}