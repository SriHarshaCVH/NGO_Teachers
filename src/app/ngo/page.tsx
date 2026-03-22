import { auth } from "@/auth";
import Link from "next/link";
import { logoutAction } from "../auth/actions";

export default async function NgoAreaPage() {
  const session = await auth();

  return (
    <main>
      <h1>NGO area</h1>
      <p>
        Placeholder for Phase 1. Signed in as {session?.user?.email} (user id:{" "}
        {session?.user?.id}).
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
