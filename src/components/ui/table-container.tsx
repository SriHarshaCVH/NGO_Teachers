import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export type TableContainerProps = HTMLAttributes<HTMLDivElement>;

export function TableContainer({ className, ...props }: TableContainerProps) {
  return (
    <div
      className={cn(
        "overflow-x-auto rounded-xl border border-border bg-surface shadow-soft",
        className
      )}
      {...props}
    />
  );
}
