import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isNgoProfileComplete } from "@/lib/ngo-profile";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutAction } from "../auth/actions";

export default async function NgoAreaPage() {
  const session = await auth();
  const profile = await prisma.ngoProfile.findUnique({
    where: { userId: session!.user.id },
  });

  if (!isNgoProfileComplete(profile)) {
    redirect("/ngo/profile");
  }

  return (
    <main>
      <h1>NGO area</h1>
      <p>
        Signed in as {session?.user?.email} (user id: {session?.user?.id}).
      </p>
      <p>
        <Link href="/ngo/profile">Edit NGO profile</Link>
      </p>
      <p>
        <Link href="/ngo/listings">Teaching listings</Link>
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
