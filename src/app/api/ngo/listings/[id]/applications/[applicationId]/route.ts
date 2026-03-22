import { auth } from "@/auth";
import {
  canTransitionApplicationStatus,
  toNgoApplicationDetailResponse,
} from "@/lib/ngo-application-review";
import { ngoApplicationStatusUpdateSchema } from "@/lib/validations/ngo-application-review";
import { prisma } from "@/lib/prisma";
import { ApplicationStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
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

type RouteContext = {
  params: Promise<{ id: string; applicationId: string }>;
};

async function loadOwnedApplication(
  ngoUserId: string,
  listingId: string,
  applicationId: string
) {
  const listing = await prisma.teachingNeed.findFirst({
    where: { id: listingId, ngoUserId },
    select: { id: true },
  });
  if (!listing) {
    return { notFound: true as const };
  }

  const application = await prisma.application.findFirst({
    where: {
      id: applicationId,
      teachingNeedId: listingId,
    },
    include: {
      volunteerUser: {
        select: {
          volunteerProfile: true,
        },
      },
    },
  });

  if (!application) {
    return { notFound: true as const };
  }

  return {
    notFound: false as const,
    application,
    volunteerProfile: application.volunteerUser.volunteerProfile,
  };
}

export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireNgoSession();
  if ("error" in gate) return gate.error;

  const { id: listingId, applicationId } = await context.params;

  const row = await loadOwnedApplication(
    gate.session.user.id,
    listingId,
    applicationId
  );
  if (row.notFound) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = toNgoApplicationDetailResponse(
    row.application,
    row.volunteerProfile
  );

  return NextResponse.json(body);
}

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireNgoSession();
  if ("error" in gate) return gate.error;

  const { id: listingId, applicationId } = await context.params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ngoApplicationStatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const row = await loadOwnedApplication(
    gate.session.user.id,
    listingId,
    applicationId
  );
  if (row.notFound) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const current = row.application.status;
  const next = parsed.data.status as ApplicationStatus;

  if (!canTransitionApplicationStatus(current, next)) {
    return NextResponse.json(
      {
        error: "INVALID_STATUS_TRANSITION",
        message: `Cannot move application from ${current} to ${next}.`,
      },
      { status: 400 }
    );
  }

  const reviewedAt =
    next === ApplicationStatus.ACCEPTED || next === ApplicationStatus.REJECTED
      ? new Date()
      : undefined;

  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: {
      status: next,
      ...(reviewedAt ? { reviewedAt } : {}),
    },
    include: {
      volunteerUser: {
        select: {
          volunteerProfile: true,
        },
      },
    },
  });

  revalidatePath("/volunteer/applications");

  return NextResponse.json(
    toNgoApplicationDetailResponse(
      updated,
      updated.volunteerUser.volunteerProfile
    )
  );
}
