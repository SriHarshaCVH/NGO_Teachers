import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type EmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function EmptyState({
  title,
  description,
  action,
  icon,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center",
        className
      )}
      role="status"
    >
      {icon ? (
        <div className="mb-4 text-muted-foreground [&_svg]:h-10 [&_svg]:w-10" aria-hidden>
          {icon}
        </div>
      ) : null}
      <p className="text-base font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-2 max-w-md text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
