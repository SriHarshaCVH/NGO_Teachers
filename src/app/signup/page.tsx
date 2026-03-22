import Link from "next/link";
import { SignupForm } from "./signup-form";
import { PublicShell } from "@/components/layout/public-shell";

export default function SignupPage() {
  return (
    <PublicShell nav="auth-signup">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Sign up
          </h1>
          <p className="text-sm text-muted-foreground">
            Create an account as a volunteer or an NGO representative.
          </p>
        </div>
        <SignupForm />
        <p className="text-sm text-muted-foreground">
          Already have an account? <Link href="/login">Log in</Link>
        </p>
        <p className="text-sm">
          <Link href="/">Home</Link>
        </p>
      </div>
    </PublicShell>
  );
}
