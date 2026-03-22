import { TeachingMode } from "@prisma/client";
import { z } from "zod";

const stringList = z
  .array(z.string().trim().min(1))
  .min(1, "Add at least one item");

/**
 * Required volunteer profile fields for create/update (Phase 1).
 * `resumeUrl` is optional.
 */
export const volunteerProfileUpsertSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  bio: z.string().trim().min(1, "Bio is required"),
  location: z.string().trim().min(1, "Location is required"),
  educationBackground: z
    .string()
    .trim()
    .min(1, "Education background is required"),
  subjects: stringList,
  ageGroupsComfort: stringList,
  languages: stringList,
  preferredMode: z.nativeEnum(TeachingMode),
  availability: z.string().trim().min(1, "Availability is required"),
  priorExperience: z.string().trim().min(1, "Prior experience is required"),
  resumeUrl: z
    .string()
    .trim()
    .max(2000, "URL is too long")
    .optional()
    .transform((v) => (v == null || v === "" ? null : v))
    .refine(
      (v) => v === null || /^https?:\/\/.+/.test(v),
      "Must be a valid http(s) URL"
    ),
});

export type VolunteerProfileUpsertInput = z.output<
  typeof volunteerProfileUpsertSchema
>;
