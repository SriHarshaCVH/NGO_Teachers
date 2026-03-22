import { auth } from "@/auth";
import { matchLabelForVolunteerSession } from "@/lib/discovery-match";
import { fetchOpenListingById } from "@/lib/listing-discovery";
import { toPublicListing } from "@/lib/listing";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ApplyPlaceholder } from "../apply-placeholder";
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
  if (session?.user?.role === "VOLUNTEER") {
    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.user.id },
    });
    volunteerProfileIncomplete = !isVolunteerProfileComplete(profile);
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

      <ApplyPlaceholder />
    </main>
  );
}
