import { OpportunityCard } from "@/app/opportunities/opportunity-card";
import { Alert } from "@/components/ui/alert";
import { ButtonLink } from "@/components/ui/button-link";
import { EmptyState } from "@/components/ui/empty-state";
import { SectionHeader } from "@/components/ui/section-header";
import type { RecommendedListingItem } from "@/lib/volunteer-dashboard";

export type VolunteerRecommendedSectionProps = {
  profileComplete: boolean;
  recommended: RecommendedListingItem[];
};

/**
 * Recommended opportunities for the volunteer dashboard — matches browse/detail
 * card treatment; data and matching rules come from the server unchanged.
 */
export function VolunteerRecommendedSection({
  profileComplete,
  recommended,
}: VolunteerRecommendedSectionProps) {
  return (
    <section
      aria-labelledby="vol-recommended-heading"
      className="space-y-4"
    >
      <SectionHeader
        id="vol-recommended-heading"
        title="Recommended opportunities"
        description={
          profileComplete
            ? "Open roles ranked by fit with your profile—the same matching rules as Browse opportunities."
            : "Personalized suggestions appear once your profile is complete."
        }
      />

      {!profileComplete ? (
        <Alert variant="info" role="status">
          <p className="m-0">
            Complete your profile to see a short list of relevant open listings
            based on the same matching rules as Browse opportunities.
          </p>
        </Alert>
      ) : recommended.length === 0 ? (
        <EmptyState
          title="No additional open matches right now."
          action={
            <ButtonLink href="/opportunities" variant="outline">
              Browse all opportunities
            </ButtonLink>
          }
        />
      ) : (
        <ul className="grid list-none gap-4 p-0 sm:grid-cols-2 sm:gap-5 lg:grid-cols-2 xl:gap-6">
          {recommended.map(({ listing, matchLabel }) => (
            <OpportunityCard
              key={listing.id}
              listing={listing}
              matchLabel={matchLabel}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
