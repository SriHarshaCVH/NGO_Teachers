import { auth } from "@/auth";
import { logoutAction } from "@/app/auth/actions";
import { toPublicListing } from "@/lib/listing";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function NgoListingsPage() {
  const session = await auth();
  const rows = await prisma.teachingNeed.findMany({
    where: { ngoUserId: session!.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <main>
      <h1>Teaching listings</h1>
      <p>
        <Link href="/ngo/listings/new">Create listing</Link>
      </p>
      <h2 id="review-applications">Your listings</h2>
      <p className="muted">
        Use <strong>Applications</strong> on a listing to review applicants.
      </p>
      <ul>
        {rows.map((r) => {
          const l = toPublicListing(r);
          return (
            <li key={l.id}>
              <Link href={`/ngo/listings/${l.id}/edit`}>{l.title}</Link>
              {" — "}
              <span>{l.status}</span>
              {" — "}
              <Link href={`/ngo/listings/${l.id}/applications`}>Applications</Link>
            </li>
          );
        })}
      </ul>
      {rows.length === 0 ? (
        <p className="muted">
          No listings yet.{" "}
          <Link href="/ngo/listings/new">Create your first listing</Link>.
        </p>
      ) : null}
      <p>
        <Link href="/ngo">Back to NGO dashboard</Link>
      </p>
      <form action={logoutAction}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
