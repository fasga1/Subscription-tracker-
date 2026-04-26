"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";

const authSchema = z.object({
  email: z.email("Укажите корректный email"),
  password: z.string().min(6, "Пароль должен быть минимум 6 символов"),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function LoginPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function signIn(values: AuthFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  async function signUp(values: AuthFormValues) {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createSupabaseBrowserClient();
    const emailRedirectTo =
      process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ??
      `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signUp({
      ...values,
      options: {
        emailRedirectTo,
      },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
      return;
    }

    setSuccessMessage(
      "Регистрация выполнена. Проверьте email для подтверждения аккаунта."
    );
    setIsLoading(false);
  }

  async function signInWithGoogle() {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createSupabaseBrowserClient();
    const redirectTo =
      process.env.NEXT_PUBLIC_SUPABASE_REDIRECT_URL ??
      `${window.location.origin}/auth/callback`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });

    if (error) {
      setErrorMessage(error.message);
      setIsLoading(false);
    }
  }

  return (
    <main className="container mx-auto flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Вход в Subscription Tracker</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(signIn)}
            noValidate
          >
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" {...form.register("email")} />
              {form.formState.errors.email ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.email.message}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Пароль</Label>
              <Input
                id="password"
                type="password"
                {...form.register("password")}
              />
              {form.formState.errors.password ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.password.message}
                </p>
              ) : null}
            </div>

            {errorMessage ? (
              <p className="text-sm text-destructive">{errorMessage}</p>
            ) : null}
            {successMessage ? (
              <p className="text-sm text-green-600 dark:text-green-400">
                {successMessage}
              </p>
            ) : null}

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button disabled={isLoading} type="submit">
                Войти
              </Button>
              <Button
                disabled={isLoading}
                type="button"
                variant="secondary"
                onClick={form.handleSubmit(signUp)}
              >
                Регистрация
              </Button>
            </div>

            <Button
              className="w-full"
              disabled={isLoading}
              type="button"
              variant="outline"
              onClick={signInWithGoogle}
            >
              Войти через Google
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
