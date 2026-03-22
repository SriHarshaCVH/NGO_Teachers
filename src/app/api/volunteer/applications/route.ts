import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { volunteerApplicationCreateSchema } from "@/lib/validations/volunteer-application";
import {
  applyErrorHttpStatus,
  applyErrorMessage,
  toPublicVolunteerApplication,
  verifyVolunteerCanApply,
} from "@/lib/volunteer-application";
import { ApplicationStatus } from "@prisma/client";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

async function requireVolunteerSession() {
  const session = await auth();
  if (!session?.user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }
  if (session.user.role !== "VOLUNTEER") {
    return {
      error: NextResponse.json({ error: "Forbidden" }, { status: 403 }),
    };
  }
  return { session };
}

export async function GET() {
  const gate = await requireVolunteerSession();
  if ("error" in gate) return gate.error;

  const rows = await prisma.application.findMany({
    where: { volunteerUserId: gate.session.user.id },
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

  return NextResponse.json({
    applications: rows.map(toPublicVolunteerApplication),
  });
}

export async function POST(request: Request) {
  const session = await auth();

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = volunteerApplicationCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const listingId = parsed.data.listingId;

  const check = await verifyVolunteerCanApply(session, listingId);
  if (!check.ok) {
    return NextResponse.json(
      {
        error: check.code,
        message: applyErrorMessage(check.code),
      },
      { status: applyErrorHttpStatus(check.code) }
    );
  }

  try {
    const created = await prisma.application.create({
      data: {
        teachingNeedId: check.listing.id,
        volunteerUserId: check.volunteerUserId,
        status: ApplicationStatus.PENDING,
      },
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

    return NextResponse.json(
      { application: toPublicVolunteerApplication(created) },
      { status: 201 }
    );
  } catch (e) {
    if (
      e instanceof Prisma.PrismaClientKnownRequestError &&
      e.code === "P2002"
    ) {
      return NextResponse.json(
        {
          error: "ALREADY_APPLIED",
          message: applyErrorMessage("ALREADY_APPLIED"),
        },
        { status: 409 }
      );
    }
    throw e;
  }
}
