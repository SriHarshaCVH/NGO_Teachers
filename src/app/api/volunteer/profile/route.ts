import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  isVolunteerProfileComplete,
  toPublicVolunteerProfile,
} from "@/lib/volunteer-profile";
import { volunteerProfileUpsertSchema } from "@/lib/validations/volunteer-profile";
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

  const profile = await prisma.volunteerProfile.findUnique({
    where: { userId: gate.session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ profile: null, complete: false });
  }

  return NextResponse.json({
    profile: toPublicVolunteerProfile(profile),
    complete: isVolunteerProfileComplete(profile),
  });
}

export async function PUT(request: Request) {
  const gate = await requireVolunteerSession();
  if ("error" in gate) return gate.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = volunteerProfileUpsertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const data = parsed.data;

  const profile = await prisma.volunteerProfile.upsert({
    where: { userId: gate.session.user.id },
    create: {
      userId: gate.session.user.id,
      fullName: data.fullName,
      bio: data.bio,
      location: data.location,
      educationBackground: data.educationBackground,
      subjects: data.subjects,
      ageGroupsComfort: data.ageGroupsComfort,
      languages: data.languages,
      preferredMode: data.preferredMode,
      availability: data.availability,
      priorExperience: data.priorExperience,
      resumeUrl: data.resumeUrl,
    },
    update: {
      fullName: data.fullName,
      bio: data.bio,
      location: data.location,
      educationBackground: data.educationBackground,
      subjects: data.subjects,
      ageGroupsComfort: data.ageGroupsComfort,
      languages: data.languages,
      preferredMode: data.preferredMode,
      availability: data.availability,
      priorExperience: data.priorExperience,
      resumeUrl: data.resumeUrl,
    },
  });

  return NextResponse.json({
    profile: toPublicVolunteerProfile(profile),
    complete: isVolunteerProfileComplete(profile),
  });
}
