import { auth } from "@/auth";
import { logoutAction } from "@/app/auth/actions";
import { toPublicListing } from "@/lib/listing";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ListingForm } from "../../listing-form";

type Props = { params: Promise<{ id: string }> };

export default async function EditListingPage({ params }: Props) {
  const { id } = await params;
  const session = await auth();
  const row = await prisma.teachingNeed.findFirst({
    where: { id, ngoUserId: session!.user.id },
  });
  if (!row) notFound();

  const initial = toPublicListing(row);

  return (
    <main>
      <h1>Edit listing</h1>
      <p>
        Status: <strong>{initial.status}</strong>
      </p>
      <p>
        <Link href="/ngo/listings">Back to listings</Link>
      </p>
      <ListingForm mode="edit" initial={initial} />
      <form action={logoutAction}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
