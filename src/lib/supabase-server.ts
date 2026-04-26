import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { supabaseAnonKey, supabaseUrl, type Database } from "@/lib/supabase";

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database, "public">(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          try {
            cookieStore.set(name, value, options);
          } catch {
            // In server components cookie mutation is not allowed. This method
            // is also used in route handlers where set() works, so we silently
            // ignore only the disallowed runtime case.
          }
        });
      },
    },
  });
}
