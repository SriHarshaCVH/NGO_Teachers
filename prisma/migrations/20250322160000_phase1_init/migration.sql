-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('NGO', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "NgoApprovalStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "TeachingMode" AS ENUM ('ONLINE', 'OFFLINE', 'HYBRID');

-- CreateEnum
CREATE TYPE "TeachingNeedStatus" AS ENUM ('DRAFT', 'OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('PENDING', 'UNDER_REVIEW', 'ACCEPTED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NgoProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "ageGroupsServed" JSONB NOT NULL,
    "contactPersonName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "websiteOrSocial" TEXT,
    "approvalStatus" "NgoApprovalStatus" NOT NULL DEFAULT 'APPROVED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NgoProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VolunteerProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "educationBackground" TEXT NOT NULL,
    "subjects" JSONB NOT NULL,
    "ageGroupsComfort" JSONB NOT NULL,
    "languages" JSONB NOT NULL,
    "preferredMode" "TeachingMode" NOT NULL,
    "availability" TEXT NOT NULL,
    "priorExperience" TEXT NOT NULL,
    "resumeUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VolunteerProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeachingNeed" (
    "id" TEXT NOT NULL,
    "ngoUserId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subjectsRequired" JSONB NOT NULL,
    "ageGroup" TEXT NOT NULL,
    "mode" "TeachingMode" NOT NULL,
    "location" TEXT NOT NULL,
    "timeCommitment" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "languagePreference" TEXT NOT NULL,
    "qualificationsText" TEXT,
    "description" TEXT NOT NULL,
    "volunteersNeeded" INTEGER NOT NULL,
    "applicationDeadline" TIMESTAMP(3) NOT NULL,
    "status" "TeachingNeedStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TeachingNeed_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Application" (
    "id" TEXT NOT NULL,
    "teachingNeedId" TEXT NOT NULL,
    "volunteerUserId" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'PENDING',
    "appliedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMP(3),

    CONSTRAINT "Application_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "NgoProfile_userId_key" ON "NgoProfile"("userId");

-- CreateIndex
CREATE INDEX "NgoProfile_approvalStatus_idx" ON "NgoProfile"("approvalStatus");

-- CreateIndex
CREATE UNIQUE INDEX "VolunteerProfile_userId_key" ON "VolunteerProfile"("userId");

-- CreateIndex
CREATE INDEX "TeachingNeed_status_idx" ON "TeachingNeed"("status");

-- CreateIndex
CREATE INDEX "TeachingNeed_ngoUserId_idx" ON "TeachingNeed"("ngoUserId");

-- CreateIndex
CREATE INDEX "TeachingNeed_status_applicationDeadline_idx" ON "TeachingNeed"("status", "applicationDeadline");

-- CreateIndex
CREATE INDEX "Application_teachingNeedId_idx" ON "Application"("teachingNeedId");

-- CreateIndex
CREATE INDEX "Application_volunteerUserId_idx" ON "Application"("volunteerUserId");

-- CreateIndex
CREATE INDEX "Application_volunteerUserId_status_idx" ON "Application"("volunteerUserId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "Application_teachingNeedId_volunteerUserId_key" ON "Application"("teachingNeedId", "volunteerUserId");

-- AddForeignKey
ALTER TABLE "NgoProfile" ADD CONSTRAINT "NgoProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VolunteerProfile" ADD CONSTRAINT "VolunteerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeachingNeed" ADD CONSTRAINT "TeachingNeed_ngoUserId_fkey" FOREIGN KEY ("ngoUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_teachingNeedId_fkey" FOREIGN KEY ("teachingNeedId") REFERENCES "TeachingNeed"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Application" ADD CONSTRAINT "Application_volunteerUserId_fkey" FOREIGN KEY ("volunteerUserId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
