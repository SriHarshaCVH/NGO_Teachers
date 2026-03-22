import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isVolunteerProfileComplete,
  toPublicVolunteerProfile,
} from "@/lib/volunteer-profile";
import Link from "next/link";
import { VolunteerProfileForm } from "./volunteer-profile-form";
import { logoutAction } from "../../auth/actions";

export default async function VolunteerProfilePage() {
  const session = await auth();
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const complete = isVolunteerProfileComplete(profile);
  const publicProfile = profile ? toPublicVolunteerProfile(profile) : null;

  return (
    <main>
      <h1>Volunteer profile</h1>
      {!complete ? (
        <p className="notice">
          Complete your volunteer profile to use the volunteer area. Required
          fields are validated when you save.
        </p>
      ) : (
        <p>Update your teaching profile below.</p>
      )}
      <p>
        <Link href="/volunteer">Back to volunteer area</Link>
      </p>
      <VolunteerProfileForm initialProfile={publicProfile} />
      <form action={logoutAction}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
