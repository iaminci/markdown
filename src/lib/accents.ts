export type DarkAccent =
  | "amber"
  | "sky"
  | "emerald"
  | "violet"
  | "rose"
  | "indigo"
  | "orange";

/** Tailwind color tokens for each accent */
export const ACCENT_COLORS: Record<DarkAccent, string> = {
  amber: "amber-500",
  sky: "sky-500",
  emerald: "emerald-500",
  violet: "violet-500",
  rose: "rose-500",
  indigo: "indigo-500",
  orange: "orange-500",
};

export const ACCENT_LIST: { value: DarkAccent; label: string }[] = [
  { value: "amber", label: "Amber" },
  { value: "sky", label: "Sky" },
  { value: "emerald", label: "Emerald" },
  { value: "violet", label: "Violet" },
  { value: "rose", label: "Rose" },
  { value: "indigo", label: "Indigo" },
  { value: "orange", label: "Orange" },
];
