import { auth } from "@/auth";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import {
  toNgoApplicationListItem,
} from "@/lib/ngo-application-review";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplicationsReviewClient } from "./applications-review-client";

type Props = { params: Promise<{ id: string }> };

export default async function NgoListingApplicationsPage({ params }: Props) {
  const { id: listingId } = await params;
  const session = await auth();

  const listing = await prisma.teachingNeed.findFirst({
    where: { id: listingId, ngoUserId: session!.user.id },
    select: { id: true, title: true },
  });
  if (!listing) {
    notFound();
  }

  const rows = await prisma.application.findMany({
    where: { teachingNeedId: listingId },
    orderBy: { appliedAt: "desc" },
    include: {
      volunteerUser: {
        select: {
          id: true,
          volunteerProfile: { select: { fullName: true } },
        },
      },
    },
  });

  const initialApplications = rows.map(toNgoApplicationListItem);

  return (
    <DashboardPageLayout
      title="Applications"
      description={`Reviewing applicants for “${listing.title}”.`}
      backHref="/ngo/listings"
      backLabel="All listings"
    >
      <ApplicationsReviewClient
        listingId={listing.id}
        listingTitle={listing.title}
        initialApplications={initialApplications}
      />
      <nav
        aria-label="Related pages"
        className="flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted-foreground"
      >
        <Link
          href={`/ngo/listings/${listing.id}/edit`}
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          Edit listing
        </Link>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <Link
          href="/ngo/listings"
          className="font-medium text-primary underline-offset-4 hover:underline"
        >
          All listings
        </Link>
      </nav>
    </DashboardPageLayout>
  );
}
