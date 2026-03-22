import type { Session } from "next-auth";
import type { Application, TeachingNeed } from "@prisma/client";
import { TeachingNeedStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { computeMatchLabel } from "@/lib/listing-match";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";

export type ApplyPreconditionError =
  | "UNAUTHORIZED"
  | "FORBIDDEN_NOT_VOLUNTEER"
  | "PROFILE_INCOMPLETE"
  | "LISTING_NOT_FOUND"
  | "LISTING_NOT_OPEN"
  | "DEADLINE_PASSED"
  | "NOT_ELIGIBLE"
  | "ALREADY_APPLIED";

export function applyErrorHttpStatus(code: ApplyPreconditionError): number {
  switch (code) {
    case "UNAUTHORIZED":
      return 401;
    case "FORBIDDEN_NOT_VOLUNTEER":
    case "PROFILE_INCOMPLETE":
    case "NOT_ELIGIBLE":
      return 403;
    case "LISTING_NOT_FOUND":
      return 404;
    case "ALREADY_APPLIED":
      return 409;
    case "LISTING_NOT_OPEN":
    case "DEADLINE_PASSED":
      return 400;
    default:
      return 400;
  }
}

const applyErrorMessages: Record<ApplyPreconditionError, string> = {
  UNAUTHORIZED: "You must be logged in to apply.",
  FORBIDDEN_NOT_VOLUNTEER: "Only volunteer accounts can apply to listings.",
  PROFILE_INCOMPLETE:
    "Complete your volunteer profile before applying to opportunities.",
  LISTING_NOT_FOUND: "This listing was not found.",
  LISTING_NOT_OPEN: "Applications are only accepted for open listings.",
  DEADLINE_PASSED: "The application deadline for this listing has passed.",
  NOT_ELIGIBLE:
    "Your profile does not meet the minimum requirements for this listing.",
  ALREADY_APPLIED: "You have already applied to this listing.",
};

export function applyErrorMessage(code: ApplyPreconditionError): string {
  return applyErrorMessages[code];
}

/**
 * Validates session, listing state, profile completeness, deterministic match
 * rules, deadline, and duplicate applications before creating an Application row.
 */
export async function verifyVolunteerCanApply(
  session: Session | null,
  listingId: string
): Promise<
  | { ok: true; volunteerUserId: string; listing: TeachingNeed }
  | { ok: false; code: ApplyPreconditionError }
> {
  if (!session?.user) {
    return { ok: false, code: "UNAUTHORIZED" };
  }
  if (session.user.role !== "VOLUNTEER") {
    return { ok: false, code: "FORBIDDEN_NOT_VOLUNTEER" };
  }

  const listing = await prisma.teachingNeed.findUnique({
    where: { id: listingId },
  });
  if (!listing) {
    return { ok: false, code: "LISTING_NOT_FOUND" };
  }
  if (listing.status !== TeachingNeedStatus.OPEN) {
    return { ok: false, code: "LISTING_NOT_OPEN" };
  }
  if (Date.now() > listing.applicationDeadline.getTime()) {
    return { ok: false, code: "DEADLINE_PASSED" };
  }

  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session.user.id },
  });
  if (!isVolunteerProfileComplete(profile)) {
    return { ok: false, code: "PROFILE_INCOMPLETE" };
  }

  const label = computeMatchLabel(profile, listing);
  if (label === null || label === "not_eligible") {
    return { ok: false, code: "NOT_ELIGIBLE" };
  }

  const existing = await prisma.application.findUnique({
    where: {
      teachingNeedId_volunteerUserId: {
        teachingNeedId: listingId,
        volunteerUserId: session.user.id,
      },
    },
  });
  if (existing) {
    return { ok: false, code: "ALREADY_APPLIED" };
  }

  return {
    ok: true,
    volunteerUserId: session.user.id,
    listing,
  };
}

export function toPublicVolunteerApplication(
  app: Application & {
    teachingNeed: Pick<
      TeachingNeed,
      "id" | "title" | "status" | "applicationDeadline"
    >;
  }
) {
  return {
    id: app.id,
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
    listing: {
      id: app.teachingNeed.id,
      title: app.teachingNeed.title,
      status: app.teachingNeed.status,
      applicationDeadline: app.teachingNeed.applicationDeadline.toISOString(),
    },
  };
}

export type PublicVolunteerApplication = ReturnType<
  typeof toPublicVolunteerApplication
>;
