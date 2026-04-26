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
  onDeleteGroup?: (groupId: string) => Promise<boolean>;
  deletingGroupId?: string | null;
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
  onDeleteGroup,
  deletingGroupId = null,
  creatingGroup = false,
}: AppSidebarProps) {
  const [groupName, setGroupName] = useState("");
  const [groupColor, setGroupColor] = useState("#6366f1");
  const [deleteHoverGroupId, setDeleteHoverGroupId] = useState<string | null>(null);

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

  async function handleDeleteGroup(groupId: string) {
    if (!onDeleteGroup) {
      return;
    }

    const isConfirmed = window.confirm(
      "Удалить группу и все подписки внутри нее? Это действие нельзя отменить."
    );
    if (!isConfirmed) {
      return;
    }

    await onDeleteGroup(groupId);
  }

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
            <div
              key={group.id}
              className="group/item relative transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] md:hover:-translate-y-[1px]"
            >
              <Button
                className={`w-full justify-between pr-9 transition-[background-color,border-color,color,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                  deleteHoverGroupId === group.id
                    ? "border-destructive/50 bg-destructive/10 text-destructive shadow-sm hover:bg-destructive/15"
                    : ""
                }`}
                onClick={() => onSelectGroup?.(group.id)}
                size="sm"
                variant={selectedGroupId === group.id ? "default" : "outline"}
              >
                <span className="inline-flex items-center gap-2 truncate">
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: group.color }}
                  />
                  <span className="truncate">
                    {getReadableGroupName(group.name, group.id)}
                  </span>
                </span>
                <span>{group.count}</span>
              </Button>
              <Button
                aria-label={`Удалить группу ${getReadableGroupName(group.name, group.id)}`}
                className="absolute top-1/2 right-2 -translate-y-1/2 opacity-100 transition-[opacity,transform,background-color,color] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-destructive/15 hover:text-destructive md:translate-x-1 md:opacity-0 md:group-hover/item:translate-x-0 md:group-hover/item:opacity-100"
                disabled={deletingGroupId === group.id}
                onClick={(event) => {
                  event.stopPropagation();
                  void handleDeleteGroup(group.id);
                }}
                onMouseEnter={() => setDeleteHoverGroupId(group.id)}
                onMouseLeave={() => setDeleteHoverGroupId(null)}
                size="icon-sm"
                variant="ghost"
              >
                ✕
              </Button>
            </div>
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
          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <p className="text-sm text-muted-foreground">Цвет группы</p>
            <Input
              className="h-8 w-16 cursor-pointer border-none p-0"
              type="color"
              value={groupColor}
              onChange={(event) => setGroupColor(event.target.value)}
            />
          </div>
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
