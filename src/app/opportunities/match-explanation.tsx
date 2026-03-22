import { Badge, type BadgeProps } from "@/components/ui/badge";
import { cn } from "@/lib/cn";
import Link from "next/link";
import type {
  MatchExplanation,
  MatchReason,
  MatchReasonPolarity,
} from "@/lib/listing-match";

function polarityVariant(
  polarity: MatchReasonPolarity
): NonNullable<BadgeProps["variant"]> {
  switch (polarity) {
    case "positive":
      return "success";
    case "negative":
      return "destructive";
    default:
      return "secondary";
  }
}

function ReasonChips({
  reasons,
  max = 4,
  className,
}: {
  reasons: MatchReason[];
  max?: number;
  className?: string;
}) {
  const shown = reasons.slice(0, max);
  if (shown.length === 0) return null;
  return (
    <ul
      className={cn("flex list-none flex-wrap gap-1.5 p-0", className)}
      aria-label="Match factors"
    >
      {shown.map((r) => (
        <li key={r.code}>
          <Badge variant={polarityVariant(r.polarity)} className="font-normal">
            {r.title}
          </Badge>
        </li>
      ))}
    </ul>
  );
}

/** Short summary + a few chips for list cards */
export function MatchExplanationCardHint({
  explanation,
  className,
}: {
  explanation: MatchExplanation | null;
  className?: string;
}) {
  if (!explanation) return null;
  return (
    <div className={cn("space-y-2", className)}>
      <p className="m-0 text-xs leading-relaxed text-muted-foreground">
        {explanation.summary}
      </p>
      <ReasonChips reasons={explanation.reasons} max={4} />
    </div>
  );
}

/** Full breakdown for the opportunity detail page */
export function MatchExplanationDetail({
  explanation,
  className,
  volunteerProfileHref,
}: {
  explanation: MatchExplanation | null;
  className?: string;
  /** Shown when the profile is incomplete so volunteers have a clear next step */
  volunteerProfileHref?: string;
}) {
  if (!explanation) return null;
  return (
    <div
      className={cn(
        "rounded-lg border border-border/80 bg-background/80 p-4 shadow-sm",
        className
      )}
    >
      <p className="m-0 text-sm font-medium text-foreground">
        {explanation.profileIncomplete
          ? "Why we can’t show a match yet"
          : "Why you see this match"}
      </p>
      <p className="mt-1 text-sm text-muted-foreground">{explanation.summary}</p>
      {explanation.profileIncomplete && volunteerProfileHref ? (
        <p className="mt-2 text-sm text-foreground">
          <Link
            href={volunteerProfileHref}
            className="font-medium text-primary hover:underline"
          >
            Complete your volunteer profile
          </Link>{" "}
          to unlock match labels and listing-specific reasons.
        </p>
      ) : null}
      <ul className="mt-3 list-none space-y-2.5 p-0">
        {explanation.reasons.map((r) => (
          <li
            key={r.code}
            className="flex gap-2.5 text-sm leading-snug"
          >
            <span className="shrink-0 pt-0.5">
              <Badge
                variant={polarityVariant(r.polarity)}
                className="font-normal"
              >
                {r.title}
              </Badge>
            </span>
            <span className="text-foreground/90">{r.description}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
