import { auth } from "@/auth";
import { FormPageLayout } from "@/components/layout/form-page-layout";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { isNgoProfileComplete, toPublicNgoProfile } from "@/lib/ngo-profile";
import { NgoProfileForm } from "./ngo-profile-form";

export default async function NgoProfilePage() {
  const session = await auth();
  const profile = await prisma.ngoProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const complete = isNgoProfileComplete(profile);
  const publicProfile = profile ? toPublicNgoProfile(profile) : null;

  return (
    <FormPageLayout
      title="NGO profile"
      description="Tell volunteers who you are, who you serve, and how to reach you. A complete profile is required before you can manage listings end-to-end."
      backHref="/ngo"
      backLabel="Back to NGO dashboard"
    >
      <div className="space-y-6">
        {!complete ? (
          <Alert variant="warning" title="Finish your organization profile">
            <p className="m-0">
              Complete every required field below and save. Until the profile is
              complete, some NGO tools stay limited—same rules as before; we
              have only made the form easier to follow.
            </p>
          </Alert>
        ) : (
          <Card>
            <CardContent className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between sm:py-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="success">Profile complete</Badge>
                <span className="text-sm text-muted-foreground">
                  You can update these details any time.
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
          <ButtonLink href="/ngo/listings" variant="outline" size="md" className="w-full sm:w-auto">
            Teaching listings
          </ButtonLink>
          <ButtonLink href="/opportunities" variant="ghost" size="md" className="w-full sm:w-auto">
            Public opportunities (preview)
          </ButtonLink>
        </div>

        <NgoProfileForm initialProfile={publicProfile} />
      </div>
    </FormPageLayout>
  );
}
