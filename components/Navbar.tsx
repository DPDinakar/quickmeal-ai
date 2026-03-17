"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/UserContext";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Navbar() {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);

  const { avatarUrl, setAvatarUrl } = useUser();

  const router = useRouter();

  // ✅ Load user + avatar
  useEffect(() => {
    const loadUser = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      const user = sessionData.session?.user;

      if (user) {
        setUserEmail(user.email ?? null);

        const { data: profile } = await supabase
          .from("profiles")
          .select("avatar_url")
          .eq("id", user.id)
          .single();

        if (profile?.avatar_url) {
          const { data } = supabase
            .storage
            .from("avatars")
            .getPublicUrl(profile.avatar_url);

          setAvatarUrl(data.publicUrl);
        } else {
          setAvatarUrl(null);
        }
      } else {
        setUserEmail(null);
        setAvatarUrl(null);
      }

      setLoading(false);
    };

    loadUser();

    // ✅ Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const user = session?.user;

        if (user) {
          setUserEmail(user.email ?? null);

          const { data: profile } = await supabase
            .from("profiles")
            .select("avatar_url")
            .eq("id", user.id)
            .single();

          if (profile?.avatar_url) {
            const { data } = supabase
              .storage
              .from("avatars")
              .getPublicUrl(profile.avatar_url);

            setAvatarUrl(data.publicUrl);
          } else {
            setAvatarUrl(null);
          }
        } else {
          setUserEmail(null);
          setAvatarUrl(null);
        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  // ✅ Close dropdown
  useEffect(() => {
    const handleClickOutside = () => setOpen(false);
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  // ✅ Logout fix
  const logout = async () => {
    await supabase.auth.signOut();

    setUserEmail(null);
    setAvatarUrl(null);

    window.location.href = "/login";
  };

  const initial = userEmail
    ? userEmail.charAt(0).toUpperCase()
    : "?";

  return (
    <nav className="flex justify-between items-center px-6 py-4 border-b border-gray-800">
      <Link href="/" className="text-xl font-bold">
        QuickMeal AI
      </Link>

      <div className="relative z-50">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpen(!open);
          }}
          className="w-10 h-10 rounded-full overflow-hidden bg-gray-700 flex items-center justify-center"
        >
          {avatarUrl ? (
            <img
              src={avatarUrl}
              className="w-full h-full object-cover"
              alt="avatar"
            />
          ) : (
            <span className="text-white font-bold">
              {loading ? "..." : initial}
            </span>
          )}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-52 bg-slate-900 border border-gray-700 rounded-lg shadow-lg">
            {userEmail && (
              <div className="px-4 py-2 text-xs text-gray-400 border-b border-gray-700">
                Signed in as
                <div className="text-white text-sm truncate">
                  {userEmail}
                </div>
              </div>
            )}

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                router.push("/account");
              }}
              className="block w-full text-left px-4 py-2 hover:bg-slate-800"
            >
              Account
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpen(false);
                router.push("/history");
              }}
              className="block w-full text-left px-4 py-2 hover:bg-slate-800"
            >
              Login History
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                logout();
              }}
              className="block w-full text-left px-4 py-2 hover:bg-slate-800 text-red-400"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}