import type { TeachingNeed } from "@prisma/client";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  computeMatchExplanation,
  computeMatchLabel,
  type MatchExplanation,
  type MatchLabel,
} from "@/lib/listing-match";

/**
 * Match labels are only computed for signed-in volunteers with a complete profile.
 * NGO accounts and anonymous visitors receive null.
 */
export async function matchLabelForVolunteerSession(
  session: Session | null,
  listing: TeachingNeed
): Promise<MatchLabel | null> {
  if (!session?.user || session.user.role !== "VOLUNTEER") {
    return null;
  }
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session.user.id },
  });
  return computeMatchLabel(profile, listing);
}

/** Full eligibility explanation for a single listing (volunteers only). */
export async function matchExplanationForVolunteerSession(
  session: Session | null,
  listing: TeachingNeed
): Promise<MatchExplanation | null> {
  if (!session?.user || session.user.role !== "VOLUNTEER") {
    return null;
  }
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session.user.id },
  });
  return computeMatchExplanation(profile, listing);
}

/** One profile read for many listings (discovery list). */
export async function matchLabelsForVolunteerSession(
  session: Session | null,
  listings: TeachingNeed[]
): Promise<(MatchLabel | null)[]> {
  if (!session?.user || session.user.role !== "VOLUNTEER") {
    return listings.map(() => null);
  }
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session.user.id },
  });
  return listings.map((listing) => computeMatchLabel(profile, listing));
}

/** One profile read; explanations for many listings (discovery list). */
export async function matchExplanationsForVolunteerSession(
  session: Session | null,
  listings: TeachingNeed[]
): Promise<(MatchExplanation | null)[]> {
  if (!session?.user || session.user.role !== "VOLUNTEER") {
    return listings.map(() => null);
  }
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session.user.id },
  });
  return listings.map((listing) => computeMatchExplanation(profile, listing));
}
