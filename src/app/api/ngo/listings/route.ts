import { auth } from "@/auth";
import { isNgoProfileComplete } from "@/lib/ngo-profile";
import { prisma } from "@/lib/prisma";
import { toPublicListing } from "@/lib/listing";
import { listingCreateSchema } from "@/lib/validations/listing";
import { TeachingNeedStatus } from "@prisma/client";
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

export async function GET() {
  const gate = await requireNgoSession();
  if ("error" in gate) return gate.error;

  const rows = await prisma.teachingNeed.findMany({
    where: { ngoUserId: gate.session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return NextResponse.json({
    listings: rows.map(toPublicListing),
  });
}

export async function POST(request: Request) {
  const gate = await requireNgoSession();
  if ("error" in gate) return gate.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = listingCreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  if (data.status === TeachingNeedStatus.OPEN) {
    const profile = await prisma.ngoProfile.findUnique({
      where: { userId: gate.session.user.id },
    });
    if (!isNgoProfileComplete(profile)) {
      return NextResponse.json(
        {
          error:
            "Complete your NGO profile before publishing an OPEN listing",
        },
        { status: 403 }
      );
    }
  }

  const created = await prisma.teachingNeed.create({
    data: {
      ngoUserId: gate.session.user.id,
      title: data.title,
      subjectsRequired: data.subjectsRequired,
      ageGroup: data.ageGroup,
      mode: data.mode,
      location: data.location,
      timeCommitment: data.timeCommitment,
      frequency: data.frequency,
      languagePreference: data.languagePreference,
      qualificationsText: data.qualificationsText,
      description: data.description,
      volunteersNeeded: data.volunteersNeeded,
      applicationDeadline: new Date(data.applicationDeadline),
      status: data.status,
    },
  });

  return NextResponse.json({ listing: toPublicListing(created) }, { status: 201 });
}
