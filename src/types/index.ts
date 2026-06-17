export type { ApiResponse } from "@/lib/api-response";
export type { OnboardingInput } from "@/lib/validation/member";
export type { ProgressEntryInput } from "@/lib/validation/progress";
export type { RegisterInput, CredentialsLoginInput } from "@/lib/validation/auth";
export type { WalkingTo5kEnrollInput } from "@/lib/validation/walking-to-5k";
export type { AdminCoachPostBody } from "@/lib/validation/admin-coach";

// next-auth session augmentation
import type { DefaultSession } from "next-auth";
import type { Role } from "@prisma/client";
declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: Role;
    };
  }
  interface User {
    role?: Role;
  }
}

declare module "@auth/core/jwt" {
  interface JWT {
    id?: string;
    role?: Role;
    email?: string;
  }
}
