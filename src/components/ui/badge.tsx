import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

/** Semantic status colors for applications, listings, and system messages. */
export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "success"
  | "warning"
  | "destructive"
  | "info";

const variantClasses: Record<BadgeVariant, string> = {
  default: "border-transparent bg-primary/10 text-primary",
  secondary: "border-transparent bg-muted text-foreground",
  outline: "border-border text-foreground",
  success: "border-transparent bg-success/12 text-success",
  warning: "border-transparent bg-warning/15 text-warning-foreground",
  destructive: "border-transparent bg-danger/12 text-danger",
  info: "border-transparent bg-info/12 text-info",
};

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
