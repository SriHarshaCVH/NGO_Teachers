import type { ApplicationStatus, TeachingNeedStatus } from "@prisma/client";
import type { BadgeVariant } from "@/components/ui/badge";

/** Human-readable labels for application status badges and lists. */
export function labelForApplicationStatus(status: ApplicationStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "UNDER_REVIEW":
      return "Under review";
    case "ACCEPTED":
      return "Accepted";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

/** Human-readable labels for teaching listing status badges and lists. */
export function labelForListingStatus(status: TeachingNeedStatus): string {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "OPEN":
      return "Open";
    case "CLOSED":
      return "Closed";
    default:
      return status;
  }
}

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
