import type { Prisma } from "@prisma/client";
import type { WalkingTo5kEnrollInput } from "@/lib/validation/walking-to-5k";

type WalkingAssessment = {
  parq?: {
    heartCondition?: boolean;
    chestPainDuringActivity?: boolean;
    recentSurgery?: boolean;
    regularMedication?: boolean;
    otherConcerns?: string;
  };
  emergencyContact?: {
    name?: string;
    phoneE164?: string;
    relationship?: string;
  };
  orientation?: {
    whatsAppGroupJoined?: boolean;
    medicalFormSubmitted?: boolean;
  };
  consent?: {
    voluntary?: boolean;
    withinLimits?: boolean;
  };
};

function asAssessment(json: Prisma.JsonValue | null): WalkingAssessment | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  return json as WalkingAssessment;
}

type UserSlice = {
  name: string | null;
  email: string | null;
  phone: string | null;
  dob: Date | null;
};

/** Rebuild Walking to 5K wizard fields from stored enrollment + user row. */
export function walkingTo5kFormFromEnrollment(
  user: UserSlice,
  assessmentJson: Prisma.JsonValue | null
): WalkingTo5kEnrollInput | null {
  const assessment = asAssessment(assessmentJson);
  if (!assessment?.emergencyContact?.name || !assessment.emergencyContact.phoneE164) return null;

  const dob = user.dob ? user.dob.toISOString().slice(0, 10) : "";
  if (!user.name?.trim() || !dob) return null;

  return {
    fullName: user.name.trim(),
    dateOfBirth: dob,
    mobile: user.phone ?? "",
    email: user.email ?? undefined,
    emergencyContactName: assessment.emergencyContact.name,
    emergencyContactPhone: assessment.emergencyContact.phoneE164,
    emergencyRelationship: assessment.emergencyContact.relationship ?? "",
    parqHeartCondition: assessment.parq?.heartCondition ?? false,
    parqChestPainDuringActivity: assessment.parq?.chestPainDuringActivity ?? false,
    parqRecentSurgery: assessment.parq?.recentSurgery ?? false,
    parqRegularMedication: assessment.parq?.regularMedication ?? false,
    parqOtherConcerns: assessment.parq?.otherConcerns || undefined,
    consentVoluntary: assessment.consent?.voluntary ?? false,
    consentWithinLimits: assessment.consent?.withinLimits ?? false,
    orientationWhatsAppJoined: assessment.orientation?.whatsAppGroupJoined ?? false,
    orientationMedicalSubmitted: assessment.orientation?.medicalFormSubmitted ?? false,
  };
}
