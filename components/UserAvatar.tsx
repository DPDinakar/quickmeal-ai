"use client";

import { useEffect, useState } from "react";
import { useAvatar } from "./AvatarContext";

export default function UserAvatar() {
  const { avatar, setAvatar } = useAvatar();
  const [initial, setInitial] = useState("?");

  useEffect(() => {
    async function loadAvatar() {
      const res = await fetch("/api/user-avatar", {
        cache: "no-store",
      });

      const data = await res.json();

      if (data.avatar_url) {
        setAvatar(data.avatar_url);
      }

      if (data.email) {
        setInitial(data.email.charAt(0).toUpperCase());
      }
    }

    if (!avatar) {
      loadAvatar();
    }
  }, [avatar, setAvatar]);

  return (
    <div className="w-10 h-10 rounded-full overflow-hidden border flex items-center justify-center bg-gray-200">

      {avatar ? (
        <img
          src={avatar}
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