-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Drop legacy policies to avoid recursive policy chains.
DROP POLICY IF EXISTS "Users see own profile" ON profiles;
DROP POLICY IF EXISTS "Groups access" ON groups;
DROP POLICY IF EXISTS "Subscriptions access" ON subscriptions;
DROP POLICY IF EXISTS "Group members access" ON group_members;

-- Profiles: user can access only own profile.
CREATE POLICY "Users see own profile"
ON profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Groups: owner-only access for now.
CREATE POLICY "Groups owner access"
ON groups
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Subscriptions: owner-only access for now.
CREATE POLICY "Subscriptions owner access"
ON subscriptions
FOR ALL
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Group members: owner of related group can manage.
CREATE POLICY "Group members owner access"
ON group_members
FOR ALL
USING (
  EXISTS (
    SELECT 1
    FROM groups
    WHERE groups.id = group_members.group_id
      AND groups.owner_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM groups
    WHERE groups.id = group_members.group_id
      AND groups.owner_id = auth.uid()
  )
);
