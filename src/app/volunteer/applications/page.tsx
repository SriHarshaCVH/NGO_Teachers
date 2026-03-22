import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toPublicVolunteerApplication } from "@/lib/volunteer-application";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function VolunteerApplicationsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  if (session.user.role !== "VOLUNTEER") {
    redirect("/");
  }

  const rows = await prisma.application.findMany({
    where: { volunteerUserId: session.user.id },
    orderBy: { appliedAt: "desc" },
    include: {
      teachingNeed: {
        select: {
          id: true,
          title: true,
          status: true,
          applicationDeadline: true,
        },
      },
    },
  });

  const applications = rows.map(toPublicVolunteerApplication);

  return (
    <main>
      <p>
        <Link href="/opportunities">← Opportunities</Link>
      </p>
      <h1>My applications</h1>
      {applications.length === 0 ? (
        <p className="muted">
          You have not applied yet.{" "}
          <Link href="/opportunities">Browse opportunities</Link>.
        </p>
      ) : (
        <ul>
          {applications.map((a) => (
            <li key={a.id}>
              <Link href={`/opportunities/${a.listing.id}`}>
                {a.listing.title}
              </Link>
              {" — "}
              <span>{a.status}</span>
              {" — applied "}
              {new Date(a.appliedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link href="/volunteer/profile">Volunteer profile</Link>
      </p>
    </main>
  );
}
