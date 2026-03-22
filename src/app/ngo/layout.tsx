import { auth } from "@/auth";
import { AppShell } from "@/components/layout/app-shell";
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
    redirect(session.user.role === "VOLUNTEER" ? "/volunteer" : "/login");
  }
  return (
    <AppShell role="NGO" userEmail={session.user.email}>
      {children}
    </AppShell>
  );
}
