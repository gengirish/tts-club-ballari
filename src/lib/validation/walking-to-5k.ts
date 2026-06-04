import { z } from "zod";
import { isValidPhone } from "@/lib/utils/phone";

/** PAR-Q style yes/no — `true` means the participant answered Yes (risk flag). */
const parqBool = z.boolean({
  required_error: "Answer each medical question.",
  invalid_type_error: "Answer each medical question.",
});

export const walkingTo5kEnrollSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name.").max(100),
  /** HTML date input: YYYY-MM-DD */
  dateOfBirth: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Choose a valid date of birth."),
  mobile: z
    .string()
    .trim()
    .min(1, "Enter your mobile number.")
    .refine((s) => isValidPhone(s), {
      message: "Enter a valid 10-digit Indian mobile number (you can include +91 or spaces).",
    }),
  email: z.preprocess(
    (v) => {
      if (v === undefined || v === null) return undefined;
      if (typeof v === "string" && v.trim() === "") return undefined;
      return typeof v === "string" ? v.trim().toLowerCase() : v;
    },
    z.string().email("Enter a valid email address.").max(254).optional()
  ),
  emergencyContactName: z.string().trim().min(2, "Enter emergency contact name.").max(100),
  emergencyContactPhone: z
    .string()
    .trim()
    .min(1, "Enter emergency contact phone.")
    .refine((s) => isValidPhone(s), {
      message: "Enter a valid emergency contact number.",
    }),
  emergencyRelationship: z.string().trim().min(1, "Enter relationship (e.g. spouse, parent).").max(80),
  parqHeartCondition: parqBool,
  parqChestPainDuringActivity: parqBool,
  parqRecentSurgery: parqBool,
  parqRegularMedication: parqBool,
  parqOtherConcerns: z.string().trim().max(2000).optional(),
  consentVoluntary: z
    .boolean()
    .refine((v) => v === true, { message: "Confirm you understand participation is voluntary." }),
  consentWithinLimits: z
    .boolean()
    .refine((v) => v === true, { message: "Confirm you will exercise within your limits." }),
  orientationWhatsAppJoined: z.boolean().optional(),
  orientationMedicalSubmitted: z
    .boolean()
    .refine((v) => v === true, { message: "Confirm your medical declaration is complete." }),
});

export type WalkingTo5kEnrollInput = z.infer<typeof walkingTo5kEnrollSchema>;

export const walkingTo5kStep1Schema = walkingTo5kEnrollSchema.pick({
  fullName: true,
  dateOfBirth: true,
  mobile: true,
  email: true,
});

export const walkingTo5kStep2Schema = walkingTo5kEnrollSchema.pick({
  emergencyContactName: true,
  emergencyContactPhone: true,
  emergencyRelationship: true,
});

export const walkingTo5kStep3Schema = walkingTo5kEnrollSchema.pick({
  parqHeartCondition: true,
  parqChestPainDuringActivity: true,
  parqRecentSurgery: true,
  parqRegularMedication: true,
  parqOtherConcerns: true,
});

export const walkingTo5kStep4Schema = walkingTo5kEnrollSchema.pick({
  consentVoluntary: true,
  consentWithinLimits: true,
  orientationMedicalSubmitted: true,
  orientationWhatsAppJoined: true,
});

const stepSchemas = {
  1: walkingTo5kStep1Schema,
  2: walkingTo5kStep2Schema,
  3: walkingTo5kStep3Schema,
  4: walkingTo5kStep4Schema,
} as const;

export type WalkingTo5kWizardStep = keyof typeof stepSchemas;

/** Validate a single wizard step from the full enrolment payload. */
export function validateWalkingTo5kStep(
  step: WalkingTo5kWizardStep,
  data: WalkingTo5kEnrollInput
): { ok: true } | { ok: false; fieldErrors: Record<string, string>; message: string } {
  const parsed = stepSchemas[step].safeParse(data);
  if (parsed.success) return { ok: true };
  const fieldErrors: Record<string, string> = {};
  for (const [key, messages] of Object.entries(parsed.error.flatten().fieldErrors)) {
    const msg = messages?.[0];
    if (msg) fieldErrors[key] = msg;
  }
  const message =
    Object.values(fieldErrors)[0] ?? "Please complete the required fields on this step.";
  return { ok: false, fieldErrors, message };
}

/** First wizard step (1–4) that fails validation, or null if all pass. */
export function firstInvalidWalkingTo5kStep(data: WalkingTo5kEnrollInput): WalkingTo5kWizardStep | null {
  for (const s of [1, 2, 3, 4] as const) {
    if (!validateWalkingTo5kStep(s, data).ok) return s;
  }
  return null;
}
