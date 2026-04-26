import { describe, expect, it } from "vitest";
import { subscriptionFormSchema } from "@/lib/validations";

describe("subscriptionFormSchema", () => {
  const validPayload = {
    group_id: "4ab8a412-7ed4-4fe7-8a46-7e3d69a4dd83",
    service_name: "YouTube Premium",
    cost: 399,
    currency: "rub",
    billing_cycle: "monthly" as const,
    billing_anchor_date: "2026-05-01",
    payment_url: "https://payments.example.com/youtube",
    is_active: true,
  };

  it("normalizes and validates a correct payload", () => {
    const parsed = subscriptionFormSchema.parse(validPayload);

    expect(parsed.currency).toBe("RUB");
    expect(parsed.service_name).toBe("YouTube Premium");
  });

  it("allows empty payment url", () => {
    const parsed = subscriptionFormSchema.parse({
      ...validPayload,
      payment_url: "",
    });

    expect(parsed.payment_url).toBe("");
  });

  it("rejects invalid group id", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validPayload,
      group_id: "group-1",
    });

    expect(result.success).toBe(false);
  });

  it("rejects non-positive cost", () => {
    const result = subscriptionFormSchema.safeParse({
      ...validPayload,
      cost: 0,
    });

    expect(result.success).toBe(false);
  });
});
