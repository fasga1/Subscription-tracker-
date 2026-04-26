"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { Button } from "@/components/ui/button";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

export function Header() {
  const router = useRouter();
  const [userInitial, setUserInitial] = useState("?");

  useEffect(() => {
    const supabase = createSupabaseBrowserClient();
    void supabase.auth.getUser().then(({ data }) => {
      const email = data.user?.email ?? "";
      setUserInitial(email ? email.trim().charAt(0).toUpperCase() : "?");
    });
  }, []);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="flex items-center justify-between border-b p-4">
      <p className="text-sm text-muted-foreground">Dashboard</p>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <div className="flex size-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
          {userInitial}
        </div>
        <Button onClick={handleSignOut} size="sm" variant="outline">
          Выйти
        </Button>
      </div>
    </header>
  );
}
