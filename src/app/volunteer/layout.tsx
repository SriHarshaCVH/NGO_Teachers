import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function VolunteerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "VOLUNTEER") {
    redirect(session.user.role === "NGO" ? "/ngo" : "/login");
  }
  return <>{children}</>;
}
