import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data } = await supabase.auth.getUser();

  if (!data?.user) {
    return NextResponse.json({});
  }

  const userId = data.user.id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("avatar_url")
    .eq("id", userId)
    .single();

  return NextResponse.json({
    avatar_url: profile?.avatar_url || null,
    email: data.user.email,
  });
}