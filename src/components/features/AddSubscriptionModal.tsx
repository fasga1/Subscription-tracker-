"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  subscriptionFormSchema,
  type SubscriptionFormValues,
} from "@/lib/validations";
import type { Group, Subscription } from "@/types";

interface AddSubscriptionModalProps {
  groups: Group[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: SubscriptionFormValues) => Promise<boolean>;
  isSubmitting: boolean;
  mode: "create" | "edit";
  initialSubscription?: Subscription;
}

const DEFAULT_CURRENCY = "RUB";

export function AddSubscriptionModal({
  groups,
  open,
  onOpenChange,
  onSubmit,
  isSubmitting,
  mode,
  initialSubscription,
}: AddSubscriptionModalProps) {
  const form = useForm<SubscriptionFormValues>({
    resolver: zodResolver(subscriptionFormSchema),
    defaultValues: {
      group_id: "",
      service_name: "",
      cost: 0,
      currency: DEFAULT_CURRENCY,
      billing_cycle: "monthly",
      billing_anchor_date: new Date().toISOString().split("T")[0] ?? "",
      payment_url: "",
      is_active: true,
    },
  });
  const selectedGroupId = useWatch({ control: form.control, name: "group_id" });
  const selectedBillingCycle = useWatch({
    control: form.control,
    name: "billing_cycle",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    const defaultGroupId = groups[0]?.id ?? "";

    if (mode === "edit" && initialSubscription) {
      form.reset({
        group_id: initialSubscription.group_id,
        service_name: initialSubscription.service_name,
        cost: initialSubscription.cost,
        currency: initialSubscription.currency,
        billing_cycle: initialSubscription.billing_cycle,
        billing_anchor_date: initialSubscription.next_billing_date,
        payment_url: initialSubscription.payment_url ?? "",
        is_active: initialSubscription.is_active,
      });
      return;
    }

    form.reset({
      group_id: defaultGroupId,
      service_name: "",
      cost: 0,
      currency: DEFAULT_CURRENCY,
      billing_cycle: "monthly",
      billing_anchor_date: new Date().toISOString().split("T")[0] ?? "",
      payment_url: "",
      is_active: true,
    });
  }, [open, groups, form, mode, initialSubscription]);

  async function handleSubmit(values: SubscriptionFormValues) {
    const ok = await onSubmit(values);
    if (ok) {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {mode === "create" ? (
        <DialogTrigger render={<Button />}>Добавить подписку</DialogTrigger>
      ) : null}
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {mode === "create"
              ? "Новая подписка"
              : "Редактирование подписки"}
          </DialogTitle>
          <DialogDescription>
            Заполните основные поля подписки. Логика напоминаний и расширенные
            настройки будут добавлены на следующих этапах.
          </DialogDescription>
        </DialogHeader>

        <form className="space-y-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="group_id">Группа</Label>
            <Select
              value={selectedGroupId}
              onValueChange={(value) =>
                form.setValue("group_id", value ?? "", { shouldValidate: true })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Выберите группу" />
              </SelectTrigger>
              <SelectContent>
                {groups.map((group) => (
                  <SelectItem key={group.id} value={group.id}>
                    {group.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.group_id ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.group_id.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-2">
            <Label htmlFor="service_name">Сервис</Label>
            <Input id="service_name" {...form.register("service_name")} />
            {form.formState.errors.service_name ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.service_name.message}
              </p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="cost">Стоимость</Label>
              <Input
                id="cost"
                step="0.01"
                type="number"
                {...form.register("cost", { valueAsNumber: true })}
              />
              {form.formState.errors.cost ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.cost.message}
                </p>
              ) : null}
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Валюта</Label>
              <Input
                id="currency"
                maxLength={3}
                {...form.register("currency")}
              />
              {form.formState.errors.currency ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.currency.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="billing_cycle">Цикл оплаты</Label>
              <Select
                value={selectedBillingCycle}
                onValueChange={(value) =>
                  form.setValue(
                    "billing_cycle",
                    (value ?? "monthly") as Subscription["billing_cycle"],
                    { shouldValidate: true }
                  )
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Цикл" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Ежедневно</SelectItem>
                  <SelectItem value="monthly">Ежемесячно</SelectItem>
                  <SelectItem value="yearly">Ежегодно</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="billing_anchor_date">Дата списания</Label>
              <Input
                id="billing_anchor_date"
                type="date"
                {...form.register("billing_anchor_date")}
              />
              {form.formState.errors.billing_anchor_date ? (
                <p className="text-sm text-destructive">
                  {form.formState.errors.billing_anchor_date.message}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="payment_url">Ссылка на оплату</Label>
            <Input
              id="payment_url"
              placeholder="https://..."
              {...form.register("payment_url")}
            />
            {form.formState.errors.payment_url ? (
              <p className="text-sm text-destructive">
                {form.formState.errors.payment_url.message}
              </p>
            ) : null}
          </div>

          <DialogFooter>
            <Button disabled={isSubmitting} type="submit">
              {mode === "create" ? "Сохранить" : "Обновить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
