import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type AlertVariant = "success" | "info" | "warning" | "error";

const variantClasses: Record<AlertVariant, string> = {
  success:
    "border-success/30 bg-success/10 text-foreground [&_a]:text-primary [&_a]:underline-offset-2",
  info: "border-info/30 bg-info/10 text-foreground [&_a]:text-primary [&_a]:underline-offset-2",
  warning:
    "border-warning/35 bg-warning/12 text-foreground [&_a]:text-primary [&_a]:underline-offset-2",
  error:
    "border-danger/35 bg-danger/10 text-foreground [&_a]:text-primary [&_a]:underline-offset-2",
};

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant: AlertVariant;
  title?: string;
  children?: ReactNode;
};

/**
 * Inline status message (maps legacy `.notice` / `.error` during migration).
 */
export function Alert({
  variant,
  title,
  children,
  className,
  role = variant === "error" ? "alert" : "status",
  ...props
}: AlertProps) {
  return (
    <div
      role={role}
      className={cn(
        "mb-4 rounded-lg border px-3 py-2.5 text-sm leading-relaxed",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {title ? <p className="m-0 font-semibold">{title}</p> : null}
      {children ? (
        <div className={cn(title ? "mt-1" : "", "m-0")}>{children}</div>
      ) : null}
    </div>
  );
}
