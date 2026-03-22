import { prisma } from "@/lib/prisma";
import type { TeachingNeedStatus } from "@prisma/client";

export type NgoListingCounts = {
  total: number;
  DRAFT: number;
  OPEN: number;
  CLOSED: number;
};

export type NgoDashboardData = {
  listingCounts: NgoListingCounts;
  totalApplications: number;
};

const emptyCounts = (): NgoListingCounts => ({
  total: 0,
  DRAFT: 0,
  OPEN: 0,
  CLOSED: 0,
});

/**
 * Aggregates listing counts by status and total applications across the NGO's listings.
 */
export async function getNgoDashboardData(
  ngoUserId: string
): Promise<NgoDashboardData> {
  const [grouped, totalApplications] = await Promise.all([
    prisma.teachingNeed.groupBy({
      by: ["status"],
      where: { ngoUserId },
      _count: { _all: true },
    }),
    prisma.application.count({
      where: { teachingNeed: { ngoUserId } },
    }),
  ]);

  const listingCounts = emptyCounts();
  for (const row of grouped) {
    const n = row._count._all;
    listingCounts[row.status as TeachingNeedStatus] = n;
    listingCounts.total += n;
  }

  return { listingCounts, totalApplications };
}
