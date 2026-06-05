import { ok, unauthorized } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { getMemberOnboardingForm } from "@/server/member/member-profile";

/** GET — signed-in member reads their profile for editing. */
export async function GET() {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const form = await getMemberOnboardingForm(user.id);
  if (!form) return unauthorized();

  return ok({ form });
}
