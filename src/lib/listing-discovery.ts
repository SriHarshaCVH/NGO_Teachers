import type { Prisma, TeachingNeed } from "@prisma/client";
import { TeachingNeedStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { normalizeSubjectsRequired } from "@/lib/listing";
import type { DiscoveryQueryInput } from "@/lib/validations/discovery";

/**
 * Returns OPEN listings only, ordered by most recently updated.
 * Applies DB-level filters where possible; subject is filtered in memory (JSON array).
 */
export async function fetchOpenListingsForDiscovery(
  filters: DiscoveryQueryInput
): Promise<TeachingNeed[]> {
  const where: Prisma.TeachingNeedWhereInput = {
    status: TeachingNeedStatus.OPEN,
  };

  if (filters.location) {
    where.location = { contains: filters.location, mode: "insensitive" };
  }
  if (filters.mode) {
    where.mode = filters.mode;
  }
  if (filters.ageGroup) {
    where.ageGroup = { equals: filters.ageGroup, mode: "insensitive" };
  }
  if (filters.language) {
    where.languagePreference = {
      contains: filters.language,
      mode: "insensitive",
    };
  }

  const rows = await prisma.teachingNeed.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });

  if (!filters.subject) {
    return rows;
  }

  const q = filters.subject.trim().toLowerCase();
  return rows.filter((r) =>
    normalizeSubjectsRequired(r.subjectsRequired).some((s) => {
      const sl = s.trim().toLowerCase();
      return sl === q || sl.includes(q) || q.includes(sl);
    })
  );
}

export async function fetchOpenListingById(
  id: string
): Promise<TeachingNeed | null> {
  return prisma.teachingNeed.findFirst({
    where: { id, status: TeachingNeedStatus.OPEN },
  });
}
