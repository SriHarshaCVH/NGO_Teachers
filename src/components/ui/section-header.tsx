import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type SectionHeaderProps = {
  title: string;
  description?: string;
  id?: string;
  action?: ReactNode;
  className?: string;
} & Omit<HTMLAttributes<HTMLDivElement>, "title">;

export function SectionHeader({
  title,
  description,
  id,
  action,
  className,
  ...props
}: SectionHeaderProps) {
  return (
    <div
      className={cn("flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4", className)}
      {...props}
    >
      <div className="min-w-0 space-y-1">
        <h2
          id={id}
          className="text-base font-semibold tracking-tight text-foreground"
        >
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
