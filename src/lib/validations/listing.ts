import { TeachingMode, TeachingNeedStatus } from "@prisma/client";
import { z } from "zod";

const deadlineStringSchema = z
  .string()
  .trim()
  .min(1, "Application deadline is required")
  .refine((s) => !Number.isNaN(Date.parse(s)), "Invalid application deadline");

/**
 * Shared listing fields (matches Prisma `TeachingNeed` except server-managed ids/timestamps).
 * `qualificationsText` is optional and stored as null when empty.
 */
export const listingFieldsSchema = z.object({
  title: z.string().trim().min(1, "Title is required").max(500),
  subjectsRequired: z
    .array(z.string().trim().min(1))
    .min(1, "Add at least one subject"),
  ageGroup: z.string().trim().min(1, "Age group is required").max(200),
  mode: z.nativeEnum(TeachingMode),
  location: z.string().trim().min(1, "Location is required").max(500),
  timeCommitment: z.string().trim().min(1, "Time commitment is required").max(500),
  frequency: z.string().trim().min(1, "Frequency is required").max(200),
  languagePreference: z
    .string()
    .trim()
    .min(1, "Language preference is required")
    .max(200),
  qualificationsText: z
    .string()
    .trim()
    .max(2000)
    .nullish()
    .transform((v) => (v == null || v === "" ? null : v)),
  description: z.string().trim().min(1, "Description is required").max(8000),
  volunteersNeeded: z
    .number()
    .int()
    .min(1, "Volunteers needed must be at least 1")
    .max(10000),
  applicationDeadline: deadlineStringSchema,
});

export type ListingFieldsInput = z.output<typeof listingFieldsSchema>;

/** Create: only DRAFT or OPEN. */
export const listingCreateSchema = listingFieldsSchema
  .extend({
    status: z.enum([TeachingNeedStatus.DRAFT, TeachingNeedStatus.OPEN]),
  })
  .superRefine((data, ctx) => {
    if (data.status === TeachingNeedStatus.OPEN) {
      const d = new Date(data.applicationDeadline);
      if (d.getTime() < Date.now()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Application deadline must be in the future to publish",
          path: ["applicationDeadline"],
        });
      }
    }
  });

export type ListingCreateInput = z.output<typeof listingCreateSchema>;

/** PATCH body: any subset of fields; at least one key required. */
export const listingUpdateSchema = listingFieldsSchema
  .partial()
  .extend({
    status: z.nativeEnum(TeachingNeedStatus).optional(),
  })
  .superRefine((data, ctx) => {
    if (Object.keys(data).length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "At least one field is required",
      });
    }
  });

export type ListingUpdateInput = z.output<typeof listingUpdateSchema>;

/**
 * Validates a fully merged listing (used after PATCH merge with existing row).
 * OPEN enforces a future application deadline.
 */
export const listingMergedSchema = listingFieldsSchema
  .extend({
    status: z.nativeEnum(TeachingNeedStatus),
  })
  .superRefine((data, ctx) => {
    if (data.status === TeachingNeedStatus.OPEN) {
      const d = new Date(data.applicationDeadline);
      if (d.getTime() < Date.now()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Application deadline must be in the future for an OPEN listing",
          path: ["applicationDeadline"],
        });
      }
    }
  });

export type ListingMergedInput = z.output<typeof listingMergedSchema>;
