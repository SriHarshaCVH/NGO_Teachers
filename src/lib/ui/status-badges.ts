import type { ApplicationStatus, TeachingNeedStatus } from "@prisma/client";
import type { BadgeVariant } from "@/components/ui/badge";

/**
 * Maps domain statuses to shared `Badge` variants for consistent dashboards and lists.
 * Adjust here when adding states; do not scatter ad-hoc colors in pages.
 */
export function badgeVariantForApplicationStatus(
  status: ApplicationStatus
): BadgeVariant {
  switch (status) {
    case "PENDING":
      return "warning";
    case "UNDER_REVIEW":
      return "info";
    case "ACCEPTED":
      return "success";
    case "REJECTED":
      return "destructive";
    default:
      return "secondary";
  }
}

export function badgeVariantForListingStatus(
  status: TeachingNeedStatus
): BadgeVariant {
  switch (status) {
    case "DRAFT":
      return "secondary";
    case "OPEN":
      return "success";
    case "CLOSED":
      return "outline";
    default:
      return "secondary";
  }
}
