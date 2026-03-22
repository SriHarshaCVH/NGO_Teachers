import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";

/** NGO may only move applications forward; never set PENDING via API. */
export const ngoApplicationStatusUpdateSchema = z.object({
  status: z.enum([
    ApplicationStatus.UNDER_REVIEW,
    ApplicationStatus.ACCEPTED,
    ApplicationStatus.REJECTED,
  ]),
});

export type NgoApplicationStatusUpdateInput = z.infer<
  typeof ngoApplicationStatusUpdateSchema
>;
