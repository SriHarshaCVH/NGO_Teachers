import Link from "next/link";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type PageHeaderProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  /** Optional breadcrumb or toolbar row above the title */
  eyebrow?: ReactNode;
  className?: string;
};

/**
 * Page-level title block (plan: PageHeader — title, description, back/breadcrumb).
 */
export function PageHeader({
  title,
  description,
  backHref,
  backLabel = "Back",
  eyebrow,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {eyebrow ? <div className="text-sm text-muted-foreground">{eyebrow}</div> : null}
      {backHref ? (
        <p className="m-0">
          <Link
            href={backHref}
            className="text-sm font-medium text-primary hover:underline"
          >
            ← {backLabel}
          </Link>
        </p>
      ) : null}
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          {title}
        </h1>
        {description ? (
          <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </header>
  );
}
