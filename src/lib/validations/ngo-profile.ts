import { z } from "zod";

/**
 * Required NGO profile fields for create/update (Phase 1).
 * `approvalStatus` is server-managed and not accepted from clients.
 */
export const ngoProfileUpsertSchema = z.object({
  name: z.string().trim().min(1, "Organization name is required"),
  description: z.string().trim().min(1, "Description is required"),
  location: z.string().trim().min(1, "Location is required"),
  ageGroupsServed: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one age group"),
  contactPersonName: z.string().trim().min(1, "Contact name is required"),
  contactEmail: z.string().trim().email("Valid contact email is required"),
  contactPhone: z
    .string()
    .trim()
    .min(7, "Contact phone is required")
    .max(40, "Phone is too long"),
  websiteOrSocial: z
    .string()
    .trim()
    .max(2000, "Link is too long")
    .optional()
    .transform((v) => (v == null || v === "" ? null : v)),
});

export type NgoProfileUpsertInput = z.output<typeof ngoProfileUpsertSchema>;
