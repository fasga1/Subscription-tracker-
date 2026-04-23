import { z } from "zod";

export const billingCycleSchema = z.enum(["daily", "monthly", "yearly"]);

export const subscriptionFormSchema = z.object({
  group_id: z.uuid("Выберите корректную группу"),
  service_name: z.string().trim().min(2, "Укажите название сервиса"),
  cost: z.number().positive("Стоимость должна быть больше 0"),
  currency: z.string().trim().min(3, "Укажите валюту").max(3).toUpperCase(),
  billing_cycle: billingCycleSchema,
  billing_anchor_date: z.iso.date("Укажите корректную дату списания"),
  payment_url: z
    .string()
    .trim()
    .url("Введите корректный URL")
    .or(z.literal("")),
  is_active: z.boolean(),
});

export type SubscriptionFormValues = z.infer<typeof subscriptionFormSchema>;
