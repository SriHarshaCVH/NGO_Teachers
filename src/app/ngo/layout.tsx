import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function NgoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "NGO") {
    redirect("/");
  }
  return <>{children}</>;
}
