"use server";

import { hash } from "bcryptjs";
import { UserRole } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { signupSchema } from "@/lib/validations/auth";
import { redirect } from "next/navigation";

export type SignupState = { error?: string };

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const raw = {
    email: formData.get("email"),
    password: formData.get("password"),
    role: formData.get("role"),
  };
  const parsed = signupSchema.safeParse(raw);
  if (!parsed.success) {
    const f = parsed.error.flatten().fieldErrors;
    const msg =
      f.email?.[0] ??
      f.password?.[0] ??
      f.role?.[0] ??
      "Invalid input";
    return { error: msg };
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
  });
  if (existing) {
    return { error: "An account with this email already exists" };
  }

  const passwordHash = await hash(parsed.data.password, 10);
  await prisma.user.create({
    data: {
      email: parsed.data.email,
      passwordHash,
      role:
        parsed.data.role === "NGO" ? UserRole.NGO : UserRole.VOLUNTEER,
    },
  });

  redirect("/login?registered=1");
}
