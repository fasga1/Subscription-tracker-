import { NextResponse } from "next/server";
import { ensureProfileExists } from "@/lib/profile";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? url.origin;

  if (code) {
    const supabase = await createSupabaseServerClient();
    await supabase.auth.exchangeCodeForSession(code);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      await ensureProfileExists(supabase, user);
    }
  }

  return NextResponse.redirect(`${appUrl}/dashboard`);
}
