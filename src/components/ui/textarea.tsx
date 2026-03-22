import { cn } from "@/lib/cn";
import { forwardRef, type TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[120px] w-full max-w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-foreground shadow-inner",
          "placeholder:text-muted-foreground",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring/35 focus-visible:border-accent/45",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "resize-y",
          className
        )}
        {...props}
      />
    );
  }
);
