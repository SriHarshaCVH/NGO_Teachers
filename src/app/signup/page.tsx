import Link from "next/link";
import { SignupForm } from "./signup-form";
import { PublicShell } from "@/components/layout/public-shell";
import { PageHeader } from "@/components/ui/page-header";
import { Card, CardContent } from "@/components/ui/card";

export default function SignupPage() {
  return (
    <PublicShell nav="auth-signup" contentVariant="narrow">
      <div className="mx-auto w-full max-w-md space-y-8">
        <PageHeader
          title="Create an account"
          description="Join as a volunteer teacher or as an NGO representative—same platform, tailored next steps after you sign up."
          backHref="/"
          backLabel="Back to home"
        />
        <Card className="overflow-hidden">
          <CardContent className="p-6 sm:p-8">
            <SignupForm />
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground">
          Already registered?{" "}
          <Link href="/login" className="font-medium text-foreground">
            Log in
          </Link>
        </p>
      </div>
    </PublicShell>
  );
}
