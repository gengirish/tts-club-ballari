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
