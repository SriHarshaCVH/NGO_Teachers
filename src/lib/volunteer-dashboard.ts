import type { ApplicationStatus, TeachingNeed, VolunteerProfile } from "@prisma/client";
import { TeachingNeedStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toPublicListing } from "@/lib/listing";
import { computeMatchLabel, type MatchLabel } from "@/lib/listing-match";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";

export type VolunteerApplicationCounts = {
  total: number;
  PENDING: number;
  UNDER_REVIEW: number;
  ACCEPTED: number;
  REJECTED: number;
};

export type RecommendedListingItem = {
  listing: ReturnType<typeof toPublicListing>;
  matchLabel: MatchLabel;
};

export type VolunteerDashboardData = {
  applicationCounts: VolunteerApplicationCounts;
  recommended: RecommendedListingItem[];
};

const emptyApplicationCounts = (): VolunteerApplicationCounts => ({
  total: 0,
  PENDING: 0,
  UNDER_REVIEW: 0,
  ACCEPTED: 0,
  REJECTED: 0,
});

export async function getVolunteerApplicationCounts(
  volunteerUserId: string
): Promise<VolunteerApplicationCounts> {
  const grouped = await prisma.application.groupBy({
    by: ["status"],
    where: { volunteerUserId },
    _count: { _all: true },
  });

  const applicationCounts = emptyApplicationCounts();
  for (const row of grouped) {
    const n = row._count._all;
    applicationCounts[row.status as ApplicationStatus] = n;
    applicationCounts.total += n;
  }
  return applicationCounts;
}

/**
 * Top OPEN listings for this volunteer using {@link computeMatchLabel}, excluding
 * already-applied listings. Prefers good_match over partial_match, then recency.
 */
export async function getRecommendedVolunteerOpportunities(
  volunteerUserId: string,
  profile: VolunteerProfile | null,
  limit = 5
): Promise<RecommendedListingItem[]> {
  if (!profile || !isVolunteerProfileComplete(profile)) {
    return [];
  }

  const appliedRows = await prisma.application.findMany({
    where: { volunteerUserId },
    select: { teachingNeedId: true },
  });
  const applied = new Set(appliedRows.map((r) => r.teachingNeedId));

  const listings = await prisma.teachingNeed.findMany({
    where: { status: TeachingNeedStatus.OPEN },
    orderBy: { updatedAt: "desc" },
    take: 200,
  });

  const ranked: { listing: TeachingNeed; matchLabel: MatchLabel }[] = [];
  for (const listing of listings) {
    if (applied.has(listing.id)) continue;
    const label = computeMatchLabel(profile, listing);
    if (label === "good_match" || label === "partial_match") {
      ranked.push({ listing, matchLabel: label });
    }
  }

  ranked.sort((a, b) => {
    const order = (m: MatchLabel) => (m === "good_match" ? 0 : 1);
    const d = order(a.matchLabel) - order(b.matchLabel);
    if (d !== 0) return d;
    return b.listing.updatedAt.getTime() - a.listing.updatedAt.getTime();
  });

  return ranked.slice(0, limit).map(({ listing, matchLabel }) => ({
    listing: toPublicListing(listing),
    matchLabel,
  }));
}

export async function getVolunteerDashboardData(
  volunteerUserId: string,
  profile: VolunteerProfile | null
): Promise<VolunteerDashboardData> {
  const [applicationCounts, recommended] = await Promise.all([
    getVolunteerApplicationCounts(volunteerUserId),
    getRecommendedVolunteerOpportunities(volunteerUserId, profile, 5),
  ]);
  return { applicationCounts, recommended };
}
