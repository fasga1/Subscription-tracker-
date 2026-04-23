"use client";

import { useMemo, useState } from "react";
import { AddSubscriptionModal } from "@/components/features/AddSubscriptionModal";
import { BillingSummary } from "@/components/features/BillingSummary";
import { SubscriptionCard } from "@/components/features/SubscriptionCard";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import type { Subscription } from "@/types";

type SortMode = "next-billing" | "cost-desc" | "cost-asc" | "service";

export function DashboardClient() {
  const {
    subscriptions,
    groups,
    loading,
    submitting,
    creatingGroup,
    error,
    refresh,
    createGroup,
    createSubscription,
    updateSubscription,
    deleteSubscription,
  } = useSubscriptions();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingSubscription, setEditingSubscription] =
    useState<Subscription | null>(null);
  const [selectedGroupId, setSelectedGroupId] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortMode, setSortMode] = useState<SortMode>("next-billing");

  async function handleDelete(subscriptionId: string) {
    await deleteSubscription(subscriptionId);
  }

  const sidebarGroups = useMemo(
    () =>
      groups.map((group) => ({
        id: group.id,
        name: group.name,
        color: group.color,
        count: subscriptions.filter((item) => item.group_id === group.id).length,
      })),
    [groups, subscriptions]
  );

  const filteredSubscriptions = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    const nextList = subscriptions.filter((item) => {
      const byGroup =
        selectedGroupId === "all" ? true : item.group_id === selectedGroupId;
      const bySearch = normalizedQuery
        ? item.service_name.toLowerCase().includes(normalizedQuery)
        : true;
      return byGroup && bySearch;
    });

    const sorted = [...nextList];

    if (sortMode === "next-billing") {
      sorted.sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date));
    } else if (sortMode === "cost-desc") {
      sorted.sort((a, b) => b.cost - a.cost);
    } else if (sortMode === "cost-asc") {
      sorted.sort((a, b) => a.cost - b.cost);
    } else {
      sorted.sort((a, b) => a.service_name.localeCompare(b.service_name));
    }

    return sorted;
  }, [subscriptions, searchQuery, selectedGroupId, sortMode]);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[260px_1fr]">
      <AppSidebar
        creatingGroup={creatingGroup}
        groups={sidebarGroups}
        onCreateGroup={createGroup}
        onSelectGroup={setSelectedGroupId}
        selectedGroupId={selectedGroupId}
      />

      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-semibold">Подписки</h2>
          <AddSubscriptionModal
            groups={groups}
            isSubmitting={submitting}
            mode="create"
            onOpenChange={setIsCreateOpen}
            onSubmit={createSubscription}
            open={isCreateOpen}
          />
        </div>

        {error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm text-destructive">{error}</p>
            <Button
              className="mt-3"
              onClick={() => void refresh()}
              size="sm"
              variant="outline"
            >
              Повторить
            </Button>
          </div>
        ) : null}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_220px]">
          <Input
            placeholder="Поиск по названию сервиса"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
          />
          <Select
            value={sortMode}
            onValueChange={(value) => setSortMode((value as SortMode) ?? "next-billing")}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Сортировка" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="next-billing">По ближайшей дате</SelectItem>
              <SelectItem value="cost-desc">По стоимости (убыв.)</SelectItem>
              <SelectItem value="cost-asc">По стоимости (возр.)</SelectItem>
              <SelectItem value="service">По названию сервиса</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <BillingSummary subscriptions={filteredSubscriptions} />

        {loading ? (
          <p className="text-sm text-muted-foreground">Загрузка подписок...</p>
        ) : filteredSubscriptions.length === 0 ? (
          <p className="rounded-lg border p-4 text-sm text-muted-foreground">
            По выбранным фильтрам подписки не найдены.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {filteredSubscriptions.map((subscription) => (
              <SubscriptionCard
                key={subscription.id}
                groups={groups}
                isSubmitting={submitting}
                onDelete={handleDelete}
                onEdit={setEditingSubscription}
                subscription={subscription}
              />
            ))}
          </div>
        )}

        <AddSubscriptionModal
          groups={groups}
          initialSubscription={editingSubscription ?? undefined}
          isSubmitting={submitting}
          mode="edit"
          onOpenChange={(open) => {
            if (!open) {
              setEditingSubscription(null);
            }
          }}
          onSubmit={(values) =>
            editingSubscription
              ? updateSubscription(editingSubscription.id, values)
              : Promise.resolve(false)
          }
          open={Boolean(editingSubscription)}
        />
      </section>
    </div>
  );
}
