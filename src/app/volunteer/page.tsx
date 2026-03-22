import { auth } from "@/auth";
import { VolunteerRecommendedSection } from "@/components/dashboard/volunteer-recommended-section";
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
import { getVolunteerDashboardData } from "@/lib/volunteer-dashboard";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function VolunteerDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });

  const profileComplete = isVolunteerProfileComplete(profile);
  const { applicationCounts, recommended } = await getVolunteerDashboardData(
    userId,
    profile
  );

  return (
    <DashboardPageLayout
      title="Volunteer dashboard"
      description="See your profile status, application progress, and a short list of open roles that fit how you teach."
    >
      <div className="space-y-8">
        {!profileComplete ? (
          <Alert variant="warning" role="status">
            <p className="m-0">
              Your volunteer profile is incomplete. Complete it to apply to
              listings and see personalized match labels.
            </p>
            <div className="mt-4">
              <ButtonLink href="/volunteer/profile" variant="primary" size="md">
                Complete volunteer profile
              </ButtonLink>
            </div>
          </Alert>
        ) : null}

        <Card>
          <CardHeader className="space-y-4 pb-2">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <CardTitle className="text-lg font-semibold tracking-tight">
                  Profile & applications
                </CardTitle>
                <CardDescription>
                  {profileComplete ? (
                    <>Your volunteer profile is complete.</>
                  ) : (
                    <>
                      Share your teaching background so we can show match labels
                      and tailor recommendations.
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
              aria-label="Application totals by status"
            >
              <MetricCard
                label="Total submitted"
                value={applicationCounts.total}
                hint="All applications"
              />
              <MetricCard
                label="Pending"
                value={applicationCounts.PENDING}
                hint="Awaiting NGO review"
              />
              <MetricCard
                label="Under review"
                value={applicationCounts.UNDER_REVIEW}
                hint="In progress"
              />
              <MetricCard
                label="Accepted"
                value={applicationCounts.ACCEPTED}
                hint="Successful match"
              />
              <MetricCard
                className="sm:col-span-2 lg:col-span-1 xl:col-span-1"
                label="Rejected"
                value={applicationCounts.REJECTED}
                hint="Not moving forward"
              />
            </div>
          </CardContent>
        </Card>

        <VolunteerRecommendedSection
          profileComplete={profileComplete}
          recommended={recommended}
        />

        <Card>
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-lg font-semibold tracking-tight">
              What to do next
            </CardTitle>
            <CardDescription>
              Practical steps that mirror how volunteers usually move through the
              platform.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <ol className="m-0 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-foreground">
              {!profileComplete ? (
                <li>
                  <span className="font-medium">Complete your volunteer profile</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — needed before you can apply and see match labels on
                    listings.
                  </span>
                </li>
              ) : (
                <li>
                  <span className="font-medium">Browse open opportunities</span>
                  <span className="text-muted-foreground">
                    {" "}
                    — filter by subject, place, and teaching mode.
                  </span>
                </li>
              )}
              <li>
                <span className="font-medium">Track application status</span>
                <span className="text-muted-foreground">
                  {" "}
                  — pending, under review, accepted, or rejected.
                </span>
              </li>
              <li>
                <span className="font-medium">Keep your profile current</span>
                <span className="text-muted-foreground">
                  {" "}
                  — better data means better matches over time.
                </span>
              </li>
            </ol>
          </CardContent>
        </Card>

        <section aria-labelledby="vol-quick-actions-heading">
          <SectionHeader
            id="vol-quick-actions-heading"
            title="Quick actions"
            description="Same destinations as before—just easier to spot."
          />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ButtonLink
              href="/volunteer/profile"
              variant="outline"
              className="w-full sm:w-auto"
            >
              {profileComplete ? "Edit volunteer profile" : "Go to volunteer profile"}
            </ButtonLink>
            <ButtonLink href="/opportunities" variant="outline" className="w-full sm:w-auto">
              Browse opportunities
            </ButtonLink>
            <ButtonLink
              href="/volunteer/applications"
              variant="primary"
              className="w-full sm:w-auto"
            >
              View my applications
            </ButtonLink>
          </div>
        </section>

        <p className="text-sm text-muted-foreground">
          <Link
            href="/"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            ← Home
          </Link>
        </p>
      </div>
    </DashboardPageLayout>
  );
}
