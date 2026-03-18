"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";

export default function UserAvatar() {
  const { avatarUrl, setAvatarUrl } = useUser();
  const [initial, setInitial] = useState("?");

  useEffect(() => {
    async function loadAvatar() {
      const res = await fetch("/api/user-avatar", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.avatar_url) {
        setAvatarUrl(data.avatar_url);
      }

      if (data.email) {
        setInitial(data.email.charAt(0).toUpperCase());
      }
    }

    if (!avatarUrl) {
      loadAvatar();
    }
  }, [avatarUrl, setAvatarUrl]);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center bg-gray-200">
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="font-semibold text-gray-700">
          {initial}
        </span>
      )}
    </div>
  );
}