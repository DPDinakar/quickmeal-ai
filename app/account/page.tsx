import AvatarUpload from "@/components/AvatarUpload";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export default async function AccountPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", user?.id)
    .single();

  return (
    <div className="p-10">

      <h1 className="text-2xl font-bold mb-6">
        My Account
      </h1>

      <AvatarUpload currentAvatar={profile?.avatar_url} />

    </div>
  );
}