import type { MatchLabel } from "@/lib/listing-match";

const labelText: Record<MatchLabel, string> = {
  good_match: "Good match",
  partial_match: "Partial match",
  not_eligible: "Not eligible",
};

export function MatchBadge({ label }: { label: MatchLabel | null }) {
  if (!label) {
    return null;
  }
  return (
    <span className="match-badge" title="Rules-based match for your profile">
      {labelText[label]}
    </span>
  );
}
