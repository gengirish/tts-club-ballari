import { parsePhoneNumberFromString, type CountryCode } from "libphonenumber-js";

const DEFAULT_REGION: CountryCode = "IN";

/** Normalise any user input to E.164 (+91...). Returns null if invalid. */
export function toE164(input: string, region: CountryCode = DEFAULT_REGION): string | null {
  const parsed = parsePhoneNumberFromString(input, region);
  return parsed && parsed.isValid() ? parsed.number : null;
}

export function isValidPhone(input: string, region: CountryCode = DEFAULT_REGION): boolean {
  return toE164(input, region) !== null;
}
