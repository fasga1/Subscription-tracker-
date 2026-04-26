import { differenceInCalendarDays, format, parseISO } from "date-fns";
import { ru } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Group, Subscription } from "@/types";

interface SubscriptionCardProps {
  subscription: Subscription;
  groups: Group[];
  onEdit: (subscription: Subscription) => void;
  onDelete: (subscriptionId: string) => Promise<void>;
  isSubmitting: boolean;
}

function getReadableGroupName(name: string | undefined, id: string): string {
  const trimmedName = (name ?? "").trim();
  const isMachineLike = /^[a-z0-9-]{20,}$/i.test(trimmedName);
  if (!trimmedName || isMachineLike) {
    return `Группа ${id.slice(0, 6)}`;
  }

  return trimmedName;
}

function getBillingCycleLabel(cycle: Subscription["billing_cycle"]): string {
  switch (cycle) {
    case "daily":
      return "день";
    case "monthly":
      return "месяц";
    case "yearly":
      return "год";
    default:
      return cycle;
  }
}

export function SubscriptionCard({
  subscription,
  groups,
  onEdit,
  onDelete,
  isSubmitting,
}: SubscriptionCardProps) {
  const matchedGroup = groups.find((group) => group.id === subscription.group_id);
  const groupName = getReadableGroupName(matchedGroup?.name, subscription.group_id);
  const billingDate = format(parseISO(subscription.next_billing_date), "d MMMM yyyy", {
    locale: ru,
  });
  const daysLeft = differenceInCalendarDays(
    parseISO(subscription.next_billing_date),
    new Date()
  );
  const urgencyClassName =
    daysLeft < 0
      ? "bg-destructive/10 text-destructive"
      : daysLeft < 3
        ? "bg-destructive/10 text-destructive"
        : daysLeft < 7
          ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"
          : "bg-muted text-muted-foreground";
  const urgencyLabel =
    daysLeft < 0
      ? "Просрочено"
      : daysLeft === 0
        ? "Сегодня"
        : `Через ${daysLeft} дн.`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between gap-2">
          <span>{subscription.service_name}</span>
          <Badge variant={subscription.is_active ? "default" : "secondary"}>
            {subscription.is_active ? "Активна" : "Отключена"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-sm text-muted-foreground">Группа: {groupName}</p>
        <p className="text-sm">
          {subscription.cost} {subscription.currency} /{" "}
          {getBillingCycleLabel(subscription.billing_cycle)}
        </p>
        <p className="text-sm text-muted-foreground">
          Следующее списание: {billingDate}
        </p>
        <Badge className={urgencyClassName} variant="outline">
          {urgencyLabel}
        </Badge>
        {subscription.payment_url ? (
          <a
            className="text-sm text-primary underline underline-offset-4"
            href={subscription.payment_url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Открыть оплату
          </a>
        ) : (
          <p className="text-sm text-muted-foreground">Ссылка на оплату не указана</p>
        )}
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button onClick={() => onEdit(subscription)} size="sm" variant="outline">
          Редактировать
        </Button>
        <Button
          disabled={isSubmitting}
          onClick={() => void onDelete(subscription.id)}
          size="sm"
          variant="destructive"
        >
          Удалить
        </Button>
      </CardFooter>
    </Card>
  );
}
