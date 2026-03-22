import type { TeachingNeed, VolunteerProfile } from "@prisma/client";
import { TeachingMode } from "@prisma/client";
import { normalizeSubjectsRequired } from "@/lib/listing";
import {
  isVolunteerProfileComplete,
  normalizeJsonStringArray,
} from "@/lib/volunteer-profile";

export type MatchLabel = "good_match" | "partial_match" | "not_eligible";

/** Structured reason codes for eligibility explanations (UI + analytics). */
export type MatchReasonCode =
  | "profile_incomplete"
  | "subject_match"
  | "subject_mismatch"
  | "age_match"
  | "age_mismatch"
  | "mode_match"
  | "mode_mismatch"
  | "language_match"
  | "language_mismatch"
  | "location_match"
  | "location_mismatch"
  | "location_skipped_online"
  | "schedule_aligned"
  | "schedule_not_aligned";

export type MatchReasonPolarity = "positive" | "negative" | "neutral";

export type MatchReason = {
  code: MatchReasonCode;
  polarity: MatchReasonPolarity;
  /** Short label for chips and lists */
  title: string;
  /** Plain-language sentence for volunteers */
  description: string;
};

export type MatchExplanation = {
  /** Same as {@link computeMatchLabel}; null when the profile is missing or incomplete */
  label: MatchLabel | null;
  profileIncomplete: boolean;
  reasons: MatchReason[];
  /** Compact line for list cards */
  summary: string;
};

function formatMode(mode: TeachingMode): string {
  switch (mode) {
    case TeachingMode.ONLINE:
      return "online";
    case TeachingMode.OFFLINE:
      return "in-person";
    case TeachingMode.HYBRID:
      return "hybrid";
    default:
      return String(mode);
  }
}

function overlappingSubjects(
  listingSubjects: string[],
  volunteerSubjects: string[]
): string[] {
  const vol = new Set(volunteerSubjects.map((s) => s.trim().toLowerCase()));
  return listingSubjects.filter((s) => vol.has(s.trim().toLowerCase()));
}

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
  return computeMatchExplanation(profile, listing).label;
}

/**
 * Same rules as {@link computeMatchLabel}, plus human-readable reasons for each
 * dimension (subjects, age, mode, language, location, schedule).
 */
export function computeMatchExplanation(
  profile: VolunteerProfile | null,
  listing: TeachingNeed
): MatchExplanation {
  if (!profile || !isVolunteerProfileComplete(profile)) {
    return {
      label: null,
      profileIncomplete: true,
      reasons: [
        {
          code: "profile_incomplete",
          polarity: "neutral",
          title: "Profile incomplete",
          description:
            "Finish your volunteer profile with subjects, age groups, languages, teaching mode, and availability so we can assess fit for each listing.",
        },
      ],
      summary:
        "Complete your profile to see how you match—eligibility can’t be fully determined until then.",
    };
  }

  const listingSubjects = normalizeSubjectsRequired(listing.subjectsRequired);
  const volunteerSubjects = normalizeJsonStringArray(profile.subjects);
  const ageComfort = normalizeJsonStringArray(profile.ageGroupsComfort);
  const volunteerLangs = normalizeJsonStringArray(profile.languages);

  const reasons: MatchReason[] = [];

  if (!subjectOverlap(listingSubjects, volunteerSubjects)) {
    reasons.push({
      code: "subject_mismatch",
      polarity: "negative",
      title: "Subject",
      description:
        "None of your teaching subjects overlap with what this role is looking for.",
    });
    return {
      label: "not_eligible",
      profileIncomplete: false,
      reasons,
      summary:
        "Not eligible: your subjects don’t match the subjects needed for this role.",
    };
  }

  const overlap = overlappingSubjects(listingSubjects, volunteerSubjects);
  const subjectLabel = overlap.join(", ");
  reasons.push({
    code: "subject_match",
    polarity: "positive",
    title: "Subject",
    description: `You teach ${subjectLabel}, which matches what this listing needs.`,
  });

  if (!ageInComfort(listing.ageGroup, ageComfort)) {
    reasons.push({
      code: "age_mismatch",
      polarity: "negative",
      title: "Age group",
      description: `This role is for learners ${listing.ageGroup.trim()}; that age group isn’t in the comfort range on your profile.`,
    });
    return {
      label: "not_eligible",
      profileIncomplete: false,
      reasons,
      summary:
        "Not eligible: the learner age group for this role doesn’t match your profile.",
    };
  }

  reasons.push({
    code: "age_match",
    polarity: "positive",
    title: "Age group",
    description: `You’re comfortable teaching ${listing.ageGroup.trim()}, which matches this role.`,
  });

  if (!modeCompatible(profile.preferredMode, listing.mode)) {
    reasons.push({
      code: "mode_mismatch",
      polarity: "negative",
      title: "Teaching mode",
      description: `This role is ${formatMode(listing.mode)}; your profile prefers ${formatMode(profile.preferredMode)} teaching.`,
    });
    return {
      label: "not_eligible",
      profileIncomplete: false,
      reasons,
      summary:
        "Not eligible: your preferred teaching mode doesn’t line up with this role.",
    };
  }

  reasons.push({
    code: "mode_match",
    polarity: "positive",
    title: "Teaching mode",
    description: modeMatchDescription(profile.preferredMode, listing.mode),
  });

  if (!languageAligned(listing.languagePreference, volunteerLangs)) {
    const lp = listing.languagePreference.trim();
    reasons.push({
      code: "language_mismatch",
      polarity: "negative",
      title: "Language",
      description:
        lp.length === 0
          ? "This listing doesn’t list a language we can match to your profile. Update your languages if needed, or confirm details with the organization."
          : `This role expects teaching aligned with “${lp}”; that doesn’t match the languages on your profile.`,
    });
    return {
      label: "not_eligible",
      profileIncomplete: false,
      reasons,
      summary:
        "Not eligible: the language expectations for this role don’t match your profile.",
    };
  }

  reasons.push({
    code: "language_match",
    polarity: "positive",
    title: "Language",
    description: `Your languages are compatible with this role’s language preference (${listing.languagePreference.trim()}).`,
  });

  if (listing.mode === TeachingMode.ONLINE) {
    reasons.push({
      code: "location_skipped_online",
      polarity: "neutral",
      title: "Location",
      description:
        "This role is online, so location isn’t used to decide eligibility.",
    });
  } else if (
    !locationCompatible(profile.location, listing.location, listing.mode)
  ) {
    reasons.push({
      code: "location_mismatch",
      polarity: "negative",
      title: "Location",
      description:
        "Where you’re based doesn’t overlap enough with where this in-person or hybrid role needs teaching.",
    });
    return {
      label: "not_eligible",
      profileIncomplete: false,
      reasons,
      summary:
        "Not eligible: your location doesn’t match where this role needs teaching.",
    };
  } else {
    reasons.push({
      code: "location_match",
      polarity: "positive",
      title: "Location",
      description: `Your location and the role’s location (${listing.location.trim()}) are compatible for ${formatMode(listing.mode)} teaching.`,
    });
  }

  const scheduleOk = availabilityOverlapsCommitment(
    profile.availability,
    listing.timeCommitment,
    listing.frequency
  );

  if (scheduleOk) {
    reasons.push({
      code: "schedule_aligned",
      polarity: "positive",
      title: "Schedule",
      description:
        "Something in your availability lines up with the time commitment and frequency described for this role.",
    });
    return {
      label: "good_match",
      profileIncomplete: false,
      reasons,
      summary:
        "Strong match: your core requirements fit, and your availability appears to align with the schedule.",
    };
  }

  reasons.push({
    code: "schedule_not_aligned",
    polarity: "negative",
    title: "Schedule",
    description:
      "You meet the main requirements, but your stated availability doesn’t clearly match the time commitment or frequency for this role—worth a closer look before applying.",
  });
  return {
    label: "partial_match",
    profileIncomplete: false,
    reasons,
    summary:
      "Partial match: core requirements fit, but availability may not match the listed schedule.",
  };
}

function modeMatchDescription(
  volunteerPref: TeachingMode,
  listingMode: TeachingMode
): string {
  if (volunteerPref === TeachingMode.HYBRID || listingMode === TeachingMode.HYBRID) {
    return "Your teaching mode and this listing’s format are compatible (including hybrid flexibility).";
  }
  return `You both prefer ${formatMode(listingMode)} teaching.`;
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
