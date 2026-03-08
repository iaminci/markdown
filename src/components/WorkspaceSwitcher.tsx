"use client";

import type { Workspace } from "@/types/workspace";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { ChevronDown, Check } from "lucide-react";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  selectedId: string | null;
  onSelect: (workspaceId: string | null) => void;
}

export function WorkspaceSwitcher({
  workspaces,
  selectedId,
  onSelect,
}: WorkspaceSwitcherProps) {
  const selected = selectedId
    ? workspaces.find((w) => w.id === selectedId)
    : null;
  const label = selected ? selected.name : "All workspaces";

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton>
                <span className="truncate">{label}</span>
                <ChevronDown className="ml-auto size-4 shrink-0" />
              </SidebarMenuButton>
            }
          />
          <DropdownMenuContent
            align="start"
            className="w-[--radix-popper-anchor-width] min-w-48"
          >
            <DropdownMenuItem onClick={() => onSelect(null)}>
              {!selectedId ? (
                <Check className="mr-2 size-4" />
              ) : (
                <span className="mr-2 size-4" />
              )}
              All workspaces
            </DropdownMenuItem>
            {workspaces.map((ws) => (
              <DropdownMenuItem
                key={ws.id}
                onClick={() => onSelect(ws.id)}
              >
                {selectedId === ws.id ? (
                  <Check className="mr-2 size-4" />
                ) : (
                  <span className="mr-2 size-4" />
                )}
                <span className="truncate">{ws.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
