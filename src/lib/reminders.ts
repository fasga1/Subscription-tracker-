import { addDays, differenceInCalendarDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Resend } from "resend";
import { createSupabaseAdminClient } from "@/lib/supabase-admin";
import type { Subscription } from "@/types";

interface ReminderTarget {
  subscription: Subscription;
  email: string;
  daysLeft: number;
}

function getReminderWindow() {
  const today = new Date();
  return {
    from: format(today, "yyyy-MM-dd"),
    to: format(addDays(today, 7), "yyyy-MM-dd"),
  };
}

function daysToNotify(daysLeft: number): boolean {
  return [7, 3, 1, 0].includes(daysLeft);
}

function buildReminderHtml(target: ReminderTarget): string {
  const billingDate = format(
    parseISO(target.subscription.next_billing_date),
    "d MMMM yyyy",
    {
      locale: ru,
    }
  );

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #0f172a;">
      <h2 style="margin-bottom: 8px;">Напоминание о списании</h2>
      <p>Сервис: <strong>${target.subscription.service_name}</strong></p>
      <p>Дата списания: <strong>${billingDate}</strong></p>
      <p>Сумма: <strong>${target.subscription.cost} ${target.subscription.currency}</strong></p>
      <p>Осталось дней: <strong>${target.daysLeft}</strong></p>
      ${
        target.subscription.payment_url
          ? `<p><a href="${target.subscription.payment_url}" target="_blank" rel="noopener noreferrer">Перейти к оплате</a></p>`
          : ""
      }
    </div>
  `;
}

async function fetchReminderTargets(): Promise<ReminderTarget[]> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client is not configured.");
  }

  const window = getReminderWindow();
  const { data: subscriptionsRaw, error: subscriptionsError } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("is_active", true)
    .gte("next_billing_date", window.from)
    .lte("next_billing_date", window.to);

  if (subscriptionsError) {
    throw new Error(subscriptionsError.message);
  }

  const subscriptions = (subscriptionsRaw ?? []) as Subscription[];

  if (subscriptions.length === 0) {
    return [];
  }

  const ownerIds = Array.from(
    new Set(subscriptions.map((item) => item.owner_id).filter(Boolean))
  ) as string[];

  if (ownerIds.length === 0) {
    return [];
  }

  const { data: profilesRaw, error: profilesError } = await supabase
    .from("profiles")
    .select("id,email")
    .in("id", ownerIds);

  if (profilesError) {
    throw new Error(profilesError.message);
  }

  const profiles = (profilesRaw ?? []) as Array<{ id: string; email: string }>;
  const emailByUser = new Map(profiles.map((profile) => [profile.id, profile.email]));

  return subscriptions
    .map((subscription) => {
      const daysLeft = differenceInCalendarDays(
        parseISO(subscription.next_billing_date),
        new Date()
      );
      const email = subscription.owner_id ? emailByUser.get(subscription.owner_id) : undefined;

      if (!email || !daysToNotify(daysLeft)) {
        return null;
      }

      return {
        subscription,
        email,
        daysLeft,
      } satisfies ReminderTarget;
    })
    .filter((item): item is ReminderTarget => Boolean(item));
}

export async function sendBillingReminders() {
  const apiKey = process.env.RESEND_API_KEY ?? "";
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? "";

  if (!apiKey || !fromEmail) {
    throw new Error("Resend is not configured.");
  }

  const reminderTargets = await fetchReminderTargets();
  if (reminderTargets.length === 0) {
    return {
      sent: 0,
      skipped: 0,
    };
  }

  const resend = new Resend(apiKey);
  let sent = 0;
  let skipped = 0;

  for (const target of reminderTargets) {
    try {
      await resend.emails.send({
        from: fromEmail,
        to: target.email,
        subject: `Напоминание: ${target.subscription.service_name}`,
        html: buildReminderHtml(target),
      });
      sent += 1;
    } catch (error) {
      console.error("Reminder send failed:", error);
      skipped += 1;
    }
  }

  return {
    sent,
    skipped,
  };
}
