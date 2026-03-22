import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isVolunteerProfileComplete } from "@/lib/volunteer-profile";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "../auth/actions";

export default async function VolunteerAreaPage() {
  const session = await auth();
  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!isVolunteerProfileComplete(profile)) {
    redirect("/volunteer/profile");
  }

  return (
    <main>
      <h1>Volunteer area</h1>
      <p>
        Signed in as {session?.user?.email} (user id: {session?.user?.id}).
      </p>
      <p>
        <Link href="/opportunities">Browse teaching opportunities</Link>
      </p>
      <p>
        <Link href="/volunteer/profile">Edit volunteer profile</Link>
      </p>
      <p>
        <Link href="/">Home</Link>
      </p>
      <form action={logoutAction}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
