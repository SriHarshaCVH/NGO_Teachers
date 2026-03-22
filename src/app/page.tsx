import { auth } from "@/auth";
import { PublicShell } from "@/components/layout/public-shell";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button-link";
import Link from "next/link";

export default async function HomePage() {
  const session = await auth();

  return (
    <PublicShell contentVariant="wide" nav="default">
      <div className="space-y-14 sm:space-y-16">
        <section
          aria-labelledby="home-hero-heading"
          className="space-y-6 sm:space-y-8"
        >
          <div className="space-y-4">
            <p className="text-sm font-semibold uppercase tracking-wide text-primary">
              Connecting classrooms and communities
            </p>
            <h1
              id="home-hero-heading"
              className="max-w-3xl text-balance text-4xl font-semibold tracking-tight text-foreground sm:text-5xl"
            >
              Where mission-driven NGOs meet educators ready to teach.
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-muted-foreground sm:text-xl">
              A calm, focused place to discover roles, share your skills, and
              support learning where it is needed most—without the noise.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <ButtonLink href="/opportunities" size="lg">
              Browse teaching opportunities
            </ButtonLink>
            {!session?.user ? (
              <>
                <ButtonLink href="/login" variant="outline" size="lg">
                  Log in
                </ButtonLink>
                <p className="text-sm text-muted-foreground sm:ml-1">
                  New here?{" "}
                  <Link href="/signup" className="font-medium">
                    Create an account
                  </Link>
                </p>
              </>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Open listings only—so what you see is ready for thoughtful
            applications.
          </p>
        </section>

        {session?.user ? (
          <section
            aria-labelledby="home-account-heading"
            className="space-y-4"
          >
            <div className="space-y-1">
              <h2
                id="home-account-heading"
                className="text-lg font-semibold tracking-tight text-foreground"
              >
                Your account
              </h2>
              <p className="text-sm text-muted-foreground">
                Signed in as{" "}
                <span className="font-medium text-foreground">
                  {session.user.email}
                </span>{" "}
                <span className="text-muted-foreground">·</span>{" "}
                <span className="capitalize">{session.user.role.toLowerCase()}</span>
              </p>
            </div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  {session.user.role === "NGO"
                    ? "NGO workspace"
                    : "Volunteer workspace"}
                </CardTitle>
                <CardDescription>
                  {session.user.role === "NGO"
                    ? "Manage your organization profile, listings, and applicants."
                    : "Review matches, update your profile, and track applications."}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-2">
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {session.user.role === "NGO" ? (
                    <>
                      <li>
                        <Link
                          href="/ngo"
                          className="inline-flex rounded-lg px-2 py-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          NGO dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/ngo/profile"
                          className="inline-flex rounded-lg px-2 py-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          NGO profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/ngo/listings"
                          className="inline-flex rounded-lg px-2 py-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          Listings
                        </Link>
                      </li>
                    </>
                  ) : (
                    <>
                      <li>
                        <Link
                          href="/volunteer"
                          className="inline-flex rounded-lg px-2 py-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          Volunteer dashboard
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/volunteer/profile"
                          className="inline-flex rounded-lg px-2 py-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          Volunteer profile
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="/volunteer/applications"
                          className="inline-flex rounded-lg px-2 py-2 text-sm font-medium text-foreground underline-offset-4 hover:underline"
                        >
                          Applications
                        </Link>
                      </li>
                    </>
                  )}
                </ul>
              </CardContent>
            </Card>
          </section>
        ) : (
          <section
            aria-labelledby="home-trust-heading"
            className="grid gap-6 border-t border-border/80 pt-12 sm:grid-cols-3 sm:gap-8 sm:pt-14"
          >
            <div className="space-y-2">
              <h2
                id="home-trust-heading"
                className="text-base font-semibold text-foreground"
              >
                Built for clarity
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Straightforward listings and applications—so teams and teachers
                can focus on impact, not paperwork.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                Respectful matching
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Roles are described with care; volunteers apply when the fit
                feels right.
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-base font-semibold text-foreground">
                Accessible by design
              </h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Readable type, visible focus states, and responsive layouts for
                real devices.
              </p>
            </div>
          </section>
        )}
      </div>
    </PublicShell>
  );
}
