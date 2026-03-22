import type { NgoProfile } from "@prisma/client";
import type { Prisma } from "@prisma/client";
import { ngoProfileUpsertSchema } from "@/lib/validations/ngo-profile";

/** Normalize Prisma JSON `ageGroupsServed` to string[] for validation and UI. */
export function normalizeAgeGroupsServed(
  value: Prisma.JsonValue | null | undefined
): string[] {
  if (value === null || value === undefined) return [];
  if (!Array.isArray(value)) return [];
  return value.filter((x): x is string => typeof x === "string" && x.trim() !== "");
}

/**
 * True when all required NGO profile fields satisfy {@link ngoProfileUpsertSchema}.
 * `websiteOrSocial` remains optional in the schema (nullable in DB).
 */
export function isNgoProfileComplete(profile: NgoProfile | null): boolean {
  if (!profile) return false;
  const candidate = {
    name: profile.name,
    description: profile.description,
    location: profile.location,
    ageGroupsServed: normalizeAgeGroupsServed(profile.ageGroupsServed),
    contactPersonName: profile.contactPersonName,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    websiteOrSocial: profile.websiteOrSocial ?? undefined,
  };
  return ngoProfileUpsertSchema.safeParse(candidate).success;
}

/** Strip internal fields for NGO-facing API and UI. */
export function toPublicNgoProfile(profile: NgoProfile) {
  return {
    id: profile.id,
    name: profile.name,
    description: profile.description,
    location: profile.location,
    ageGroupsServed: normalizeAgeGroupsServed(profile.ageGroupsServed),
    contactPersonName: profile.contactPersonName,
    contactEmail: profile.contactEmail,
    contactPhone: profile.contactPhone,
    websiteOrSocial: profile.websiteOrSocial,
    createdAt: profile.createdAt.toISOString(),
    updatedAt: profile.updatedAt.toISOString(),
  };
}

export type PublicNgoProfile = ReturnType<typeof toPublicNgoProfile>;
