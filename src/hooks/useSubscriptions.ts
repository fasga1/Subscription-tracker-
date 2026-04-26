"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { calculateNextBillingDate } from "@/lib/date-utils";
import { createSupabaseBrowserClient } from "@/lib/supabase-client";
import type { Database } from "@/lib/supabase";
import type { SubscriptionFormValues } from "@/lib/validations";
import type { Group, Subscription } from "@/types";

type SubscriptionInsert = Database["public"]["Tables"]["subscriptions"]["Insert"];
type SubscriptionUpdate = Database["public"]["Tables"]["subscriptions"]["Update"];
type GroupInsert = Database["public"]["Tables"]["groups"]["Insert"];

interface UseSubscriptionsResult {
  subscriptions: Subscription[];
  groups: Group[];
  loading: boolean;
  submitting: boolean;
  creatingGroup: boolean;
  deletingGroupId: string | null;
  error: string | null;
  refresh: () => Promise<void>;
  createGroup: (name: string, color: string) => Promise<boolean>;
  deleteGroup: (groupId: string) => Promise<boolean>;
  createSubscription: (values: SubscriptionFormValues) => Promise<boolean>;
  updateSubscription: (
    subscriptionId: string,
    values: SubscriptionFormValues
  ) => Promise<boolean>;
  deleteSubscription: (subscriptionId: string) => Promise<boolean>;
}

async function getOrCreateDefaultGroup(): Promise<Group | null> {
  const supabase = createSupabaseBrowserClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data: groups } = await supabase
    .from("groups")
    .select("*")
    .order("created_at", { ascending: true })
    .limit(1);

  if (groups && groups.length > 0) {
    return groups[0];
  }

  const payload: GroupInsert = {
    owner_id: user.id,
    name: "Мои подписки",
    color: "#6366f1",
  };

  const { data: newGroup, error } = await supabase
    .from("groups")
    .insert(payload as never)
    .select("*")
    .single();

  if (error) {
    return null;
  }

  return newGroup;
}

export function useSubscriptions(): UseSubscriptionsResult {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [creatingGroup, setCreatingGroup] = useState(false);
  const [deletingGroupId, setDeletingGroupId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const ensuredGroup = await getOrCreateDefaultGroup();

    if (!ensuredGroup) {
      setSubscriptions([]);
      setGroups([]);
      setLoading(false);
      setError("Не удалось загрузить пользователя или создать группу.");
      return;
    }

    const [groupsResult, subscriptionsResult] = await Promise.all([
      supabase.from("groups").select("*").order("created_at", { ascending: true }),
      supabase
        .from("subscriptions")
        .select("*")
        .order("next_billing_date", { ascending: true }),
    ]);

    if (groupsResult.error) {
      setError(groupsResult.error.message);
      setLoading(false);
      return;
    }

    if (subscriptionsResult.error) {
      setError(subscriptionsResult.error.message);
      setLoading(false);
      return;
    }

    setGroups(groupsResult.data ?? []);
    setSubscriptions(subscriptionsResult.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => {
      window.clearTimeout(timerId);
    };
  }, [refresh]);

  const createSubscription = useCallback(
    async (values: SubscriptionFormValues) => {
      setSubmitting(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Пользователь не авторизован.");
        setSubmitting(false);
        return false;
      }

      const payload: SubscriptionInsert = {
        owner_id: user.id,
        group_id: values.group_id,
        service_name: values.service_name,
        cost: values.cost,
        currency: values.currency,
        billing_cycle: values.billing_cycle,
        next_billing_date: calculateNextBillingDate(
          values.billing_anchor_date,
          values.billing_cycle
        ),
        payment_url: values.payment_url || null,
        is_active: values.is_active,
      };

      const { data, error: createError } = await supabase
        .from("subscriptions")
        .insert(payload as never)
        .select("*")
        .single();

      if (createError) {
        setError(createError.message);
        setSubmitting(false);
        return false;
      }

      setSubscriptions((prev) =>
        [...prev, data].sort((a, b) =>
          a.next_billing_date.localeCompare(b.next_billing_date)
        )
      );
      setSubmitting(false);
      return true;
    },
    []
  );

  const updateSubscription = useCallback(
    async (subscriptionId: string, values: SubscriptionFormValues) => {
      setSubmitting(true);
      setError(null);

      const supabase = createSupabaseBrowserClient();

      const payload: SubscriptionUpdate = {
        group_id: values.group_id,
        service_name: values.service_name,
        cost: values.cost,
        currency: values.currency,
        billing_cycle: values.billing_cycle,
        next_billing_date: calculateNextBillingDate(
          values.billing_anchor_date,
          values.billing_cycle
        ),
        payment_url: values.payment_url || null,
        is_active: values.is_active,
      };

      const { data, error: updateError } = await supabase
        .from("subscriptions")
        .update(payload as never)
        .eq("id", subscriptionId)
        .select("*")
        .single();

      if (updateError) {
        setError(updateError.message);
        setSubmitting(false);
        return false;
      }

      setSubscriptions((prev) =>
        prev
          .map((item) => (item.id === subscriptionId ? data : item))
          .sort((a, b) => a.next_billing_date.localeCompare(b.next_billing_date))
      );
      setSubmitting(false);
      return true;
    },
    []
  );

  const deleteSubscription = useCallback(async (subscriptionId: string) => {
    setSubmitting(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const { error: deleteError } = await supabase
      .from("subscriptions")
      .delete()
      .eq("id", subscriptionId);

    if (deleteError) {
      setError(deleteError.message);
      setSubmitting(false);
      return false;
    }

    setSubscriptions((prev) => prev.filter((item) => item.id !== subscriptionId));
    setSubmitting(false);
    return true;
  }, []);

  const createGroup = useCallback(async (name: string, color: string) => {
    setCreatingGroup(true);
    setError(null);

    const supabase = createSupabaseBrowserClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setCreatingGroup(false);
      setError("Пользователь не авторизован.");
      return false;
    }

    const payload: GroupInsert = {
      owner_id: user.id,
      name,
      color,
    };

    const { data, error: groupError } = await supabase
      .from("groups")
      .insert(payload as never)
      .select("*")
      .single();

    if (groupError) {
      setCreatingGroup(false);
      setError(groupError.message);
      return false;
    }

    setGroups((prev) =>
      [...prev, data].sort((a, b) => a.created_at.localeCompare(b.created_at))
    );
    setCreatingGroup(false);
    return true;
  }, []);

  const deleteGroup = useCallback(
    async (groupId: string) => {
      setError(null);
      setDeletingGroupId(groupId);

      const existingGroups = groups;
      if (existingGroups.length <= 1) {
        setDeletingGroupId(null);
        setError("Нельзя удалить последнюю группу.");
        return false;
      }

      const supabase = createSupabaseBrowserClient();
      const { error: deleteGroupError } = await supabase
        .from("groups")
        .delete()
        .eq("id", groupId);

      if (deleteGroupError) {
        setDeletingGroupId(null);
        setError(deleteGroupError.message);
        return false;
      }

      setGroups((prev) => prev.filter((group) => group.id !== groupId));
      setSubscriptions((prev) =>
        prev.filter((subscription) => subscription.group_id !== groupId)
      );
      setDeletingGroupId(null);
      return true;
    },
    [groups]
  );

  return useMemo(
    () => ({
      subscriptions,
      groups,
      loading,
      submitting,
      creatingGroup,
      deletingGroupId,
      error,
      refresh,
      createGroup,
      deleteGroup,
      createSubscription,
      updateSubscription,
      deleteSubscription,
    }),
    [
      subscriptions,
      groups,
      loading,
      submitting,
      creatingGroup,
      deletingGroupId,
      error,
      refresh,
      createGroup,
      deleteGroup,
      createSubscription,
      updateSubscription,
      deleteSubscription,
    ]
  );
}
