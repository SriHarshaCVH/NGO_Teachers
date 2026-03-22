import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import type { PublicListing } from "@/lib/listing";
import type { MatchExplanation, MatchLabel } from "@/lib/listing-match";
import { MatchBadge } from "./match-badge";
import { MatchExplanationCardHint } from "./match-explanation";
import { formatDeadlineShort, formatTeachingMode } from "./opportunity-helpers";

export type OpportunityCardProps = {
  listing: PublicListing;
  matchLabel: MatchLabel | null;
  matchExplanation?: MatchExplanation | null;
};

export function OpportunityCard({
  listing,
  matchLabel,
  matchExplanation,
}: OpportunityCardProps) {
  const subjectPreview = listing.subjectsRequired.slice(0, 3).join(", ");
  const subjectExtra =
    listing.subjectsRequired.length > 3
      ? ` +${listing.subjectsRequired.length - 3} more`
      : "";

  return (
    <li>
      <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
        <CardHeader className="space-y-3 pb-2">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <CardTitle className="text-lg font-semibold leading-snug tracking-tight">
              <Link
                href={`/opportunities/${listing.id}`}
                className="text-foreground hover:text-primary focus-visible:rounded-sm"
              >
                {listing.title}
              </Link>
            </CardTitle>
            {matchLabel ? <MatchBadge label={matchLabel} className="shrink-0" /> : null}
          </div>
          <CardDescription className="flex flex-wrap items-center gap-x-2 gap-y-1 text-foreground/90">
            <span className="font-medium">{formatTeachingMode(listing.mode)}</span>
            <span aria-hidden className="text-muted-foreground">
              ·
            </span>
            <span className="text-muted-foreground">{listing.location}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3 pt-0">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground/85">Subjects:</span>{" "}
            {subjectPreview}
            {subjectExtra}
          </p>
          <p className="text-xs text-muted-foreground">
            Apply by{" "}
            <time dateTime={listing.applicationDeadline}>
              {formatDeadlineShort(listing.applicationDeadline)}
            </time>
          </p>
          {matchExplanation ? (
            <MatchExplanationCardHint explanation={matchExplanation} />
          ) : null}
        </CardContent>
        <CardFooter className="border-t border-border/60 pt-4">
          <ButtonLink
            href={`/opportunities/${listing.id}`}
            variant="outline"
            size="sm"
            className="w-full sm:w-auto"
          >
            View role
          </ButtonLink>
        </CardFooter>
      </Card>
    </li>
  );
}
