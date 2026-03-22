import { cn } from "@/lib/cn";
import type { HTMLAttributes } from "react";

export type PageContainerVariant = "default" | "narrow" | "wide" | "full";

const variantClasses: Record<PageContainerVariant, string> = {
  default: "max-w-3xl",
  narrow: "max-w-xl",
  wide: "max-w-6xl",
  full: "max-w-none",
};

export type PageContainerProps = HTMLAttributes<HTMLDivElement> & {
  variant?: PageContainerVariant;
};

export function PageContainer({
  className,
  variant = "default",
  ...props
}: PageContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        variantClasses[variant],
        className
      )}
      {...props}
    />
  );
}
