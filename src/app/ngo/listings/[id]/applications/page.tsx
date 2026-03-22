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
      <p className="text-sm text-muted-foreground">
        <Link
          href={`/ngo/listings/${listing.id}/edit`}
          className="font-medium text-primary hover:underline"
        >
          Edit listing
        </Link>
        {" · "}
        <Link href="/ngo/listings" className="font-medium text-primary hover:underline">
          All listings
        </Link>
      </p>
    </DashboardPageLayout>
  );
}
