import { logoutAction } from "@/app/auth/actions";
import Link from "next/link";
import { ListingForm } from "../listing-form";

export default function NewListingPage() {
  return (
    <main>
      <h1>New listing</h1>
      <p>
        <Link href="/ngo/listings">Back to listings</Link>
      </p>
      <ListingForm mode="create" />
      <form action={logoutAction}>
        <button type="submit">Log out</button>
      </form>
    </main>
  );
}
