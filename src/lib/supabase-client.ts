import { createBrowserClient } from "@supabase/ssr";
import { supabaseAnonKey, supabaseUrl, type Database } from "@/lib/supabase";

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database, "public">(supabaseUrl, supabaseAnonKey);
}
