import { auth } from "@/auth";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <main>
      <h1>NGO Teachers</h1>
      <p>
        <Link href="/opportunities">Browse teaching opportunities</Link> (open
        listings only).
      </p>
      {session?.user ? (
        <>
          <p>
            Signed in as {session.user.email} ({session.user.role}).
          </p>
          <p>
            {session.user.role === "NGO" ? (
              <>
                <Link href="/ngo">NGO dashboard</Link>
                {" · "}
                <Link href="/ngo/profile">NGO profile</Link>
                {" · "}
                <Link href="/ngo/listings">Listings</Link>
              </>
            ) : (
              <>
                <Link href="/volunteer">Volunteer dashboard</Link>
                {" · "}
                <Link href="/volunteer/profile">Volunteer profile</Link>
                {" · "}
                <Link href="/volunteer/applications">Applications</Link>
              </>
            )}
          </p>
        </>
      ) : (
        <p>
          <Link href="/login">Log in</Link> or <Link href="/signup">Sign up</Link>.
        </p>
      )}
    </main>
  );
}
