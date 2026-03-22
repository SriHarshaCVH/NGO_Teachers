import Link from "next/link";
import {
  buttonAppearanceClassName,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";
import { cn } from "@/lib/cn";
import type { ComponentProps } from "react";

export type ButtonLinkProps = Omit<ComponentProps<typeof Link>, "className"> & {
  className?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
};

/**
 * Next.js `Link` styled as a button (primary / secondary / outline / ghost / danger).
 */
export function ButtonLink({
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonLinkProps) {
  return (
    <Link
      className={cn(buttonAppearanceClassName(variant, size), className)}
      {...props}
    />
  );
}
