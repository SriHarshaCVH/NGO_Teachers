import { auth } from "@/auth";
import {
  toNgoApplicationListItem,
} from "@/lib/ngo-application-review";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function requireNgoSession() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role !== "NGO") {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { session };
}

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireNgoSession();
  if ("error" in gate) return gate.error;

  const { id: listingId } = await context.params;

  const listing = await prisma.teachingNeed.findFirst({
    where: { id: listingId, ngoUserId: gate.session.user.id },
    select: { id: true },
  });

  if (!listing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const rows = await prisma.application.findMany({
    where: { teachingNeedId: listingId },
    orderBy: { appliedAt: "desc" },
    include: {
      volunteerUser: {
        select: {
          id: true,
          volunteerProfile: { select: { fullName: true } },
        },
      },
    },
  });

  return NextResponse.json({
    applications: rows.map(toNgoApplicationListItem),
  });
}
