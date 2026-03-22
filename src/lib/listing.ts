import type { Prisma, TeachingNeed } from "@prisma/client";
import type { ListingMergedInput, ListingUpdateInput } from "@/lib/validations/listing";

/** Normalize Prisma JSON `subjectsRequired` to string[] for validation and UI. */
export function normalizeSubjectsRequired(
  value: Prisma.JsonValue | null | undefined
): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) return [];
  return value.filter(
    (x): x is string => typeof x === "string" && x.trim() !== ""
  );
}

export function toPublicListing(need: TeachingNeed) {
  return {
    id: need.id,
    title: need.title,
    subjectsRequired: normalizeSubjectsRequired(need.subjectsRequired),
    ageGroup: need.ageGroup,
    mode: need.mode,
    location: need.location,
    timeCommitment: need.timeCommitment,
    frequency: need.frequency,
    languagePreference: need.languagePreference,
    qualificationsText: need.qualificationsText,
    description: need.description,
    volunteersNeeded: need.volunteersNeeded,
    applicationDeadline: need.applicationDeadline.toISOString(),
    status: need.status,
    createdAt: need.createdAt.toISOString(),
    updatedAt: need.updatedAt.toISOString(),
  };
}

export type PublicListing = ReturnType<typeof toPublicListing>;

export function teachingNeedToMergedInput(need: TeachingNeed) {
  return {
    title: need.title,
    subjectsRequired: normalizeSubjectsRequired(need.subjectsRequired),
    ageGroup: need.ageGroup,
    mode: need.mode,
    location: need.location,
    timeCommitment: need.timeCommitment,
    frequency: need.frequency,
    languagePreference: need.languagePreference,
    qualificationsText: need.qualificationsText,
    description: need.description,
    volunteersNeeded: need.volunteersNeeded,
    applicationDeadline: need.applicationDeadline.toISOString(),
    status: need.status,
  };
}

export function mergeListingUpdate(
  existing: TeachingNeed,
  patch: ListingUpdateInput
): ListingMergedInput {
  const b = teachingNeedToMergedInput(existing);
  return {
    title: patch.title ?? b.title,
    subjectsRequired: patch.subjectsRequired ?? b.subjectsRequired,
    ageGroup: patch.ageGroup ?? b.ageGroup,
    mode: patch.mode ?? b.mode,
    location: patch.location ?? b.location,
    timeCommitment: patch.timeCommitment ?? b.timeCommitment,
    frequency: patch.frequency ?? b.frequency,
    languagePreference: patch.languagePreference ?? b.languagePreference,
    qualificationsText:
      patch.qualificationsText !== undefined
        ? patch.qualificationsText
        : b.qualificationsText,
    description: patch.description ?? b.description,
    volunteersNeeded: patch.volunteersNeeded ?? b.volunteersNeeded,
    applicationDeadline: patch.applicationDeadline ?? b.applicationDeadline,
    status: patch.status !== undefined ? patch.status : b.status,
  };
}
