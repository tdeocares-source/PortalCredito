"use client";

import { cn } from "@/lib/utils";

type Props<T extends string> = {
  value: T;
  label: string;
  selected: T | undefined;
  onSelect: (value: T) => void;
};

export function RadioCard<T extends string>({ value, label, selected, onSelect }: Props<T>) {
  const isSelected = selected === value;
  return (
    <button
      type="button"
      onClick={() => onSelect(value)}
      aria-pressed={isSelected}
      className={cn(
        "group flex w-full items-center gap-3 rounded-lg border px-4 py-3.5 text-left transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary/40"
          : "border-border bg-card hover:border-muted-foreground/40 hover:bg-accent/40",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
          isSelected ? "border-primary" : "border-muted-foreground/40 group-hover:border-muted-foreground/70",
        )}
      >
        {isSelected && <span className="h-2.5 w-2.5 rounded-full bg-primary" />}
      </span>
      <span className="text-base font-medium text-foreground">{label}</span>
    </button>
  );
}
