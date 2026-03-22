import { auth } from "@/auth";
import { logoutAction } from "@/app/auth/actions";
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
    <main>
      <h1>Applications</h1>
      <ApplicationsReviewClient
        listingId={listing.id}
        listingTitle={listing.title}
        initialApplications={initialApplications}
      />
      <p style={{ marginTop: "1rem" }}>
        <Link href={`/ngo/listings/${listing.id}/edit`}>Edit listing</Link>
        {" · "}
        <Link href="/ngo/listings">All listings</Link>
      </p>
      <form action={logoutAction}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
