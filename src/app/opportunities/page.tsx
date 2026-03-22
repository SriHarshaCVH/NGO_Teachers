import { auth } from "@/auth";
import { PublicShell } from "@/components/layout/public-shell";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { FilterBar } from "@/components/ui/filter-bar";
import { FormField } from "@/components/ui/form-field";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeader } from "@/components/ui/section-header";
import { Select } from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { matchLabelsForVolunteerSession } from "@/lib/discovery-match";
import { fetchOpenListingsForDiscovery } from "@/lib/listing-discovery";
import { toPublicListing } from "@/lib/listing";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";
import { discoveryQuerySchema } from "@/lib/validations/discovery";
import { prisma } from "@/lib/prisma";
import { TeachingMode } from "@prisma/client";
import Link from "next/link";
import { OpportunityCard } from "./opportunity-card";

function firstString(
  v: string | string[] | undefined
): string | undefined {
  if (typeof v === "string" && v.trim() !== "") {
    return v;
  }
  return undefined;
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = {
    subject: firstString(sp.subject),
    location: firstString(sp.location),
    mode: firstString(sp.mode),
    ageGroup: firstString(sp.ageGroup),
    language: firstString(sp.language),
  };

  const parsed = discoveryQuerySchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : {};
  const queryInvalid = !parsed.success;

  const hasActiveFilters = Boolean(
    filters.subject ||
      filters.location ||
      filters.mode ||
      filters.ageGroup ||
      filters.language
  );

  const rows = await fetchOpenListingsForDiscovery(filters);
  const session = await auth();
  const labels = await matchLabelsForVolunteerSession(session, rows);

  let volunteerProfileIncomplete = false;
  if (session?.user?.role === "VOLUNTEER") {
    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.user.id },
    });
    volunteerProfileIncomplete = !isVolunteerProfileComplete(profile);
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
        <span aria-hidden className="text-muted-foreground">
          ·
        </span>
        <Link
          href="/volunteer/profile"
          className="font-medium text-foreground hover:text-primary"
        >
          Profile
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

  const listingCount = rows.length;
  const resultsSummary =
    listingCount === 0
      ? "No listings to show with the current filters."
      : `${listingCount} open ${listingCount === 1 ? "listing" : "listings"}`;

  return (
    <PublicShell contentVariant="wide" nav="default">
      <div className="space-y-10 sm:space-y-12">
        <PageHeader
          title="Teaching opportunities"
          description="Discover open roles from partner organizations—each listing is live and ready for thoughtful applications."
          eyebrow={
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              {roleEyebrow}
              <Link
                href="/"
                className="text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                ← Home
              </Link>
            </div>
          }
        />

        {queryInvalid ? (
          <Alert variant="warning" title="Some filters were not applied">
            <p className="m-0">
              One or more filter values were invalid and were ignored. Use
              supported options and try again.
            </p>
          </Alert>
        ) : null}

        <section
          aria-labelledby="opportunity-filters-heading"
          className="space-y-4"
        >
          <SectionHeader
            id="opportunity-filters-heading"
            title="Find a role"
            description="Search by subject, place, teaching mode, learner age, or language."
          />
          <Card>
            <CardHeader className="space-y-1 pb-2">
              <CardTitle className="text-lg font-semibold tracking-tight">
                Filters
              </CardTitle>
              <CardDescription>
                Submit the form to refresh results. Use clear all to reset.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2">
              <form method="get" className="space-y-6">
                <FilterBar className="grid-cols-1 sm:grid-cols-2 xl:grid-cols-5">
                  <FormField id="filter-subject" label="Subject" className="mb-0">
                    <Input
                      name="subject"
                      defaultValue={filters.subject ?? ""}
                      placeholder="e.g. Math"
                      autoComplete="off"
                    />
                  </FormField>
                  <FormField id="filter-location" label="Location" className="mb-0">
                    <Input
                      name="location"
                      defaultValue={filters.location ?? ""}
                      placeholder="City or area"
                      autoComplete="off"
                    />
                  </FormField>
                  <FormField id="filter-mode" label="Teaching mode" className="mb-0">
                    <Select name="mode" defaultValue={filters.mode ?? ""}>
                      <option value="">Any</option>
                      <option value={TeachingMode.ONLINE}>Online</option>
                      <option value={TeachingMode.OFFLINE}>Offline</option>
                      <option value={TeachingMode.HYBRID}>Hybrid</option>
                    </Select>
                  </FormField>
                  <FormField id="filter-age" label="Age group" className="mb-0">
                    <Input
                      name="ageGroup"
                      defaultValue={filters.ageGroup ?? ""}
                      placeholder="e.g. 11–14"
                      autoComplete="off"
                    />
                  </FormField>
                  <FormField id="filter-language" label="Language" className="mb-0">
                    <Input
                      name="language"
                      defaultValue={filters.language ?? ""}
                      placeholder="e.g. English"
                      autoComplete="off"
                    />
                  </FormField>
                </FilterBar>
                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                  <Button type="submit">Apply filters</Button>
                  {hasActiveFilters ? (
                    <ButtonLink href="/opportunities" variant="outline">
                      Clear all filters
                    </ButtonLink>
                  ) : null}
                </div>
              </form>
            </CardContent>
          </Card>
        </section>

        {volunteerProfileIncomplete ? (
          <Alert variant="info" title="Complete your profile to see match labels">
            <p className="m-0">
              Add your teaching subjects and preferences on your{" "}
              <Link href="/volunteer/profile" className="font-medium">
                volunteer profile
              </Link>{" "}
              to see how each listing aligns with your background.
            </p>
          </Alert>
        ) : null}

        <section
          aria-labelledby="opportunity-results-heading"
          className="space-y-4"
        >
          <SectionHeader
            id="opportunity-results-heading"
            title="Open listings"
            description={resultsSummary}
          />

          {listingCount === 0 ? (
            hasActiveFilters ? (
              <EmptyState
                title="No matches for these filters"
                description="Try removing a filter, switching teaching mode to “Any”, or broadening location or subject."
                action={
                  <ButtonLink href="/opportunities" variant="outline">
                    Clear all filters
                  </ButtonLink>
                }
              />
            ) : (
              <EmptyState
                title="No open listings right now"
                description="New roles appear as organizations publish them—check back soon, or visit the home page for other ways to get started."
                action={
                  <ButtonLink href="/" variant="outline">
                    Back to home
                  </ButtonLink>
                }
              />
            )
          ) : (
            <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:gap-6">
              {rows.map((row, i) => {
                const listing = toPublicListing(row);
                const matchLabel = labels[i];
                return (
                  <OpportunityCard
                    key={listing.id}
                    listing={listing}
                    matchLabel={matchLabel}
                  />
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </PublicShell>
  );
}
