"use client";

import { useState } from "react";
import { useUser } from "@/context/UserContext";

export default function AvatarUpload({
  currentAvatar,
}: {
  currentAvatar: string | null;
}) {
  const [avatar, setLocalAvatar] = useState<string | null>(currentAvatar);
  const [uploading, setUploading] = useState(false);

  // ✅ Global context
  const { setAvatarUrl } = useUser();

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/upload-avatar", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (data.avatar_url) {
        // ✅ Prevent caching issue
        const newAvatar = `${data.avatar_url}?t=${Date.now()}`;

        // ✅ Update local UI
        setLocalAvatar(newAvatar);

        // ✅ Update global state → Navbar updates instantly
        setAvatarUrl(newAvatar);
      }
    } catch (err) {
      console.error("Upload error:", err);
    }

    setUploading(false);
  }

  return (
    <div className="flex flex-col items-center gap-4">

      {/* Avatar Preview */}
      <div className="w-32 h-32 rounded-full overflow-hidden border border-gray-700">
        {avatar ? (
          <img
            src={avatar}
            className="w-full h-full object-cover"
            alt="avatar"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-full text-3xl">
            ?
          </div>
        )}
      </div>

      {/* Upload Button */}
      <label className="cursor-pointer bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
        {uploading ? "Uploading..." : "Change Avatar"}

        <input
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleUpload}
        />
      </label>
    </div>
  );
}