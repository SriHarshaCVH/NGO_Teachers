import { auth } from "@/auth";
import { getNgoDashboardData } from "@/lib/ngo-dashboard";
import { isNgoProfileComplete } from "@/lib/ngo-profile";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { logoutAction } from "../auth/actions";

export default async function NgoDashboardPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [profile, stats] = await Promise.all([
    prisma.ngoProfile.findUnique({ where: { userId } }),
    getNgoDashboardData(userId),
  ]);

  const profileComplete = isNgoProfileComplete(profile);

  return (
    <main>
      <h1>NGO dashboard</h1>

      {profileComplete ? (
        <p className="muted">Your organization profile is complete.</p>
      ) : (
        <p className="notice" role="status">
          Your organization profile is incomplete. Finish it to publish listings
          and receive applications.
        </p>
      )}

      <section className="dashboard-section" aria-labelledby="ngo-profile-status">
        <h2 id="ngo-profile-status">Profile</h2>
        <p>
          Status:{" "}
          <strong>{profileComplete ? "Complete" : "Incomplete"}</strong>
        </p>
        {!profileComplete ? (
          <p>
            <Link href="/ngo/profile">Complete NGO profile</Link>
          </p>
        ) : null}
      </section>

      <section className="dashboard-section" aria-labelledby="ngo-listings-stats">
        <h2 id="ngo-listings-stats">Listings</h2>
        <dl className="dashboard-stats">
          <div>
            <dt>Total listings</dt>
            <dd>{stats.listingCounts.total}</dd>
          </div>
          <div>
            <dt>Open</dt>
            <dd>{stats.listingCounts.OPEN}</dd>
          </div>
          <div>
            <dt>Draft</dt>
            <dd>{stats.listingCounts.DRAFT}</dd>
          </div>
          <div>
            <dt>Closed</dt>
            <dd>{stats.listingCounts.CLOSED}</dd>
          </div>
        </dl>
      </section>

      <section className="dashboard-section" aria-labelledby="ngo-apps-stats">
        <h2 id="ngo-apps-stats">Applications</h2>
        <p>
          Total applications received across your listings:{" "}
          <strong>{stats.totalApplications}</strong>
        </p>
      </section>

      <section className="dashboard-section" aria-labelledby="ngo-quick-links">
        <h2 id="ngo-quick-links">Quick links</h2>
        <ul className="dashboard-links">
          <li>
            <Link href="/ngo/profile">Edit NGO profile</Link>
          </li>
          <li>
            <Link href="/ngo/listings">Manage listings</Link>
          </li>
          <li>
            <Link href="/ngo/listings#review-applications">
              Review applications
            </Link>
          </li>
        </ul>
      </section>

      <p className="muted">
        Signed in as {session?.user?.email}
      </p>
      <p>
        <Link href="/">Home</Link>
      </p>
      <form action={logoutAction}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
