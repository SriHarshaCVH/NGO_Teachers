import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
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
  return (
    <AppShell role="VOLUNTEER" userEmail={session.user.email}>
      {children}
    </AppShell>
  );
}
