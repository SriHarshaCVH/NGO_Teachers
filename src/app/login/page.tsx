import Link from "next/link";
import { LoginForm } from "./login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ registered?: string }>;
}) {
  const sp = await searchParams;
  const registered = sp.registered === "1";

  return (
    <main>
      <h1>Log in</h1>
      <LoginForm registered={registered} />
      <p>
        No account? <Link href="/signup">Sign up</Link>
      </p>
      <p>
        <Link href="/">Home</Link>
      </p>
    </main>
  );
}
