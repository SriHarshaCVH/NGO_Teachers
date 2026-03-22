import { cn } from "@/lib/cn";
import { forwardRef, type SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement>;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, children, ...props },
  ref
) {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-10 w-full max-w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-inner",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/35 focus-visible:border-accent/45",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
});
