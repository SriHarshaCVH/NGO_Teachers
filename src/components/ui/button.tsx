import {
  buttonAppearanceClassName,
  type ButtonSize,
  type ButtonVariant,
} from "./button-styles";
import type { ButtonHTMLAttributes } from "react";

export type { ButtonSize, ButtonVariant };

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Disables the control and sets `aria-busy` for async actions (e.g. Apply). */
  loading?: boolean;
};

export function Button({
  className,
  variant = "primary",
  size = "md",
  type = "button",
  loading = false,
  disabled,
  "aria-busy": ariaBusy,
  children,
  ...props
}: ButtonProps) {
  const isDisabled = Boolean(disabled || loading);

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={loading ? true : ariaBusy}
      className={buttonAppearanceClassName(variant, size, className)}
      {...props}
    >
      {children}
      {loading ? (
        <span className="sr-only" aria-live="polite">
          Loading
        </span>
      ) : null}
    </button>
  );
}
