import { safeRedirectPath } from "@/lib/safe-redirect";
import Link from "next/link";
import { LoginForm } from "./login-form";

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
    <main>
      <h1>Log in</h1>
      <LoginForm registered={registered} callbackUrl={callbackUrl} />
      <p>
        No account? <Link href="/signup">Sign up</Link>
      </p>
      <p>
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}
