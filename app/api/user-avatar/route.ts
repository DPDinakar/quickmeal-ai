import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({});
    }

    const { data: profile, error } = await supabase
      .from("profiles")
      .select("avatar_url")
      .eq("id", user.id)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    return NextResponse.json({
      avatar_url: profile?.avatar_url || null,
      email: user.email,
    });
  } catch (err) {
    return NextResponse.json({
      error: "Server error",
    });
  }
}