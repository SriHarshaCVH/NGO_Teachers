import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export const buttonVariantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground shadow-sm hover:bg-primary-hover focus-visible:ring-focus-ring/45",
  secondary:
    "bg-muted text-foreground hover:bg-muted/80 focus-visible:ring-border",
  outline:
    "border border-border bg-surface text-foreground shadow-sm hover:bg-muted/50 focus-visible:ring-border",
  ghost: "text-foreground hover:bg-muted/60 focus-visible:ring-border",
  danger:
    "bg-danger text-white shadow-sm hover:opacity-90 focus-visible:ring-danger/40",
};

export const buttonSizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-sm rounded-md gap-1.5",
  md: "h-10 px-4 text-sm rounded-md gap-2",
  lg: "h-11 px-5 text-base rounded-lg gap-2",
};

export function buttonAppearanceClassName(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string
) {
  return cn(
    "inline-flex items-center justify-center font-medium transition-colors",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-50",
    buttonVariantClasses[variant],
    buttonSizeClasses[size],
    className
  );
}
