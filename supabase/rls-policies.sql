-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Profiles: user can access only own profile.
CREATE POLICY "Users see own profile"
ON profiles
FOR ALL
USING (auth.uid() = id);

-- Groups: owner and group members can access.
CREATE POLICY "Groups access"
ON groups
FOR ALL
USING (
  auth.uid() = owner_id
  OR auth.uid() IN (
    SELECT user_id
    FROM group_members
    WHERE group_id = groups.id
  )
);

-- Subscriptions: available through allowed groups.
CREATE POLICY "Subscriptions access"
ON subscriptions
FOR ALL
USING (
  group_id IN (
    SELECT id
    FROM groups
    WHERE owner_id = auth.uid()
      OR auth.uid() IN (
        SELECT user_id
        FROM group_members
        WHERE group_id = groups.id
      )
  )
);

-- Group members: group owner has full access.
CREATE POLICY "Group members access"
ON group_members
FOR ALL
USING (
  group_id IN (
    SELECT id
    FROM groups
    WHERE owner_id = auth.uid()
  )
);
