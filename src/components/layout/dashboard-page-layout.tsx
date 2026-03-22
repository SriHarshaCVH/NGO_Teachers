import { PageContainer } from "@/components/ui/page-container";
import { PageHeader } from "@/components/ui/page-header";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type DashboardPageLayoutProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

/**
 * Standard dashboard page: PageHeader + generous vertical rhythm.
 */
export function DashboardPageLayout({
  title,
  description,
  children,
  className,
}: DashboardPageLayoutProps) {
  return (
    <PageContainer variant="wide" className={cn("py-8 sm:py-10", className)}>
      <main data-shell className="space-y-8">
        <PageHeader title={title} description={description} />
        {children}
      </main>
    </PageContainer>
  );
}
