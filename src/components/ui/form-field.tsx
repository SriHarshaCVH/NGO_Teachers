import { cn } from "@/lib/cn";
import {
  cloneElement,
  isValidElement,
  type ReactElement,
  type ReactNode,
} from "react";

export type FormFieldProps = {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
};

type ControlProps = {
  id?: string;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
};

/**
 * Accessible field wrapper: label, optional hint, one control child, optional error (`role="alert"`).
 * Clones the child to set `id`, `aria-describedby`, and `aria-invalid` when applicable.
 */
export function FormField({
  id,
  label,
  hint,
  error,
  children,
  className,
}: FormFieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy =
    [hintId, errorId].filter(Boolean).join(" ").trim() || undefined;

  const control = isValidElement(children)
    ? cloneElement(children as ReactElement<ControlProps>, {
        id: (children as ReactElement<ControlProps>).props.id ?? id,
        "aria-describedby": [
          (children as ReactElement<ControlProps>).props["aria-describedby"],
          describedBy,
        ]
          .filter(Boolean)
          .join(" ")
          .trim() || undefined,
        "aria-invalid": error ? true : undefined,
      })
    : children;

  return (
    <div className={cn("mb-4 space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
      </label>
      {hint ? (
        <p id={hintId} className="text-sm text-muted-foreground">
          {hint}
        </p>
      ) : null}
      {control}
      {error ? (
        <p id={errorId} className="text-sm font-medium text-danger" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
