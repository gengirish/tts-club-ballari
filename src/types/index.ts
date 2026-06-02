export type { ApiResponse } from "@/lib/api-response";
export type { OnboardingInput } from "@/lib/validation/member";
export type { ProgressEntryInput } from "@/lib/validation/progress";

// next-auth session augmentation
import type { Role } from "@prisma/client";
declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role; name?: string | null; email?: string | null; image?: string | null };
  }
  interface User {
    role?: Role;
  }
}
