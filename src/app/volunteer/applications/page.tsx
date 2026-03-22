import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { toPublicVolunteerApplication } from "@/lib/volunteer-application";
import type { ApplicationStatus } from "@prisma/client";
import Link from "next/link";

function formatApplicationStatus(status: ApplicationStatus): string {
  switch (status) {
    case "PENDING":
      return "Pending";
    case "UNDER_REVIEW":
      return "Under review";
    case "ACCEPTED":
      return "Accepted";
    case "REJECTED":
      return "Rejected";
    default:
      return status;
  }
}

export default async function VolunteerApplicationsPage() {
  const session = await auth();
  const rows = await prisma.application.findMany({
    where: { volunteerUserId: session!.user.id },
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
              <span>{formatApplicationStatus(a.status)}</span>
              {" — applied "}
              {new Date(a.appliedAt).toLocaleString()}
            </li>
          ))}
        </ul>
      )}
      <p>
        <Link href="/volunteer">Volunteer dashboard</Link>
        {" · "}
        <Link href="/volunteer/profile">Volunteer profile</Link>
      </p>
    </main>
  );
}
