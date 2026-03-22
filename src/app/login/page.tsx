import { safeRedirectPath } from "@/lib/safe-redirect";
import Link from "next/link";
import { LoginForm } from "./login-form";
import { PublicShell } from "@/components/layout/public-shell";

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
    <PublicShell nav="auth-login">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Log in
          </h1>
          <p className="text-sm text-muted-foreground">
            Access your dashboard and opportunities.
          </p>
        </div>
        <LoginForm registered={registered} callbackUrl={callbackUrl} />
        <p className="text-sm text-muted-foreground">
          No account? <Link href="/signup">Sign up</Link>
        </p>
        <p className="text-sm">
          <Link href="/">Home</Link>
        </p>
      </div>
    </PublicShell>
  );
}
