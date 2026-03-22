import { auth } from "@/auth";
import { DashboardPageLayout } from "@/components/layout/dashboard-page-layout";
import { getVolunteerDashboardData } from "@/lib/volunteer-dashboard";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";
import { prisma } from "@/lib/prisma";
import { MatchBadge } from "@/app/opportunities/match-badge";
import Link from "next/link";

export default async function VolunteerDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId },
  });

  const profileComplete = isVolunteerProfileComplete(profile);
  const { applicationCounts, recommended } = await getVolunteerDashboardData(
    userId,
    profile
  );

  return (
    <DashboardPageLayout title="Volunteer dashboard">
      {profileComplete ? (
        <p className="muted">Your volunteer profile is complete.</p>
      ) : (
        <p className="notice" role="status">
          Your volunteer profile is incomplete. Complete it to apply to listings
          and see personalized match labels.
        </p>
      )}

      <section
        className="dashboard-section"
        aria-labelledby="vol-profile-status"
      >
        <h2 id="vol-profile-status">Profile</h2>
        <p>
          Status:{" "}
          <strong>{profileComplete ? "Complete" : "Incomplete"}</strong>
        </p>
        {!profileComplete ? (
          <p>
            <Link href="/volunteer/profile">Complete volunteer profile</Link>
          </p>
        ) : null}
      </section>

      <section className="dashboard-section" aria-labelledby="vol-apps-stats">
        <h2 id="vol-apps-stats">Applications</h2>
        <p>
          Total submitted: <strong>{applicationCounts.total}</strong>
        </p>
        <dl className="dashboard-stats">
          <div>
            <dt>Pending</dt>
            <dd>{applicationCounts.PENDING}</dd>
          </div>
          <div>
            <dt>Under review</dt>
            <dd>{applicationCounts.UNDER_REVIEW}</dd>
          </div>
          <div>
            <dt>Accepted</dt>
            <dd>{applicationCounts.ACCEPTED}</dd>
          </div>
          <div>
            <dt>Rejected</dt>
            <dd>{applicationCounts.REJECTED}</dd>
          </div>
        </dl>
      </section>

      <section
        className="dashboard-section"
        aria-labelledby="vol-recommended"
      >
        <h2 id="vol-recommended">Recommended opportunities</h2>
        {!profileComplete ? (
          <p className="muted">
            Complete your profile to see a short list of relevant open listings
            based on the same matching rules as Browse opportunities.
          </p>
        ) : recommended.length === 0 ? (
          <p className="muted">
            No additional open matches right now.{" "}
            <Link href="/opportunities">Browse all opportunities</Link>.
          </p>
        ) : (
          <ul>
            {recommended.map(({ listing, matchLabel }) => (
              <li key={listing.id}>
                <Link href={`/opportunities/${listing.id}`}>
                  {listing.title}
                </Link>
                {" — "}
                <span>{listing.mode}</span>
                {" — "}
                <span>{listing.location}</span>{" "}
                <MatchBadge label={matchLabel} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-section" aria-labelledby="vol-quick-links">
        <h2 id="vol-quick-links">Quick links</h2>
        <ul className="dashboard-links">
          <li>
            <Link href="/volunteer/profile">Edit volunteer profile</Link>
          </li>
          <li>
            <Link href="/opportunities">Browse opportunities</Link>
          </li>
          <li>
            <Link href="/volunteer/applications">View my applications</Link>
          </li>
        </ul>
      </section>

      <p className="muted">Signed in as {session?.user?.email}</p>
      <p>
        <Link href="/">Home</Link>
      </p>
    </DashboardPageLayout>
  );
}
