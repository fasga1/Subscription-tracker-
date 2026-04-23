import { createClient } from "@supabase/supabase-js";
import { supabaseUrl, type Database } from "@/lib/supabase";

const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function createSupabaseAdminClient() {
  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient<Database, "public">(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
