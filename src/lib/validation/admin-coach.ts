import { z } from "zod";
import { CoachType } from "@prisma/client";

const coachTypeSchema = z.nativeEnum(CoachType);

const coachProfileShape = {
  type: coachTypeSchema,
  bio: z.string().trim().max(2000).optional(),
  /** Price per session in paise (integer). */
  sessionPaise: z.coerce.number().int().min(0).max(500_000_000),
  qualification: z.string().trim().max(500).optional(),
  experienceYrs: z.coerce.number().int().min(0).max(80).default(0),
  specialty: z.string().trim().max(200).optional(),
  available: z.boolean().default(true),
};

const usernameField = z
  .string()
  .trim()
  .min(3, "At least 3 characters")
  .max(30)
  .regex(/^[a-zA-Z0-9_.]+$/, "Use letters, numbers, dot, or underscore (no spaces)")
  .transform((s) => s.toLowerCase());

function optionalEmail() {
  return z.preprocess(
    (v) => {
      if (v === undefined || v === null) return undefined;
      if (typeof v === "string" && v.trim() === "") return undefined;
      return typeof v === "string" ? v.trim().toLowerCase() : v;
    },
    z.string().email("Enter a valid email address").optional()
  );
}

function optionalUsername() {
  return z.preprocess(
    (v) => {
      if (v === undefined || v === null) return undefined;
      if (typeof v === "string" && v.trim() === "") return undefined;
      return typeof v === "string" ? v.trim() : v;
    },
    usernameField.optional()
  );
}

const promoteEmailField = z.preprocess(
  (v) => {
    if (v === undefined || v === null) return undefined;
    if (typeof v === "string" && v.trim() === "") return undefined;
    return typeof v === "string" ? v.trim().toLowerCase() : v;
  },
  z.string().email("Enter a valid email address").optional()
);

const promoteUserIdField = z.preprocess(
  (v) => {
    if (v === undefined || v === null) return undefined;
    if (typeof v === "string" && v.trim() === "") return undefined;
    return typeof v === "string" ? v.trim() : v;
  },
  z.string().cuid().optional()
);

export const adminCoachPostBodySchema = z
  .object({
    mode: z.enum(["create", "promote"]),
    email: optionalEmail(),
    username: optionalUsername(),
    password: z.string().min(8, "At least 8 characters").max(128).optional(),
    name: z.string().trim().max(100).optional(),
    promoteEmail: promoteEmailField,
    promoteUserId: promoteUserIdField,
    ...coachProfileShape,
  })
  .superRefine((data, ctx) => {
    if (data.mode === "create") {
      if (!data.password) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Password is required.", path: ["password"] });
      }
      if (!data.email && !data.username) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide an email or a username for the new coach account.",
          path: ["email"],
        });
      }
    } else {
      if (!data.promoteEmail && !data.promoteUserId) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Provide the member's email or their user id.",
          path: ["promoteEmail"],
        });
      }
    }
  });

export type AdminCoachPostBody = z.infer<typeof adminCoachPostBodySchema>;
