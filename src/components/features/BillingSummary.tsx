import { differenceInCalendarDays, parseISO } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Subscription } from "@/types";

interface BillingSummaryProps {
  subscriptions: Subscription[];
}

function toMonthlyCost(subscription: Subscription): number {
  switch (subscription.billing_cycle) {
    case "daily":
      return subscription.cost * 30;
    case "monthly":
      return subscription.cost;
    case "yearly":
      return subscription.cost / 12;
    default:
      return subscription.cost;
  }
}

export function BillingSummary({ subscriptions }: BillingSummaryProps) {
  const activeSubscriptions = subscriptions.filter((item) => item.is_active);
  const totalMonthly = activeSubscriptions.reduce(
    (acc, item) => acc + toMonthlyCost(item),
    0
  );
  const upcomingCount = activeSubscriptions.filter((item) => {
    const daysLeft = differenceInCalendarDays(
      parseISO(item.next_billing_date),
      new Date()
    );
    return daysLeft >= 0 && daysLeft <= 7;
  }).length;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Сводка по списаниям</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Подписок всего</p>
          <p className="text-xl font-semibold">{subscriptions.length}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Сумма / месяц (условно)</p>
          <p className="text-xl font-semibold">{totalMonthly.toFixed(2)}</p>
        </div>
        <div className="rounded-lg border p-3">
          <p className="text-xs text-muted-foreground">Списаний в ближайшие 7 дней</p>
          <p className="text-xl font-semibold">{upcomingCount}</p>
        </div>
      </CardContent>
    </Card>
  );
}
