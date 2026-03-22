import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type MetricCardProps = HTMLAttributes<HTMLDivElement> & {
  label: string;
  value: ReactNode;
  hint?: string;
};

export function MetricCard({
  label,
  value,
  hint,
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-surface p-4 shadow-soft",
        className
      )}
      {...props}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-foreground">
        {value}
      </p>
      {hint ? (
        <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}
