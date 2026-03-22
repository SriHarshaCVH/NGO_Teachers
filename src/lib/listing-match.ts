import type { TeachingNeed, VolunteerProfile } from "@prisma/client";
import { TeachingMode } from "@prisma/client";
import { normalizeSubjectsRequired } from "@/lib/listing";
import {
  isVolunteerProfileComplete,
  normalizeJsonStringArray,
} from "@/lib/volunteer-profile";

export type MatchLabel = "good_match" | "partial_match" | "not_eligible";

/**
 * Deterministic rules-based match between a volunteer profile and a listing.
 *
 * Returns null when the volunteer profile is missing or not complete (browse
 * still works; no label is shown). NGO or anonymous callers should not pass a
 * complete volunteer profile for labeling — callers gate on session role.
 */
export function computeMatchLabel(
  profile: VolunteerProfile | null,
  listing: TeachingNeed
): MatchLabel | null {
  if (!profile || !isVolunteerProfileComplete(profile)) {
    return null;
  }

  const listingSubjects = normalizeSubjectsRequired(listing.subjectsRequired);
  const volunteerSubjects = normalizeJsonStringArray(profile.subjects);
  const ageComfort = normalizeJsonStringArray(profile.ageGroupsComfort);
  const volunteerLangs = normalizeJsonStringArray(profile.languages);

  if (!subjectOverlap(listingSubjects, volunteerSubjects)) {
    return "not_eligible";
  }

  if (!ageInComfort(listing.ageGroup, ageComfort)) {
    return "not_eligible";
  }

  if (!modeCompatible(profile.preferredMode, listing.mode)) {
    return "not_eligible";
  }

  if (!languageAligned(listing.languagePreference, volunteerLangs)) {
    return "not_eligible";
  }

  if (!locationCompatible(profile.location, listing.location, listing.mode)) {
    return "not_eligible";
  }

  if (
    availabilityOverlapsCommitment(
      profile.availability,
      listing.timeCommitment,
      listing.frequency
    )
  ) {
    return "good_match";
  }

  return "partial_match";
}

function subjectOverlap(
  listingSubjects: string[],
  volunteerSubjects: string[]
): boolean {
  if (volunteerSubjects.length === 0 || listingSubjects.length === 0) {
    return false;
  }
  const vol = new Set(volunteerSubjects.map((s) => s.trim().toLowerCase()));
  return listingSubjects.some((s) => vol.has(s.trim().toLowerCase()));
}

function ageInComfort(listingAge: string, comfort: string[]): boolean {
  const la = listingAge.trim().toLowerCase();
  return comfort.some((c) => c.trim().toLowerCase() === la);
}

/** Hybrid matches any concrete mode; otherwise modes must match. */
function modeCompatible(
  volunteerPref: TeachingMode,
  listingMode: TeachingMode
): boolean {
  if (volunteerPref === TeachingMode.HYBRID || listingMode === TeachingMode.HYBRID) {
    return true;
  }
  return volunteerPref === listingMode;
}

function languageAligned(
  listingLanguagePreference: string,
  volunteerLanguages: string[]
): boolean {
  const lp = listingLanguagePreference.trim().toLowerCase();
  if (!lp) return false;
  return volunteerLanguages.some((v) => {
    const vl = v.trim().toLowerCase();
    if (!vl) return false;
    return lp === vl || lp.includes(vl) || vl.includes(lp);
  });
}

/**
 * For ONLINE listings, location is not required. For OFFLINE/HYBRID, require a
 * loose geographic overlap (substring either way, case-insensitive).
 */
function locationCompatible(
  volunteerLocation: string,
  listingLocation: string,
  listingMode: TeachingMode
): boolean {
  if (listingMode === TeachingMode.ONLINE) {
    return true;
  }
  const a = volunteerLocation.trim().toLowerCase();
  const b = listingLocation.trim().toLowerCase();
  if (a.length < 2 || b.length < 2) {
    return false;
  }
  return a.includes(b) || b.includes(a);
}

/** Shared word tokens (length ≥ 3) between availability and time commitment text. */
function availabilityOverlapsCommitment(
  availability: string,
  timeCommitment: string,
  frequency: string
): boolean {
  const blob = `${timeCommitment} ${frequency}`.toLowerCase();
  const words = availability
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .filter((w) => w.length >= 3);
  if (words.length === 0) {
    return false;
  }
  return words.some((w) => blob.includes(w));
}
