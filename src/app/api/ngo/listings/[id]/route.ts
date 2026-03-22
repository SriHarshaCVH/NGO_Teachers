import { auth } from "@/auth";
import { isNgoProfileComplete } from "@/lib/ngo-profile";
import { mergeListingUpdate, toPublicListing } from "@/lib/listing";
import { prisma } from "@/lib/prisma";
import {
  listingMergedSchema,
  listingUpdateSchema,
} from "@/lib/validations/listing";
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

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
  const gate = await requireNgoSession();
  if ("error" in gate) return gate.error;

  const { id } = await context.params;

  const row = await prisma.teachingNeed.findFirst({
    where: { id, ngoUserId: gate.session.user.id },
  });

  if (!row) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ listing: toPublicListing(row) });
}

export async function PATCH(request: Request, context: RouteContext) {
  const gate = await requireNgoSession();
  if ("error" in gate) return gate.error;

  const { id } = await context.params;

  const existing = await prisma.teachingNeed.findFirst({
    where: { id, ngoUserId: gate.session.user.id },
  });

  if (!existing) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = listingUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const merged = mergeListingUpdate(existing, parsed.data);
  const mergedParsed = listingMergedSchema.safeParse(merged);
  if (!mergedParsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: mergedParsed.error.flatten() },
      { status: 400 }
    );
  }

  if (merged.status === TeachingNeedStatus.OPEN) {
    const profile = await prisma.ngoProfile.findUnique({
      where: { userId: gate.session.user.id },
    });
    if (!isNgoProfileComplete(profile)) {
      return NextResponse.json(
        {
          error:
            "Complete your NGO profile before setting a listing to OPEN",
        },
        { status: 403 }
      );
    }
  }

  const updated = await prisma.teachingNeed.update({
    where: { id },
    data: {
      title: merged.title,
      subjectsRequired: merged.subjectsRequired,
      ageGroup: merged.ageGroup,
      mode: merged.mode,
      location: merged.location,
      timeCommitment: merged.timeCommitment,
      frequency: merged.frequency,
      languagePreference: merged.languagePreference,
      qualificationsText: merged.qualificationsText,
      description: merged.description,
      volunteersNeeded: merged.volunteersNeeded,
      applicationDeadline: new Date(merged.applicationDeadline),
      status: merged.status,
    },
  });

  return NextResponse.json({ listing: toPublicListing(updated) });
}
