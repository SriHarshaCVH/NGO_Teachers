import { auth } from "@/auth";
import { matchLabelsForVolunteerSession } from "@/lib/discovery-match";
import { fetchOpenListingsForDiscovery } from "@/lib/listing-discovery";
import { toPublicListing } from "@/lib/listing";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";
import { discoveryQuerySchema } from "@/lib/validations/discovery";
import { prisma } from "@/lib/prisma";
import { TeachingMode } from "@prisma/client";
import Link from "next/link";
import { MatchBadge } from "./match-badge";

function firstString(
  v: string | string[] | undefined
): string | undefined {
  if (typeof v === "string" && v.trim() !== "") {
    return v;
  }
  return undefined;
}

export default async function OpportunitiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const raw = {
    subject: firstString(sp.subject),
    location: firstString(sp.location),
    mode: firstString(sp.mode),
    ageGroup: firstString(sp.ageGroup),
    language: firstString(sp.language),
  };

  const parsed = discoveryQuerySchema.safeParse(raw);
  const filters = parsed.success ? parsed.data : {};
  const queryInvalid = !parsed.success;

  const rows = await fetchOpenListingsForDiscovery(filters);
  const session = await auth();
  const labels = await matchLabelsForVolunteerSession(session, rows);

  let volunteerProfileIncomplete = false;
  if (session?.user?.role === "VOLUNTEER") {
    const profile = await prisma.volunteerProfile.findUnique({
      where: { userId: session.user.id },
    });
    volunteerProfileIncomplete = !isVolunteerProfileComplete(profile);
  }

  return (
    <main>
      <h1>Teaching opportunities</h1>
      <p>
        <Link href="/">Home</Link>
      </p>

      {queryInvalid ? (
        <p role="alert">
          Some filters were ignored because they were invalid. Try again with
          supported values.
        </p>
      ) : null}

      <form method="get" className="discovery-filters">
        <p>
          <label>
            Subject{" "}
            <input
              name="subject"
              defaultValue={filters.subject ?? ""}
              placeholder="e.g. Math"
            />
          </label>
        </p>
        <p>
          <label>
            Location{" "}
            <input
              name="location"
              defaultValue={filters.location ?? ""}
              placeholder="City or area"
            />
          </label>
        </p>
        <p>
          <label>
            Mode{" "}
            <select name="mode" defaultValue={filters.mode ?? ""}>
              <option value="">Any</option>
              <option value={TeachingMode.ONLINE}>Online</option>
              <option value={TeachingMode.OFFLINE}>Offline</option>
              <option value={TeachingMode.HYBRID}>Hybrid</option>
            </select>
          </label>
        </p>
        <p>
          <label>
            Age group{" "}
            <input
              name="ageGroup"
              defaultValue={filters.ageGroup ?? ""}
              placeholder="e.g. 11-14"
            />
          </label>
        </p>
        <p>
          <label>
            Language{" "}
            <input
              name="language"
              defaultValue={filters.language ?? ""}
              placeholder="e.g. English"
            />
          </label>
        </p>
        <p>
          <button type="submit">Filter</button>{" "}
          <Link href="/opportunities">Clear</Link>
        </p>
      </form>

      {volunteerProfileIncomplete ? (
        <p className="muted">
          Complete your{" "}
          <Link href="/volunteer/profile">volunteer profile</Link> to see match
          labels for each listing.
        </p>
      ) : null}

      <ul>
        {rows.map((row, i) => {
          const listing = toPublicListing(row);
          const matchLabel = labels[i];
          return (
            <li key={listing.id}>
              <Link href={`/opportunities/${listing.id}`}>{listing.title}</Link>
              {" — "}
              <span>{listing.mode}</span>
              {" — "}
              <span>{listing.location}</span>
              {matchLabel ? (
                <>
                  {" "}
                  <MatchBadge label={matchLabel} />
                </>
              ) : null}
            </li>
          );
        })}
      </ul>
      {rows.length === 0 ? <p>No open listings match your filters.</p> : null}
    </main>
  );
}
