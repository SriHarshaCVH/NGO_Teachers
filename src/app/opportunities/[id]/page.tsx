import { auth } from "@/auth";
import { matchLabelForVolunteerSession } from "@/lib/discovery-match";
import { fetchOpenListingById } from "@/lib/listing-discovery";
import { toPublicListing } from "@/lib/listing";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyToListing, type ApplySectionUiState } from "../apply-to-listing";
import { MatchBadge } from "../match-badge";

type PageProps = { params: Promise<{ id: string }> };

export default async function OpportunityDetailPage({ params }: PageProps) {
  const { id } = await params;
  const row = await fetchOpenListingById(id);
  if (!row) {
    notFound();
  }

  const session = await auth();
  const listing = toPublicListing(row);
  const matchLabel = await matchLabelForVolunteerSession(session, row);

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

  return (
    <main>
      <p>
        <Link href="/opportunities">← All opportunities</Link>
      </p>
      <h1>{listing.title}</h1>
      {matchLabel ? (
        <p>
          Match: <MatchBadge label={matchLabel} />
        </p>
      ) : null}
      {volunteerProfileIncomplete ? (
        <p className="muted">
          Complete your{" "}
          <Link href="/volunteer/profile">volunteer profile</Link> to see a
          match label for this role.
        </p>
      ) : null}

      <dl>
        <dt>Subjects</dt>
        <dd>{listing.subjectsRequired.join(", ")}</dd>
        <dt>Age group</dt>
        <dd>{listing.ageGroup}</dd>
        <dt>Mode</dt>
        <dd>{listing.mode}</dd>
        <dt>Location</dt>
        <dd>{listing.location}</dd>
        <dt>Time commitment</dt>
        <dd>{listing.timeCommitment}</dd>
        <dt>Frequency</dt>
        <dd>{listing.frequency}</dd>
        <dt>Language</dt>
        <dd>{listing.languagePreference}</dd>
        <dt>Volunteers needed</dt>
        <dd>{listing.volunteersNeeded}</dd>
        <dt>Application deadline</dt>
        <dd>{new Date(listing.applicationDeadline).toLocaleString()}</dd>
        {listing.qualificationsText ? (
          <>
            <dt>Qualifications</dt>
            <dd>{listing.qualificationsText}</dd>
          </>
        ) : null}
        <dt>Description</dt>
        <dd>{listing.description}</dd>
      </dl>

      <ApplyToListing
        listingId={id}
        loginHref="/login"
        volunteerProfileHref="/volunteer/profile"
        applicationsHref="/volunteer/applications"
        state={applyState}
      />
    </main>
  );
}
