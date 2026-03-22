import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface User {
    role?: "NGO" | "VOLUNTEER";
  }

  interface Session {
    user: {
      id: string;
      role: "NGO" | "VOLUNTEER";
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "NGO" | "VOLUNTEER";
  }
}
