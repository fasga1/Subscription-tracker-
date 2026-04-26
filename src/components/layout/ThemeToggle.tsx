"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

type ThemeMode = "light" | "dark";

function detectInitialTheme(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedTheme = window.localStorage.getItem("theme");
  if (savedTheme === "light" || savedTheme === "dark") {
    return savedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      const initialTheme = detectInitialTheme();
      setTheme(initialTheme);
      setMounted(true);
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    document.documentElement.classList.toggle("dark", theme === "dark");
    window.localStorage.setItem("theme", theme);
  }, [mounted, theme]);

  function toggleTheme() {
    const nextTheme: ThemeMode = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
  }

  return (
    <Button
      aria-label={
        !mounted
          ? "Переключить тему"
          : theme === "light"
            ? "Включить темную тему"
            : "Включить светлую тему"
      }
      onClick={toggleTheme}
      size="icon-sm"
      variant="outline"
    >
      {!mounted || theme === "light" ? <MoonIcon /> : <SunIcon />}
    </Button>
  );
}
