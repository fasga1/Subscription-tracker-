"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export function Header() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b p-4">
      <p className="text-sm text-muted-foreground">Dashboard</p>
      <Button onClick={handleSignOut} size="sm" variant="outline">
        Выйти
      </Button>
    </header>
  );
}
