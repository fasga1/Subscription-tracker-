export type BillingCycle = "daily" | "monthly" | "yearly";
export type GroupMemberRole = "admin" | "viewer";

export interface Subscription {
  id: string;
  group_id: string;
  owner_id: string | null;
  service_name: string;
  cost: number;
  currency: string;
  billing_cycle: BillingCycle;
  next_billing_date: string;
  payment_url: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Group {
  id: string;
  owner_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
}
