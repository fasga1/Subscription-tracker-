"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface SidebarGroupItem {
  id: string;
  name: string;
  color: string;
  count: number;
}

interface AppSidebarProps {
  groups?: SidebarGroupItem[];
  selectedGroupId?: string;
  onSelectGroup?: (groupId: string) => void;
  onCreateGroup?: (name: string, color: string) => Promise<boolean>;
  creatingGroup?: boolean;
}

const ALL_GROUPS_ID = "all";

function getReadableGroupName(name: string, id: string): string {
  const trimmedName = name.trim();
  const isMachineLike = /^[a-z0-9-]{20,}$/i.test(trimmedName);
  if (!trimmedName || isMachineLike) {
    return `Группа ${id.slice(0, 6)}`;
  }

  return trimmedName;
}

export function AppSidebar({
  groups,
  selectedGroupId = ALL_GROUPS_ID,
  onSelectGroup,
  onCreateGroup,
  creatingGroup = false,
}: AppSidebarProps) {
  const [groupName, setGroupName] = useState("");
  const [groupColor, setGroupColor] = useState("#6366f1");

  async function handleCreateGroup() {
    if (!onCreateGroup) {
      return;
    }

    const trimmedName = groupName.trim();
    if (!trimmedName) {
      return;
    }

    const created = await onCreateGroup(trimmedName, groupColor);
    if (created) {
      setGroupName("");
    }
  }

  const hasGroups = Boolean(groups && groups.length > 0);

  return (
    <aside className="rounded-xl border p-4">
      <h3 className="text-sm font-semibold">Группы</h3>
      {!hasGroups ? (
        <p className="mt-2 text-sm text-muted-foreground">
          Группы появятся после загрузки.
        </p>
      ) : (
        <div className="mt-3 space-y-2">
          <Button
            className="w-full justify-start"
            onClick={() => onSelectGroup?.(ALL_GROUPS_ID)}
            size="sm"
            variant={selectedGroupId === ALL_GROUPS_ID ? "default" : "outline"}
          >
            Все ({groups?.reduce((acc, item) => acc + item.count, 0) ?? 0})
          </Button>

          {groups?.map((group) => (
            <Button
              key={group.id}
              className="w-full justify-between"
              onClick={() => onSelectGroup?.(group.id)}
              size="sm"
              variant={selectedGroupId === group.id ? "default" : "outline"}
            >
              <span className="inline-flex items-center gap-2">
                <span
                  className="size-2 rounded-full"
                  style={{ backgroundColor: group.color }}
                />
                {getReadableGroupName(group.name, group.id)}
              </span>
              <span>{group.count}</span>
            </Button>
          ))}
        </div>
      )}

      {onCreateGroup ? (
        <div className="mt-4 space-y-2 border-t pt-4">
          <p className="text-xs text-muted-foreground">Новая группа</p>
          <Input
            placeholder="Название группы"
            value={groupName}
            onChange={(event) => setGroupName(event.target.value)}
          />
          <Input
            type="color"
            value={groupColor}
            onChange={(event) => setGroupColor(event.target.value)}
          />
          <Button
            className="w-full"
            disabled={creatingGroup}
            onClick={() => void handleCreateGroup()}
            size="sm"
            variant="secondary"
          >
            Добавить группу
          </Button>
        </div>
      ) : null}
    </aside>
  );
}
