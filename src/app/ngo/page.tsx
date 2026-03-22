import { auth } from "@/auth";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MetricCard } from "@/components/ui/metric-card";
import { SectionHeader } from "@/components/ui/section-header";
import { getNgoDashboardData } from "@/lib/ngo-dashboard";
import { isNgoProfileComplete } from "@/lib/ngo-profile";
import { prisma } from "@/lib/prisma";

export default async function NgoDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, stats] = await Promise.all([
    prisma.ngoProfile.findUnique({ where: { userId } }),
    getNgoDashboardData(userId),
  ]);

  const profileComplete = isNgoProfileComplete(profile);

  return (
    <DashboardPageLayout
      title="NGO dashboard"
      description="Track your organization profile, teaching listings, and incoming volunteer applications from one calm overview."
    >
      <div className="space-y-8">
        {!profileComplete ? (
          <Alert variant="warning" role="status">
            <p className="m-0">
              Your organization profile is incomplete. Finish it to publish
              listings and receive applications.
            </p>
            <div className="mt-4">
              <ButtonLink href="/ngo/profile" variant="primary" size="md">
                Complete NGO profile
              </ButtonLink>
            </div>
          </Alert>
        ) : null}

        <Card>
          <CardHeader className="space-y-4 pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold tracking-tight">
                  At a glance
                </CardTitle>
                <CardDescription>
                  {profileComplete ? (
                    <>Your organization profile is complete.</>
                  ) : (
                    <>
                      Complete your profile so partners see who you are before
                      you publish roles.
                    </>
                  )}
                </CardDescription>
              </div>
              <Badge
                variant={profileComplete ? "success" : "warning"}
                className="shrink-0"
              >
                {profileComplete ? "Profile complete" : "Profile incomplete"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-2">
            <div
              className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5"
              aria-label="Listing and application totals"
            >
              <MetricCard
                label="Total listings"
                value={stats.listingCounts.total}
                hint="All statuses"
              />
              <MetricCard
                label="Open"
                value={stats.listingCounts.OPEN}
                hint="Visible to volunteers"
              />
              <MetricCard
                label="Draft"
                value={stats.listingCounts.DRAFT}
                hint="Not yet published"
              />
              <MetricCard
                label="Closed"
                value={stats.listingCounts.CLOSED}
                hint="No longer accepting"
              />
              <MetricCard
                className="sm:col-span-2 lg:col-span-1 xl:col-span-1"
                label="Applications received"
                value={stats.totalApplications}
                hint="Across all listings"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight">
              What to do next
            </CardTitle>
            <CardDescription>
              A short checklist based on where you are today—nothing here changes
              how your data works.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ol className="m-0 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-foreground">
              {!profileComplete ? (
                <li>
                  <span className="font-medium">Finish your organization profile</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — required before you can publish listings and receive
                    applications.
                  </span>
                </li>
              ) : (
                <li>
                  <span className="font-medium">Keep listings up to date</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — open roles attract volunteers; drafts stay private.
                  </span>
                </li>
              )}
              <li>
                <span className="font-medium">Review incoming applications</span>
                <span className="text-muted-foreground">
                  {" "}
                  — respond from each listing&apos;s applications view.
                </span>
              </li>
              <li>
                <span className="font-medium">Refine your public profile</span>
                <span className="text-muted-foreground">
                  {" "}
                  — help volunteers understand your mission and context.
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <section aria-labelledby="ngo-quick-actions-heading">
          <SectionHeader
            id="ngo-quick-actions-heading"
            title="Quick actions"
            description="Jump to the tools you use most—same pages as before."
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink href="/ngo/profile" variant="outline" className="w-full sm:w-auto">
              {profileComplete ? "Edit NGO profile" : "Go to NGO profile"}
            </ButtonLink>
            <ButtonLink href="/ngo/listings" variant="outline" className="w-full sm:w-auto">
              Manage listings
            </ButtonLink>
            <ButtonLink
              href="/ngo/listings#review-applications"
              variant="primary"
              className="w-full sm:w-auto"
            >
              Review applications
            </ButtonLink>
          </div>
        </section>
      </div>
    </DashboardPageLayout>
  );
}
