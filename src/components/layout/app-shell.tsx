import Link from "next/link";
import { PageContainer } from "@/components/ui/page-container";
import { SignOutForm } from "@/components/ui/sign-out-form";
import { cn } from "@/lib/cn";
import type { ReactNode } from "react";

export type AppRole = "NGO" | "VOLUNTEER";

export type AppShellProps = {
  children: ReactNode;
  role: AppRole;
  userEmail?: string | null;
  className?: string;
};

const navByRole: Record<AppRole, { href: string; label: string }[]> = {
  NGO: [
    { href: "/ngo", label: "Dashboard" },
    { href: "/ngo/profile", label: "Profile" },
    { href: "/ngo/listings", label: "Listings" },
  ],
  VOLUNTEER: [
    { href: "/volunteer", label: "Dashboard" },
    { href: "/volunteer/profile", label: "Profile" },
    { href: "/opportunities", label: "Opportunities" },
    { href: "/volunteer/applications", label: "Applications" },
  ],
};

/**
 * Authenticated shell: top navigation, subtle background, full-width content area.
 */
export function AppShell({ children, role, userEmail, className }: AppShellProps) {
  const items = navByRole[role];

  return (
    <div className={cn("min-h-screen bg-muted/35", className)}>
      <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 shadow-sm backdrop-blur-md">
        <PageContainer variant="wide" className="flex flex-col gap-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
          <div className="flex min-w-0 flex-wrap items-center gap-x-4 gap-y-2">
            <Link
              href="/"
              className="text-sm font-semibold tracking-tight text-foreground hover:text-primary"
            >
              NGO Teachers
            </Link>
            <nav
              aria-label="App"
              className="flex flex-wrap items-center gap-2 text-sm sm:gap-3"
            >
              {items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-md px-2 py-1 text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
            {userEmail ? (
              <p className="truncate text-xs text-muted-foreground sm:max-w-[16rem] sm:text-right">
                {userEmail}
              </p>
            ) : null}
            <SignOutForm />
          </div>
        </PageContainer>
      </header>
      <div className="pb-12">{children}</div>
    </div>
  );
}
