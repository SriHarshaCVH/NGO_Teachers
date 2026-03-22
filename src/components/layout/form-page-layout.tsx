import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type FormPageLayoutProps = {
  title: string;
  description?: string;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Profile / listing forms: PageHeader with optional back link.
 */
export function FormPageLayout({
  title,
  description,
  backHref,
  backLabel = "Back",
  children,
  className,
}: FormPageLayoutProps) {
  return (
    <PageContainer variant="default" className={cn("py-8 sm:py-10", className)}>
      <main data-shell className="space-y-8">
        <PageHeader
          title={title}
          description={description}
          backHref={backHref}
          backLabel={backLabel}
        />
        {children}
      </main>
    </PageContainer>
  );
}
