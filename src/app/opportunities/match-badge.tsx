import { Badge, type BadgeProps } from "@/components/ui/badge";
import type { MatchLabel } from "@/lib/listing-match";
import { cn } from "@/lib/cn";

const labelText: Record<MatchLabel, string> = {
  good_match: "Good match",
  partial_match: "Partial match",
  not_eligible: "Not eligible",
};

const variantByLabel: Record<MatchLabel, NonNullable<BadgeProps["variant"]>> = {
  good_match: "success",
  partial_match: "warning",
  not_eligible: "destructive",
};

export function MatchBadge({
  label,
  className,
  ...props
}: { label: MatchLabel | null } & Omit<BadgeProps, "children">) {
  if (!label) {
    return null;
  }
  return (
    <Badge
      variant={variantByLabel[label]}
      title="Rules-based match for your profile"
      className={cn("tabular-nums", className)}
      {...props}
    >
      {labelText[label]}
    </Badge>
  );
}
