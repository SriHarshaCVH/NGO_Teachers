import { auth } from "@/auth";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { DataList, DataListItem } from "@/components/ui/data-list";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import { toPublicVolunteerApplication } from "@/lib/volunteer-application";
import {
  badgeVariantForApplicationStatus,
  badgeVariantForListingStatus,
  labelForApplicationStatus,
  labelForListingStatus,
} from "@/lib/ui/status-badges";
import type { ApplicationStatus, TeachingNeedStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { cn } from "@/lib/cn";
import Link from "next/link";

function nextStepHint(
  appStatus: ApplicationStatus,
  listingStatus: TeachingNeedStatus
): string {
  if (appStatus === "ACCEPTED") {
    return "Outcome recorded — follow up with the organization if they shared contact details.";
  }
  if (appStatus === "REJECTED") {
    return "Outcome recorded — you can keep browsing other open roles.";
  }
  if (listingStatus === "CLOSED") {
    return "This listing is closed; the organization may still update your application status.";
  }
  if (appStatus === "UNDER_REVIEW") {
    return "The organization is reviewing your application.";
  }
  return "Waiting for the organization to review your application.";
}

function isTerminalApplicationStatus(status: ApplicationStatus): boolean {
  return status === "ACCEPTED" || status === "REJECTED";
}

export default async function VolunteerApplicationsPage() {
  const session = await auth();
  const rows = await prisma.application.findMany({
    where: { volunteerUserId: session!.user.id },
    orderBy: { appliedAt: "desc" },
    include: {
      teachingNeed: {
        select: {
          id: true,
          title: true,
          status: true,
          applicationDeadline: true,
        },
      },
    },
  });

  const applications = rows.map(toPublicVolunteerApplication);

  return (
    <DashboardPageLayout
      title="My applications"
      description="Track where each application stands and what to expect next."
    >
      <div className="space-y-8">
        <SectionHeader
          title="Application list"
          description="Each row shows the role, your application status, and the listing’s current state."
        />

        {applications.length === 0 ? (
          <EmptyState
            title="No applications yet"
            description="When you apply to a teaching opportunity, it will appear here with status updates from the organization."
            action={
              <ButtonLink href="/opportunities" variant="primary" size="md">
                Browse opportunities
              </ButtonLink>
            }
          />
        ) : (
          <DataList>
            {applications.map((a) => {
              const terminal = isTerminalApplicationStatus(a.status);
              const deadline = new Date(a.listing.applicationDeadline);
              const deadlineLabel = deadline.toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
              });
              return (
                <DataListItem
                  key={a.id}
                  className={cn(
                    "items-stretch gap-4 sm:items-start",
                    terminal && "bg-muted/15"
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3 sm:gap-y-1">
                      <Link
                        href={`/opportunities/${a.listing.id}`}
                        className="text-base font-semibold text-foreground hover:text-primary hover:underline"
                      >
                        {a.listing.title}
                      </Link>
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge
                          variant={badgeVariantForApplicationStatus(a.status)}
                        >
                          {labelForApplicationStatus(a.status)}
                        </Badge>
                        {terminal ? (
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Final
                          </span>
                        ) : (
                          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            In progress
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 text-sm text-muted-foreground sm:flex-row sm:flex-wrap sm:gap-x-4 sm:gap-y-1">
                      <span className="inline-flex items-center gap-1.5">
                        Listing:{" "}
                        <Badge
                          variant={badgeVariantForListingStatus(a.listing.status)}
                          className="font-normal"
                        >
                          {labelForListingStatus(a.listing.status)}
                        </Badge>
                      </span>
                      <span>Deadline {deadlineLabel}</span>
                      <span>
                        Applied{" "}
                        {new Date(a.appliedAt).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </span>
                    </div>
                    <p
                      className={cn(
                        "text-sm leading-relaxed",
                        terminal ? "text-muted-foreground" : "text-foreground"
                      )}
                    >
                      {nextStepHint(a.status, a.listing.status)}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col gap-2 sm:items-end">
                    <ButtonLink
                      href={`/opportunities/${a.listing.id}`}
                      variant="outline"
                      size="sm"
                      className="w-full sm:w-auto"
                    >
                      View opportunity
                    </ButtonLink>
                  </div>
                </DataListItem>
              );
            })}
          </DataList>
        )}

        <p className="text-sm text-muted-foreground">
          <Link href="/volunteer" className="font-medium text-primary hover:underline">
            Volunteer dashboard
          </Link>
          {" · "}
          <Link
            href="/volunteer/profile"
            className="font-medium text-primary hover:underline"
          >
            Volunteer profile
          </Link>
        </p>
      </div>
    </DashboardPageLayout>
  );
}
