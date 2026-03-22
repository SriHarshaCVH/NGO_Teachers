import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { PageHeader } from "@/components/ui/page-header";

export default function NotFound() {
  return (
    <PublicShell contentVariant="narrow" nav="default">
      <div className="space-y-8">
        <PageHeader
          title="Page not found"
          description="The page may have been removed, or the link is incorrect."
        />
        <nav
          aria-label="Helpful links"
          className="flex flex-col gap-3 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4"
        >
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Home
          </Link>
          <Link
            href="/opportunities"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Browse opportunities
          </Link>
        </nav>
      </div>
    </PublicShell>
  );
}
