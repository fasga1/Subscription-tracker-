import { addDays, addMonths, addYears, isBefore, parseISO } from "date-fns";
import type { BillingCycle } from "@/types";

function shiftByCycle(date: Date, cycle: BillingCycle): Date {
  switch (cycle) {
    case "daily":
      return addDays(date, 1);
    case "monthly":
      return addMonths(date, 1);
    case "yearly":
      return addYears(date, 1);
    default:
      return date;
  }
}

export function calculateNextBillingDate(
  anchorDate: string,
  cycle: BillingCycle,
  now: Date = new Date()
): string {
  let nextDate = parseISO(anchorDate);

  while (isBefore(nextDate, now)) {
    nextDate = shiftByCycle(nextDate, cycle);
  }

  return nextDate.toISOString().split("T")[0] ?? anchorDate;
}
