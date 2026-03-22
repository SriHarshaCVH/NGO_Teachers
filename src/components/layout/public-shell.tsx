import Link from "next/link";
import {
  PageContainer,
  type PageContainerVariant,
} from "@/components/ui/page-container";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type PublicShellProps = {
  children: ReactNode;
  /** Width of the main content column */
  contentVariant?: PageContainerVariant;
  /** Top nav links: default shows Log in; auth shows the complementary auth link */
  nav?: "default" | "auth-login" | "auth-signup";
  className?: string;
};

/**
 * Centered, readable layout for marketing and auth flows.
 */
export function PublicShell({
  children,
  contentVariant = "narrow",
  nav = "default",
  className,
}: PublicShellProps) {
  return (
    <div
      className={cn(
        "flex min-h-screen flex-col bg-gradient-to-b from-background via-background to-muted/25",
        className
      )}
    >
      <header className="border-b border-border/80 bg-background/80 backdrop-blur-sm">
        <PageContainer variant="wide" className="flex h-14 items-center justify-between gap-4 py-0">
          <Link
            href="/"
            className="text-sm font-semibold tracking-tight text-foreground hover:text-primary"
          >
            NGO Teachers
          </Link>
          <nav aria-label="Primary" className="flex items-center gap-4 text-sm">
            <Link
              href="/opportunities"
              className="text-muted-foreground hover:text-foreground"
            >
              Opportunities
            </Link>
            {nav === "auth-login" ? (
              <Link href="/signup" className="text-muted-foreground hover:text-foreground">
                Sign up
              </Link>
            ) : null}
            {nav === "auth-signup" ? (
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Log in
              </Link>
            ) : null}
            {nav === "default" ? (
              <Link href="/login" className="text-muted-foreground hover:text-foreground">
                Log in
              </Link>
            ) : null}
          </nav>
        </PageContainer>
      </header>
      <main data-shell className="flex-1 min-w-0">
        <PageContainer variant={contentVariant} className="py-10 sm:py-14">
          {children}
        </PageContainer>
      </main>
      <footer className="border-t border-border/60 py-8 text-center text-xs text-muted-foreground">
        <PageContainer variant="wide">
          Connecting educators with organizations making a difference.
        </PageContainer>
      </footer>
    </div>
  );
}
