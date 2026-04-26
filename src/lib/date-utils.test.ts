import { describe, expect, it } from "vitest";
import { calculateNextBillingDate } from "@/lib/date-utils";

describe("calculateNextBillingDate", () => {
  it("returns same date when anchor is in future", () => {
    const result = calculateNextBillingDate(
      "2026-06-15",
      "monthly",
      new Date("2026-06-01T12:00:00.000Z")
    );

    expect(result).toBe("2026-06-15");
  });

  it("shifts monthly anchor to next valid cycle", () => {
    const result = calculateNextBillingDate(
      "2026-01-10",
      "monthly",
      new Date("2026-04-11T12:00:00.000Z")
    );

    expect(result).toBe("2026-05-10");
  });

  it("shifts yearly anchor when previous cycle already passed", () => {
    const result = calculateNextBillingDate(
      "2024-03-01",
      "yearly",
      new Date("2026-03-02T12:00:00.000Z")
    );

    expect(result).toBe("2027-03-01");
  });
});
