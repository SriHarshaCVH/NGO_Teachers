import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export type FilterBarProps = HTMLAttributes<HTMLDivElement>;

/**
 * Responsive filter row for opportunities browse (plan: FilterBar).
 * Use for native selects / inputs; Clear as secondary `Button` alongside.
 */
export function FilterBar({ className, ...props }: FilterBarProps) {
  return (
    <div
      className={cn(
        "grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
      {...props}
    />
  );
}
