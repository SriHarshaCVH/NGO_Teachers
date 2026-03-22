import { cn } from "@/lib/cn";
import type { HTMLAttributes, LiHTMLAttributes, ReactNode } from "react";

export type DataListProps = HTMLAttributes<HTMLUListElement>;

/**
 * Bordered list container for applications and similar rows (plan: Data list).
 */
export function DataList({ className, ...props }: DataListProps) {
  return (
    <ul
      className={cn(
        "list-none divide-y divide-border rounded-xl border border-border bg-surface p-0 shadow-soft",
        className
      )}
      {...props}
    />
  );
}

export type DataListItemProps = LiHTMLAttributes<HTMLLIElement> & {
  children: ReactNode;
};

export function DataListItem({ className, children, ...props }: DataListItemProps) {
  return (
    <li
      className={cn("flex flex-col gap-1 px-4 py-3 sm:flex-row sm:items-center sm:justify-between", className)}
      {...props}
    >
      {children}
    </li>
  );
}
