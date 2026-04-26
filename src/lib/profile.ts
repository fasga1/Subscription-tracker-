import type { SupabaseClient, User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase";

export async function ensureProfileExists(
  supabase: SupabaseClient<Database, "public">,
  user: User
): Promise<void> {
  const profilePayload: Database["public"]["Tables"]["profiles"]["Insert"] = {
    id: user.id,
    email: user.email ?? `${user.id}@local.invalid`,
    full_name:
      (typeof user.user_metadata?.full_name === "string"
        ? user.user_metadata.full_name
        : null) ?? null,
    avatar_url:
      (typeof user.user_metadata?.avatar_url === "string"
        ? user.user_metadata.avatar_url
        : null) ?? null,
  };

  const { error } = await supabase
    .from("profiles")
    .upsert(profilePayload as never, { onConflict: "id" });

  if (error) {
    console.error("Profile bootstrap failed:", error.message);
  }
}
