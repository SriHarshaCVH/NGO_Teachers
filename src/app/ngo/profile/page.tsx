import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isNgoProfileComplete, toPublicNgoProfile } from "@/lib/ngo-profile";
import Link from "next/link";
import { NgoProfileForm } from "./ngo-profile-form";

export default async function NgoProfilePage() {
  const session = await auth();
  const profile = await prisma.ngoProfile.findUnique({
    where: { userId: session!.user.id },
  });

  const complete = isNgoProfileComplete(profile);
  const publicProfile = profile ? toPublicNgoProfile(profile) : null;

  return (
    <main>
      <h1>NGO profile</h1>
      {!complete ? (
        <p className="notice">
          Complete your organization profile to use the NGO area. Required
          fields are validated when you save.
        </p>
      ) : (
        <p>Update your organization details below.</p>
      )}
      <p>
        <Link href="/ngo/listings">Teaching listings</Link>
        {" · "}
        <Link href="/opportunities">Public opportunities (preview)</Link>
      </p>
      <p>
        <Link href="/ngo">Back to NGO dashboard</Link>
      </p>
      <NgoProfileForm initialProfile={publicProfile} />
    </main>
  );
}
