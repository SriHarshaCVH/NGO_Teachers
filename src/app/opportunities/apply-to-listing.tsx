"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ButtonLink } from "@/components/ui/button-link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import type { MatchExplanation } from "@/lib/listing-match";

export type ApplySectionUiState =
  | "anonymous"
  | "ngo"
  | "volunteer_incomplete"
  | "deadline_passed"
  | "not_eligible"
  | "already_applied"
  | "can_apply";

type ApplyToListingProps = {
  listingId: string;
  loginHref: string;
  volunteerProfileHref: string;
  applicationsHref: string;
  state: ApplySectionUiState;
  /** Rules-based explanation; mirrors the match panel on the listing page */
  eligibilityExplanation?: MatchExplanation | null;
};

export function ApplyToListing({
  listingId,
  loginHref,
  volunteerProfileHref,
  applicationsHref,
  state,
  eligibilityExplanation,
}: ApplyToListingProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/volunteer/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId }),
      });
      const data = (await res.json()) as { message?: string; error?: string };
      if (!res.ok) {
        setError(data.message ?? data.error ?? "Could not submit application.");
        return;
      }
      setSuccess(true);
      router.refresh();
    } catch {
      setError("Network error. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      aria-labelledby="apply-panel-heading"
      className="space-y-4"
    >
      <SectionHeader
        id="apply-panel-heading"
        title="Apply"
        description="Submit your interest when you are eligible and the deadline is still open."
      />
      <Card className="border-primary/30 shadow-md">
        <CardHeader className="space-y-1 pb-2">
          <CardTitle className="text-lg font-semibold tracking-tight">
            Your application
          </CardTitle>
          <CardDescription>
            {state === "can_apply" && !success
              ? "You meet the minimum requirements and can submit interest for this listing."
              : "The section below reflects your account, profile, and eligibility for this role."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-2">
          <div aria-live="polite" className="space-y-4">
            {success ? (
              <Alert variant="success" title="Application submitted">
                <p className="m-0">
                  Thank you—your interest is on record.{" "}
                  <Link href={applicationsHref} className="font-medium">
                    View your applications
                  </Link>
                  .
                </p>
              </Alert>
            ) : null}
            {error ? (
              <Alert variant="error" title="Could not apply">
                <p className="m-0">{error}</p>
              </Alert>
            ) : null}

            {state === "anonymous" ? (
              <Alert variant="info" title="Sign in to apply">
                <p className="m-0">
                  <Link href={loginHref} className="font-medium">
                    Log in
                  </Link>{" "}
                  with a volunteer account to submit an application for this
                  listing.
                </p>
              </Alert>
            ) : null}

            {state === "ngo" ? (
              <Alert variant="info" title="Wrong account type for applying">
                <p className="m-0">
                  Only volunteer accounts can apply to listings. Sign in with a
                  volunteer profile, or share this role with someone who teaches.
                </p>
              </Alert>
            ) : null}

            {state === "volunteer_incomplete" ? (
              <Alert variant="warning" title="Complete your profile first">
                <p className="m-0">
                  Finish your{" "}
                  <Link href={volunteerProfileHref} className="font-medium">
                    volunteer profile
                  </Link>{" "}
                  so we can confirm you meet the role requirements before you
                  apply.
                  {eligibilityExplanation?.profileIncomplete ? (
                    <>
                      {" "}
                      {eligibilityExplanation.summary}
                    </>
                  ) : null}
                </p>
              </Alert>
            ) : null}

            {state === "deadline_passed" ? (
              <Alert variant="warning" title="Deadline has passed">
                <p className="m-0">
                  The application deadline for this listing has passed. Browse
                  other open roles from the opportunities list.
                </p>
              </Alert>
            ) : null}

            {state === "not_eligible" ? (
              <Alert variant="warning" title="Not eligible for this listing">
                <div className="space-y-3">
                  <p className="m-0">
                    Your profile does not meet the minimum requirements for this
                    role, so applying is not available. Consider exploring other
                    listings that better match your subjects and preferences.
                  </p>
                  {eligibilityExplanation &&
                  !eligibilityExplanation.profileIncomplete ? (
                    <ul className="m-0 list-none space-y-2 p-0">
                      {eligibilityExplanation.reasons.map((r) => (
                        <li
                          key={r.code}
                          className="flex gap-2 text-sm leading-snug text-foreground/90"
                        >
                          <span
                            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-warning"
                            aria-hidden
                          />
                          <span>{r.description}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Alert>
            ) : null}

            {state === "already_applied" ? (
              <Alert variant="success" title="Already applied">
                <p className="m-0">
                  You have already submitted interest for this listing.{" "}
                  <Link href={applicationsHref} className="font-medium">
                    View your applications
                  </Link>{" "}
                  for status updates.
                </p>
              </Alert>
            ) : null}

            {state === "can_apply" && !success ? (
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  onClick={submit}
                  disabled={loading}
                  loading={loading}
                  size="lg"
                >
                  {loading ? "Submitting…" : "Apply now"}
                </Button>
                <p className="text-sm text-muted-foreground">
                  You can withdraw or follow up from your applications list
                  after submitting.
                </p>
              </div>
            ) : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
