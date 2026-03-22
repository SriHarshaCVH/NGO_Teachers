import type { Application, User, VolunteerProfile } from "@prisma/client";
import { ApplicationStatus } from "@prisma/client";

/**
 * Allowed Phase 1 transitions (PENDING and UNDER_REVIEW are non-terminal).
 */
export function canTransitionApplicationStatus(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  if (from === ApplicationStatus.ACCEPTED || from === ApplicationStatus.REJECTED) {
    return false;
  }
  if (from === ApplicationStatus.PENDING) {
    return (
      to === ApplicationStatus.UNDER_REVIEW ||
      to === ApplicationStatus.ACCEPTED ||
      to === ApplicationStatus.REJECTED
    );
  }
  if (from === ApplicationStatus.UNDER_REVIEW) {
    return to === ApplicationStatus.ACCEPTED || to === ApplicationStatus.REJECTED;
  }
  return false;
}

export type PublicVolunteerProfileForNgoReview = {
  fullName: string;
  bio: string;
  location: string;
  educationBackground: string;
  subjects: unknown;
  ageGroupsComfort: unknown;
  languages: unknown;
  preferredMode: string;
  availability: string;
  priorExperience: string;
  resumeUrl: string | null;
};

export function toPublicVolunteerProfileForNgoReview(
  profile: VolunteerProfile
): PublicVolunteerProfileForNgoReview {
  return {
    fullName: profile.fullName,
    bio: profile.bio,
    location: profile.location,
    educationBackground: profile.educationBackground,
    subjects: profile.subjects,
    ageGroupsComfort: profile.ageGroupsComfort,
    languages: profile.languages,
    preferredMode: profile.preferredMode,
    availability: profile.availability,
    priorExperience: profile.priorExperience,
    resumeUrl: profile.resumeUrl,
  };
}

export type NgoApplicationListItem = {
  id: string;
  status: ApplicationStatus;
  appliedAt: string;
  volunteer: {
    fullName: string;
  };
};

type ListItemInclude = Application & {
  volunteerUser: Pick<User, "id"> & {
    volunteerProfile: Pick<VolunteerProfile, "fullName"> | null;
  };
};

export function toNgoApplicationListItem(app: ListItemInclude): NgoApplicationListItem {
  return {
    id: app.id,
    status: app.status,
    appliedAt: app.appliedAt.toISOString(),
    volunteer: {
      fullName: app.volunteerUser.volunteerProfile?.fullName ?? "Unknown applicant",
    },
  };
}

export type NgoApplicationDetailResponse = {
  application: {
    id: string;
    status: ApplicationStatus;
    appliedAt: string;
    reviewedAt: string | null;
  };
  volunteerProfile: PublicVolunteerProfileForNgoReview | null;
};

export function toNgoApplicationDetailResponse(
  app: Application,
  volunteerProfile: VolunteerProfile | null
): NgoApplicationDetailResponse {
  return {
    application: {
      id: app.id,
      status: app.status,
      appliedAt: app.appliedAt.toISOString(),
      reviewedAt: app.reviewedAt?.toISOString() ?? null,
    },
    volunteerProfile: volunteerProfile
      ? toPublicVolunteerProfileForNgoReview(volunteerProfile)
      : null,
  };
}
