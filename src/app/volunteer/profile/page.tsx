import { auth } from "@/auth";
import { FormPageLayout } from "@/components/layout/form-page-layout";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button-link";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import {
  isVolunteerProfileComplete,
  toPublicVolunteerProfile,
} from "@/lib/volunteer-profile";
import { VolunteerProfileForm } from "./volunteer-profile-form";

export default async function VolunteerProfilePage() {
  const session = await auth();
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const complete = isVolunteerProfileComplete(profile);
  const publicProfile = profile ? toPublicVolunteerProfile(profile) : null;

  return (
    <FormPageLayout
      title="Volunteer profile"
      description="Share how you teach, what you cover, and when you are available. A complete profile is required before you can apply and see match labels on listings."
      backHref="/volunteer"
      backLabel="Back to volunteer dashboard"
    >
      <div className="space-y-6">
        {!complete ? (
          <Alert variant="warning" title="Finish your volunteer profile">
            <p className="m-0">
              Complete every required field below and save. Until your profile is
              complete, applying and personalized matching stay blocked—same
              product rules as before.
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
          <ButtonLink href="/opportunities" variant="outline" size="md" className="w-full sm:w-auto">
            Browse opportunities
          </ButtonLink>
          <ButtonLink href="/volunteer/applications" variant="ghost" size="md" className="w-full sm:w-auto">
            My applications
          </ButtonLink>
        </div>

        <VolunteerProfileForm initialProfile={publicProfile} />
      </div>
    </FormPageLayout>
  );
}
