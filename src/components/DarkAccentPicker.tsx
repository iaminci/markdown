"use client";

import { useTheme } from "@/components/ThemeProvider";
import type { DarkAccent } from "@/components/ThemeProvider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Palette } from "lucide-react";
import { cn } from "@/lib/utils";

const ACCENTS: { value: DarkAccent; label: string; color: string }[] = [
  { value: "amber", label: "Amber", color: "bg-amber-400" },
  { value: "sky", label: "Sky", color: "bg-sky-400" },
  { value: "emerald", label: "Emerald", color: "bg-emerald-400" },
  { value: "violet", label: "Violet", color: "bg-violet-400" },
  { value: "rose", label: "Rose", color: "bg-rose-400" },
  { value: "pink", label: "Pink", color: "bg-pink-400" },
  { value: "neon-blue", label: "Neon Blue", color: "bg-cyan-400" },
  { value: "teal", label: "Teal", color: "bg-teal-400" },
  { value: "indigo", label: "Indigo", color: "bg-indigo-400" },
  { value: "fuchsia", label: "Fuchsia", color: "bg-fuchsia-400" },
  { value: "orange", label: "Orange", color: "bg-orange-400" },
];

export function DarkAccentPicker() {
  const { theme, darkAccent, setDarkAccent } = useTheme();

  if (theme !== "dark") return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="dark:[color:var(--dm-text)] dark:hover:[background-color:var(--dm-bg)]"
            aria-label="Choose dark mode accent"
          >
            <Palette className="size-5" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="min-w-[180px]">
        {ACCENTS.map(({ value, label, color }) => (
          <DropdownMenuItem
            key={value}
            onClick={() => setDarkAccent(value)}
            className={cn(
              "flex items-center gap-2",
              darkAccent === value && "dark:![background-color:var(--dm-bg)]"
            )}
          >
            <span
              className={cn("size-3 shrink-0 rounded-full", color)}
              aria-hidden
            />
            {label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
