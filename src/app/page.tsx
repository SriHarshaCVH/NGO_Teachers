import { auth } from "@/auth";
import { PublicShell } from "@/components/layout/public-shell";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <PublicShell contentVariant="wide" nav="default">
      <div className="space-y-8">
        <div className="space-y-3">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            NGO Teachers
          </h1>
          <p className="max-w-2xl text-base text-muted-foreground sm:text-lg">
            Connect mission-driven organizations with educators who want to make a
            difference.
          </p>
        </div>
        <p>
          <Link href="/opportunities">Browse teaching opportunities</Link> (open
          listings only).
        </p>
        {session?.user ? (
          <>
            <p className="text-muted-foreground">
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
      </div>
    </PublicShell>
  );
}
