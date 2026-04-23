import { DashboardClient } from "@/components/features/DashboardClient";
import { createSupabaseServerClient } from "@/lib/supabase-server";

export default async function DashboardPage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <p className="text-sm text-muted-foreground">
        Вы вошли как: {user?.email ?? "неизвестный пользователь"}
      </p>
      <DashboardClient />
    </section>
  );
}
