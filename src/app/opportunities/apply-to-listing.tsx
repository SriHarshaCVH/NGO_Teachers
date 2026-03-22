"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

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
};

export function ApplyToListing({
  listingId,
  loginHref,
  volunteerProfileHref,
  applicationsHref,
  state,
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
    <section aria-label="Apply to this opportunity">
      <h2>Apply</h2>
      {success ? (
        <p className="notice">
          Application submitted.{" "}
          <Link href={applicationsHref}>View your applications</Link>.
        </p>
      ) : null}
      {error ? <p className="error">{error}</p> : null}

      {state === "anonymous" ? (
        <p className="muted">
          <Link href={loginHref}>Log in</Link> as a volunteer to apply.
        </p>
      ) : null}

      {state === "ngo" ? (
        <p className="muted">Only volunteer accounts can apply to listings.</p>
      ) : null}

      {state === "volunteer_incomplete" ? (
        <p className="muted">
          Complete your{" "}
          <Link href={volunteerProfileHref}>volunteer profile</Link> before
          applying.
        </p>
      ) : null}

      {state === "deadline_passed" ? (
        <p className="muted">The application deadline for this listing has passed.</p>
      ) : null}

      {state === "not_eligible" ? (
        <p className="muted">
          Your profile does not meet the minimum requirements for this listing,
          so you cannot apply.
        </p>
      ) : null}

      {state === "already_applied" ? (
        <p className="muted">
          You have already applied.{" "}
          <Link href={applicationsHref}>View your applications</Link>.
        </p>
      ) : null}

      {state === "can_apply" && !success ? (
        <p>
          <button type="button" onClick={submit} disabled={loading}>
            {loading ? "Submitting…" : "Apply now"}
          </button>
        </p>
      ) : null}
    </section>
  );
}
