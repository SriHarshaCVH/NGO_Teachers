import { safeRedirectPath } from "@/lib/safe-redirect";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { PublicShell } from "@/components/layout/public-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string; callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const registered = sp.registered === "1";
  const callbackUrl =
    safeRedirectPath(
      typeof sp.callbackUrl === "string" ? sp.callbackUrl : undefined
    ) ?? undefined;

  return (
    <PublicShell nav="auth-login" contentVariant="narrow">
      <div className="mx-auto w-full max-w-md space-y-8">
        <PageHeader
          title="Log in"
          description="Access your dashboard, profile, and open opportunities."
          backHref="/"
          backLabel="Back to home"
        />
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <LoginForm registered={registered} callbackUrl={callbackUrl} />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          No account yet?{" "}
          <Link href="/signup" className="font-medium text-foreground">
            Sign up
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
