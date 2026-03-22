import type { VolunteerProfile } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { volunteerProfileUpsertSchema } from "@/lib/validations/volunteer-profile";

/** Normalize Prisma JSON string lists for validation and UI. */
export function normalizeJsonStringArray(
  value: Prisma.JsonValue | null | undefined
): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (x): x is string => typeof x === "string" && x.trim() !== ""
  );
}

/**
 * True when all required volunteer profile fields satisfy
 * {@link volunteerProfileUpsertSchema}. `resumeUrl` remains optional.
 */
export function isVolunteerProfileComplete(
  profile: VolunteerProfile | null
): boolean {
  if (!profile) return false;
  const candidate = {
    fullName: profile.fullName,
    bio: profile.bio,
    location: profile.location,
    educationBackground: profile.educationBackground,
    subjects: normalizeJsonStringArray(profile.subjects),
    ageGroupsComfort: normalizeJsonStringArray(profile.ageGroupsComfort),
    languages: normalizeJsonStringArray(profile.languages),
    preferredMode: profile.preferredMode,
    availability: profile.availability,
    priorExperience: profile.priorExperience,
    resumeUrl: profile.resumeUrl ?? undefined,
  };
  return volunteerProfileUpsertSchema.safeParse(candidate).success;
}

/** Strip internal fields for volunteer-facing API and UI. */
export function toPublicVolunteerProfile(profile: VolunteerProfile) {
  return {
    id: profile.id,
    fullName: profile.fullName,
    bio: profile.bio,
    location: profile.location,
    educationBackground: profile.educationBackground,
    subjects: normalizeJsonStringArray(profile.subjects),
    ageGroupsComfort: normalizeJsonStringArray(profile.ageGroupsComfort),
    languages: normalizeJsonStringArray(profile.languages),
    preferredMode: profile.preferredMode,
    availability: profile.availability,
    priorExperience: profile.priorExperience,
    resumeUrl: profile.resumeUrl,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export type PublicVolunteerProfile = ReturnType<typeof toPublicVolunteerProfile>;
