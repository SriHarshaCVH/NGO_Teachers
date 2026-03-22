import { TeachingMode } from "@prisma/client";
import { z } from "zod";

/** Optional query params for GET /api/listings/discovery */
export const discoveryQuerySchema = z.object({
  subject: z.string().trim().min(1).optional(),
  location: z.string().trim().min(1).optional(),
  mode: z.nativeEnum(TeachingMode).optional(),
  ageGroup: z.string().trim().min(1).optional(),
  language: z.string().trim().min(1).optional(),
});

export type DiscoveryQueryInput = z.output<typeof discoveryQuerySchema>;
