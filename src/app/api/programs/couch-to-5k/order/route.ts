import { ok, unauthorized, validationError, fail, notFound } from "@/lib/api-response";
import { requireAuth, AuthError } from "@/lib/rbac";
import { prisma } from "@/lib/prisma";
import { c25kOrderBodySchema } from "@/lib/validation/program";

export async function POST(req: Request) {
  let user;
  try {
    user = await requireAuth();
  } catch (e) {
    if (e instanceof AuthError) return unauthorized();
    throw e;
  }

  const json = await req.json().catch(() => null);
  const parsed = c25kOrderBodySchema.safeParse(json);
  if (!parsed.success) return validationError(parsed.error.flatten());

  const program = await prisma.program.findUnique({ where: { slug: "couch-to-5k" } });
  if (!program) return notFound("Program not found");

  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    return fail("PAYMENTS_DISABLED", "Razorpay is not configured on this environment.", 503);
  }

  const Razorpay = (await import("razorpay")).default;
  const rz = new Razorpay({ key_id: keyId, key_secret: keySecret });

  const order = await rz.orders.create({
    amount: program.pricePaise,
    currency: "INR",
    receipt: `c25k_${user.id.slice(0, 12)}_${Date.now()}`,
    notes: {
      userId: user.id,
      programSlug: program.slug,
      assessment: JSON.stringify(parsed.data.assessment),
    },
  });

  await prisma.payment.create({
    data: {
      userId: user.id,
      programId: program.id,
      amountPaise: program.pricePaise,
      razorpayOrderId: order.id as string,
      status: "created",
    },
  });

  return ok({
    orderId: order.id as string,
    amountPaise: program.pricePaise,
    currency: "INR",
    keyId,
  });
}
