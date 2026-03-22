import { auth } from "@/auth";
import { PublicShell } from "@/components/layout/public-shell";
import { Alert } from "@/components/ui/alert";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { matchExplanationForVolunteerSession } from "@/lib/discovery-match";
import { fetchOpenListingById } from "@/lib/listing-discovery";
import { toPublicListing } from "@/lib/listing";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyToListing, type ApplySectionUiState } from "../apply-to-listing";
import { MatchExplanationDetail } from "../match-explanation";
import { MatchBadge } from "../match-badge";
import { formatTeachingMode } from "../opportunity-helpers";

type PageProps = { params: Promise<{ id: string }> };

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const row = await fetchOpenListingById(id);
  if (!row) {
    notFound();
  }

  const session = await auth();
  const listing = toPublicListing(row);
  const matchExplanation = await matchExplanationForVolunteerSession(session, row);
  const matchLabel = matchExplanation?.label ?? null;

  let volunteerProfileIncomplete = false;
  let hasApplied = false;
  if (session?.user?.role === "VOLUNTEER") {
    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.user.id },
    });
    volunteerProfileIncomplete = !isVolunteerProfileComplete(profile);
    const existing = await prisma.application.findUnique({
      where: {
        teachingNeedId_volunteerUserId: {
          teachingNeedId: id,
          volunteerUserId: session.user.id,
        },
      },
    });
    hasApplied = Boolean(existing);
  }

  const deadlinePassed =
    Date.now() > new Date(listing.applicationDeadline).getTime();

  let applyState: ApplySectionUiState = "anonymous";
  if (!session?.user) {
    applyState = "anonymous";
  } else if (session.user.role === "NGO") {
    applyState = "ngo";
  } else if (session.user.role === "VOLUNTEER") {
    if (volunteerProfileIncomplete) {
      applyState = "volunteer_incomplete";
    } else if (deadlinePassed) {
      applyState = "deadline_passed";
    } else if (hasApplied) {
      applyState = "already_applied";
    } else if (matchLabel === "not_eligible") {
      applyState = "not_eligible";
    } else if (matchLabel === "good_match" || matchLabel === "partial_match") {
      applyState = "can_apply";
    } else {
      applyState = "not_eligible";
    }
  }

  const roleEyebrow =
    session?.user?.role === "VOLUNTEER" ? (
      <nav
        aria-label="Volunteer shortcuts"
        className="flex flex-wrap items-center gap-x-3 gap-y-1"
      >
        <Link
          href="/volunteer"
          className="font-medium text-foreground hover:text-primary"
        >
          Volunteer dashboard
        </Link>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <Link
          href="/volunteer/applications"
          className="font-medium text-foreground hover:text-primary"
        >
          My applications
        </Link>
      </nav>
    ) : session?.user?.role === "NGO" ? (
      <nav
        aria-label="NGO shortcuts"
        className="flex flex-wrap items-center gap-x-3 gap-y-1"
      >
        <Link
          href="/ngo"
          className="font-medium text-foreground hover:text-primary"
        >
          NGO dashboard
        </Link>
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <Link
          href="/ngo/listings"
          className="font-medium text-foreground hover:text-primary"
        >
          Manage listings
        </Link>
      </nav>
    ) : null;

  const deadlineLabel = new Date(listing.applicationDeadline).toLocaleString();

  return (
    <PublicShell contentVariant="wide" nav="default">
      <div className="space-y-8 sm:space-y-10">
        <PageHeader
          title={listing.title}
          description={`Subjects: ${listing.subjectsRequired.join(", ")}`}
          backHref="/opportunities"
          backLabel="All opportunities"
          eyebrow={roleEyebrow}
        />

        <Card className="overflow-hidden border-primary/25 bg-gradient-to-br from-primary/[0.06] via-surface to-surface">
          <CardHeader className="space-y-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                  At a glance
                </p>
                <p className="text-lg font-medium text-foreground sm:text-xl">
                  {formatTeachingMode(listing.mode)} · {listing.location}
                </p>
                <p className="text-sm text-muted-foreground">
                  {listing.ageGroup} · {listing.languagePreference}
                </p>
              </div>
              {matchLabel ? (
                <div className="flex flex-col items-start gap-2 rounded-lg border border-border/80 bg-background/60 p-3 sm:items-end sm:min-w-[12rem]">
                  <span className="text-xs font-medium text-muted-foreground">
                    Match for your profile
                  </span>
                  <MatchBadge label={matchLabel} />
                </div>
              ) : null}
            </div>
            {matchExplanation ? (
              <MatchExplanationDetail
                explanation={matchExplanation}
                volunteerProfileHref="/volunteer/profile"
              />
            ) : null}
            {volunteerProfileIncomplete && !matchExplanation?.profileIncomplete ? (
              <Alert variant="info" title="Match labels need a complete profile">
                <p className="m-0">
                  Finish your{" "}
                  <Link href="/volunteer/profile" className="font-medium">
                    volunteer profile
                  </Link>{" "}
                  to see how well this role fits your teaching background.
                </p>
              </Alert>
            ) : null}
          </CardHeader>
        </Card>

        <section
          aria-labelledby="listing-details-heading"
          className="space-y-4"
        >
          <SectionHeader
            id="listing-details-heading"
            title="Role details"
            description="Logistics and expectations published by the organization."
          />
          <Card>
            <CardContent className="p-4 sm:p-6">
              <dl className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Teaching mode
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {formatTeachingMode(listing.mode)}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Location
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {listing.location}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Age group
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {listing.ageGroup}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Language
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {listing.languagePreference}
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Application deadline
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    <time dateTime={listing.applicationDeadline}>
                      {deadlineLabel}
                    </time>
                  </dd>
                </div>
                <div className="space-y-1">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Volunteers needed
                  </dt>
                  <dd className="text-sm font-medium tabular-nums text-foreground">
                    {listing.volunteersNeeded}
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Time commitment
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {listing.timeCommitment}
                  </dd>
                </div>
                <div className="space-y-1 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Frequency
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {listing.frequency}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </section>

        {listing.qualificationsText ? (
          <section
            aria-labelledby="listing-qualifications-heading"
            className="space-y-4"
          >
            <SectionHeader
              id="listing-qualifications-heading"
              title="Qualifications"
            />
            <Card>
              <CardContent className="p-4 sm:p-6">
                <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                  {listing.qualificationsText}
                </p>
              </CardContent>
            </Card>
          </section>
        ) : null}

        <section
          aria-labelledby="listing-description-heading"
          className="space-y-4"
        >
          <SectionHeader
            id="listing-description-heading"
            title="About this role"
          />
          <Card>
            <CardContent className="p-4 sm:p-6">
              <p className="m-0 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                {listing.description}
              </p>
            </CardContent>
          </Card>
        </section>

        <ApplyToListing
          listingId={id}
          loginHref={`/login?callbackUrl=${encodeURIComponent(`/opportunities/${id}`)}`}
          volunteerProfileHref="/volunteer/profile"
          applicationsHref="/volunteer/applications"
          state={applyState}
          eligibilityExplanation={matchExplanation}
        />
      </div>
    </PublicShell>
  );
}
