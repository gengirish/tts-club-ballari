import { z } from "zod";

export const requestOtpSchema = z.object({
  phone: z.string().min(6, "Phone required"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(6),
  code: z.string().regex(/^\d{6}$/, "6-digit code"),
});
