import type {
  BillingCycle,
  Group,
  GroupMemberRole,
  Profile,
  Subscription,
} from "@/types";

type GroupInsert = Pick<Group, "name"> &
  Partial<Pick<Group, "color" | "owner_id">>;
type GroupUpdate = Partial<Omit<Group, "id" | "created_at">>;

type SubscriptionInsert = Pick<
  Subscription,
  "group_id" | "service_name" | "cost" | "billing_cycle" | "next_billing_date"
> &
  Partial<
    Pick<
      Subscription,
      "currency" | "payment_url" | "owner_id" | "is_active" | "created_at"
    >
  >;
type SubscriptionUpdate = Partial<
  Omit<Subscription, "id" | "created_at" | "owner_id">
>;

type ProfileInsert = Pick<Profile, "id" | "email"> &
  Partial<Pick<Profile, "full_name" | "avatar_url">>;
type ProfileUpdate = Partial<Omit<Profile, "id" | "created_at">>;

interface GroupMember {
  group_id: string;
  user_id: string;
  role: GroupMemberRole;
}

type GroupMemberInsert = GroupMember;
type GroupMemberUpdate = Partial<Pick<GroupMember, "role">>;

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      groups: {
        Row: Group;
        Insert: GroupInsert;
        Update: GroupUpdate;
        Relationships: [];
      };
      subscriptions: {
        Row: Subscription;
        Insert: SubscriptionInsert;
        Update: SubscriptionUpdate;
        Relationships: [];
      };
      group_members: {
        Row: GroupMember;
        Insert: GroupMemberInsert;
        Update: GroupMemberUpdate;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      billing_cycle: BillingCycle;
      group_member_role: GroupMemberRole;
    };
    CompositeTypes: Record<string, never>;
  };
}

export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
