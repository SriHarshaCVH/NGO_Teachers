/**
 * DEV/DEMO ONLY — sample NGO, volunteer, listings, and one application.
 * Do not use these credentials in production. Safe to re-run: skips if demo
 * users already exist.
 */

import { hash } from "bcryptjs";
import {
  ApplicationStatus,
  PrismaClient,
  TeachingMode,
  TeachingNeedStatus,
  UserRole,
} from "@prisma/client";

const prisma = new PrismaClient();

const DEMO_NGO_EMAIL = "demo-ngo@example.com";
const DEMO_VOL_EMAIL = "demo-volunteer@example.com";
const DEMO_PASSWORD = "DemoPassword123!";

async function main() {
  const existing = await prisma.user.findFirst({
    where: { email: { in: [DEMO_NGO_EMAIL, DEMO_VOL_EMAIL] } },
  });
  if (existing) {
    console.log(
      "Demo seed skipped: demo users already exist (demo-ngo@example.com / demo-volunteer@example.com)."
    );
    return;
  }

  const passwordHash = await hash(DEMO_PASSWORD, 10);

  const ngoUser = await prisma.user.create({
    data: {
      email: DEMO_NGO_EMAIL,
      passwordHash,
      role: UserRole.NGO,
      ngoProfile: {
        create: {
          name: "[DEV] Demo Learning Foundation",
          description: "Demo-only NGO profile for local testing.",
          location: "Demo City",
          ageGroupsServed: ["11-14", "15-18"],
          contactPersonName: "Demo Coordinator",
          contactEmail: "coordinator@example.com",
          contactPhone: "+1-555-0100",
          websiteOrSocial: "https://example.com",
        },
      },
    },
  });

  const volUser = await prisma.user.create({
    data: {
      email: DEMO_VOL_EMAIL,
      passwordHash,
      role: UserRole.VOLUNTEER,
      volunteerProfile: {
        create: {
          fullName: "[DEV] Demo Volunteer",
          bio: "Demo volunteer bio for local testing.",
          location: "Remote",
          educationBackground: "Education degree",
          subjects: ["Mathematics"],
          ageGroupsComfort: ["11-14"],
          languages: ["English"],
          preferredMode: TeachingMode.ONLINE,
          availability: "weekends 4 hours",
          priorExperience: "2 years tutoring",
        },
      },
    },
  });

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 30);

  const draftDeadline = new Date();
  draftDeadline.setDate(draftDeadline.getDate() + 7);

  await prisma.teachingNeed.create({
    data: {
      ngoUserId: ngoUser.id,
      title: "[DEV] Draft listing (not public)",
      subjectsRequired: ["Science"],
      ageGroup: "11-14",
      mode: TeachingMode.ONLINE,
      location: "Remote",
      timeCommitment: "2 hours weekly",
      frequency: "weekly",
      languagePreference: "English",
      qualificationsText: null,
      description: "Demo draft — not visible in discovery.",
      volunteersNeeded: 2,
      applicationDeadline: draftDeadline,
      status: TeachingNeedStatus.DRAFT,
    },
  });

  const listingOpenWithApp = await prisma.teachingNeed.create({
    data: {
      ngoUserId: ngoUser.id,
      title: "[DEV] Open — Math (has application)",
      subjectsRequired: ["Mathematics"],
      ageGroup: "11-14",
      mode: TeachingMode.ONLINE,
      location: "Remote",
      timeCommitment: "4 hours weekends",
      frequency: "weekly",
      languagePreference: "English",
      qualificationsText: null,
      description: "Demo open listing with an existing application (UNDER_REVIEW).",
      volunteersNeeded: 3,
      applicationDeadline: deadline,
      status: TeachingNeedStatus.OPEN,
    },
  });

  await prisma.teachingNeed.create({
    data: {
      ngoUserId: ngoUser.id,
      title: "[DEV] Open — Math (apply here)",
      subjectsRequired: ["Mathematics"],
      ageGroup: "11-14",
      mode: TeachingMode.ONLINE,
      location: "Remote",
      timeCommitment: "4 hours weekends",
      frequency: "weekly",
      languagePreference: "English",
      qualificationsText: null,
      description:
        "Second open listing — use this to test applying (no existing application).",
      volunteersNeeded: 2,
      applicationDeadline: deadline,
      status: TeachingNeedStatus.OPEN,
    },
  });

  const pastDeadline = new Date();
  pastDeadline.setDate(pastDeadline.getDate() - 1);

  await prisma.teachingNeed.create({
    data: {
      ngoUserId: ngoUser.id,
      title: "[DEV] Closed listing",
      subjectsRequired: ["Mathematics"],
      ageGroup: "11-14",
      mode: TeachingMode.ONLINE,
      location: "Remote",
      timeCommitment: "4 hours weekends",
      frequency: "weekly",
      languagePreference: "English",
      qualificationsText: null,
      description: "Demo closed listing.",
      volunteersNeeded: 1,
      applicationDeadline: pastDeadline,
      status: TeachingNeedStatus.CLOSED,
    },
  });

  await prisma.application.create({
    data: {
      teachingNeedId: listingOpenWithApp.id,
      volunteerUserId: volUser.id,
      status: ApplicationStatus.UNDER_REVIEW,
    },
  });

  console.log("Demo seed complete.");
  console.log(`  NGO login: ${DEMO_NGO_EMAIL} / ${DEMO_PASSWORD}`);
  console.log(`  Volunteer login: ${DEMO_VOL_EMAIL} / ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
