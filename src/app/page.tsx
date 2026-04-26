import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createSupabaseServerClient } from "@/lib/supabase-server";

function getUserInitial(email: string | undefined): string {
  if (!email) {
    return "?";
  }

  return email.trim().charAt(0).toUpperCase();
}

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between p-4">
          <p className="text-sm font-medium">Subscription Tracker</p>
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {getUserInitial(user.email)}
              </div>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Открыть дашборд
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "sm", variant: "outline" }))}
              >
                Зарегистрироваться
              </Link>
              <Link
                href="/login"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                Войти
              </Link>
            </div>
          )}
        </div>
      </header>

      <section className="container mx-auto p-6 md:p-10">
        <div className="mx-auto max-w-2xl rounded-2xl border p-6 md:p-8">
          <h1 className="text-2xl font-semibold">Управляйте подписками в одном месте</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            Добавляйте сервисы, группируйте расходы, отслеживайте ближайшие
            списания и открывайте ссылки на оплату за пару кликов.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link
              href={user ? "/dashboard" : "/login"}
              className={cn(buttonVariants())}
            >
              {user ? "Перейти в дашборд" : "Начать работу"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
