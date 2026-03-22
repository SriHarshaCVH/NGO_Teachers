import { z } from "zod";

export const volunteerApplicationCreateSchema = z.object({
  listingId: z.string().min(1, "listingId is required"),
});

export type VolunteerApplicationCreateInput = z.infer<
  typeof volunteerApplicationCreateSchema
>;
