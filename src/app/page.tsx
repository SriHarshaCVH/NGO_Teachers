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
              <Link href="/ngo">Go to NGO area</Link>
            ) : (
              <Link href="/volunteer">Go to volunteer area</Link>
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
