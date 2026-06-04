import { z } from "zod";

const screenshotMime = z.enum(["image/jpeg", "image/png", "image/webp"]);

/** Base64 payload only (no data: prefix). Max ~1.2MB binary after decode. */
export const publicEventApplySchema = z.object({
  applicantName: z.string().min(2).max(120),
  phone: z.string().min(8).max(20),
  age: z.number().int().min(10).max(100),
  gender: z.enum(["FEMALE", "MALE", "OTHER", "UNDISCLOSED"]),
  city: z.string().min(1).max(80),
  paymentScreenshotBase64: z.string().min(20).max(2_500_000),
  paymentScreenshotMime: screenshotMime,
});

export const rejectApplicationSchema = z.object({
  reason: z.string().min(2).max(500).optional(),
});
