import { z } from "zod";
import { isValidPhone } from "@/lib/utils/phone";

export const requestOtpSchema = z.object({
  phone: z
    .string()
    .trim()
    .min(1, "Enter your mobile number.")
    .refine((s) => isValidPhone(s), {
      message: "Enter a valid 10-digit Indian mobile number (you can include +91 or spaces).",
    }),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(6),
  code: z.string().regex(/^\d{6}$/, "6-digit code"),
});

const usernameField = z
  .string()
  .trim()
  .min(3, "At least 3 characters")
  .max(30)
  .regex(/^[a-zA-Z0-9_.]+$/, "Use letters, numbers, dot, or underscore (no spaces)")
  .transform((s) => s.toLowerCase());

/** Sign-up: at least one of email or username, plus password. */
export const registerSchema = z
  .object({
    email: z.preprocess(
      (v) => {
        if (v === undefined || v === null) return undefined;
        if (typeof v === "string" && v.trim() === "") return undefined;
        return typeof v === "string" ? v.trim().toLowerCase() : v;
      },
      z.string().email("Enter a valid email address").optional()
    ),
    username: z.preprocess(
      (v) => {
        if (v === undefined || v === null) return undefined;
        if (typeof v === "string" && v.trim() === "") return undefined;
        return typeof v === "string" ? v.trim() : v;
      },
      usernameField.optional()
    ),
    password: z.string().min(8, "At least 8 characters").max(128),
    name: z.string().trim().max(100).optional(),
  })
  .refine((d) => Boolean(d.email) || Boolean(d.username), {
    message: "Provide an email or a username",
    path: ["email"],
  });

export type RegisterInput = z.infer<typeof registerSchema>;

export const credentialsLoginSchema = z.object({
  identifier: z.string().trim().min(1, "Email or username required"),
  password: z.string().min(1, "Password required"),
});

export type CredentialsLoginInput = z.infer<typeof credentialsLoginSchema>;

/** Magic link (email provider) sign-in. */
export const magicLinkEmailSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email required")
    .email("Enter a valid email address")
    .transform((s) => s.toLowerCase()),
});

export type MagicLinkEmailInput = z.infer<typeof magicLinkEmailSchema>;
