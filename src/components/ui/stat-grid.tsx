import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type StatGridItem = {
  label: string;
  value: ReactNode;
  id?: string;
};

export type StatGridProps = {
  items: StatGridItem[];
  className?: string;
};

/**
 * Dashboard metrics with `dl` semantics (plan: StatGrid).
 */
export function StatGrid({ items, className }: StatGridProps) {
  return (
    <dl
      className={cn(
        "grid gap-4 sm:grid-cols-2 lg:grid-cols-4",
        className
      )}
    >
      {items.map((item, index) => (
        <div key={item.id ?? `${item.label}-${index}`}>
          <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {item.label}
          </dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
            {item.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
