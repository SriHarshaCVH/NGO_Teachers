import { cn } from "@/lib/cn";
import type { HTMLAttributes, ReactNode } from "react";

export type FormSectionProps = HTMLAttributes<HTMLFieldSetElement> & {
  title: string;
  description?: string;
  children: ReactNode;
};

export function FormSection({
  title,
  description,
  children,
  className,
  ...props
}: FormSectionProps) {
  return (
    <fieldset
      className={cn(
        "space-y-4 rounded-xl border border-border bg-surface p-6 shadow-soft",
        className
      )}
      {...props}
    >
      <legend className="mb-2 w-full px-0 text-base font-semibold text-foreground">
        {title}
      </legend>
      {description ? (
        <p className="-mt-1 mb-4 text-sm text-muted-foreground">{description}</p>
      ) : null}
      <div className="space-y-4">{children}</div>
    </fieldset>
  );
}
