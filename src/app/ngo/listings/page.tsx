import { auth } from "@/auth";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { DataList, DataListItem } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { toPublicListing } from "@/lib/listing";
import {
  badgeVariantForListingStatus,
  labelForListingStatus,
} from "@/lib/ui/status-badges";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function NgoListingsPage() {
  const session = await auth();
  const rows = await prisma.teachingNeed.findMany({
    where: { ngoUserId: session!.user.id },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { applications: true } },
    },
  });

  return (
    <DashboardPageLayout
      title="Teaching listings"
      description="Create and manage listings, edit details, and review applicants in one place."
    >
      <div className="space-y-8">
        <SectionHeader
          id="review-applications"
          title="Your listings"
          description="Edit a listing to update its details. Open Applications to review volunteers who applied."
          action={
            <ButtonLink href="/ngo/listings/new" variant="primary" size="md">
              Create listing
            </ButtonLink>
          }
        />

        {rows.length === 0 ? (
          <EmptyState
            title="No listings yet"
            description="Publish your first teaching need so volunteers can discover it and apply."
            action={
              <ButtonLink href="/ngo/listings/new" variant="primary" size="md">
                Create your first listing
              </ButtonLink>
            }
          />
        ) : (
          <DataList>
            {rows.map((r) => {
              const l = toPublicListing(r);
              const count = r._count.applications;
              return (
                <DataListItem
                  key={l.id}
                  className="flex-col items-stretch gap-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/ngo/listings/${l.id}/edit`}
                        className="text-base font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {l.title}
                      </Link>
                      <Badge variant={badgeVariantForListingStatus(l.status)}>
                        {labelForListingStatus(l.status)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {count === 0
                        ? "No applications yet"
                        : `${count} application${count === 1 ? "" : "s"}`}
                    </p>
                  </div>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[12rem] sm:flex-row sm:justify-end">
                    <ButtonLink
                      href={`/ngo/listings/${l.id}/edit`}
                      variant="secondary"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Edit listing
                    </ButtonLink>
                    <ButtonLink
                      href={`/ngo/listings/${l.id}/applications`}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      Applications
                    </ButtonLink>
                  </div>
                </DataListItem>
              );
            })}
          </DataList>
        )}

        <nav aria-label="Related pages" className="text-sm text-muted-foreground">
          <Link
            href="/ngo"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            NGO dashboard
          </Link>
        </nav>
      </div>
    </DashboardPageLayout>
  );
}
