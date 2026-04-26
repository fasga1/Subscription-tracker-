import {
  addDays,
  addMonths,
  addYears,
  format,
  isBefore,
  parseISO,
  startOfDay,
} from "date-fns";
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
  const today = startOfDay(now);

  while (isBefore(nextDate, today)) {
    nextDate = shiftByCycle(nextDate, cycle);
  }

  return format(nextDate, "yyyy-MM-dd");
}
