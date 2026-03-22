import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isNgoProfileComplete,
  toPublicNgoProfile,
} from "@/lib/ngo-profile";
import { ngoProfileUpsertSchema } from "@/lib/validations/ngo-profile";
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

  const profile = await prisma.ngoProfile.findUnique({
    where: { userId: gate.session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ profile: null, complete: false });
  }

  return NextResponse.json({
    profile: toPublicNgoProfile(profile),
    complete: isNgoProfileComplete(profile),
  });
}

export async function PUT(request: Request) {
  const gate = await requireNgoSession();
  if ("error" in gate) return gate.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = ngoProfileUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const profile = await prisma.ngoProfile.upsert({
    where: { userId: gate.session.user.id },
    create: {
      userId: gate.session.user.id,
      name: data.name,
      description: data.description,
      location: data.location,
      ageGroupsServed: data.ageGroupsServed,
      contactPersonName: data.contactPersonName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      websiteOrSocial: data.websiteOrSocial,
    },
    update: {
      name: data.name,
      description: data.description,
      location: data.location,
      ageGroupsServed: data.ageGroupsServed,
      contactPersonName: data.contactPersonName,
      contactEmail: data.contactEmail,
      contactPhone: data.contactPhone,
      websiteOrSocial: data.websiteOrSocial,
    },
  });

  return NextResponse.json({
    profile: toPublicNgoProfile(profile),
    complete: isNgoProfileComplete(profile),
  });
}
