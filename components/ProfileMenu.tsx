"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function ProfileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // close dropdown when route changes
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400 text-black font-bold"
      >
        {email[0].toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-white/10 bg-slate-900 shadow-lg z-50">

          <div className="border-b border-white/10 px-4 py-3 text-xs text-slate-300">
            {email}
          </div>

          <Link href="/account" className="block px-4 py-2 text-sm hover:bg-white/5">
            Account
          </Link>

          <Link href="/history" className="block px-4 py-2 text-sm hover:bg-white/5">
            History
          </Link>

          <Link href="/logout" className="block px-4 py-2 text-sm hover:bg-white/5">
            Logout
          </Link>

        </div>
      )}
    </div>
  );
}