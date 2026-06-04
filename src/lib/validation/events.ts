import { z } from "zod";

/** Valid http(s) URL, or empty string to clear the field. */
const optionalUrl = z.union([z.string().url(), z.literal("")]).optional().nullable();

export const eventCreateSchema = z.object({
  type: z.enum(["WALK", "RUN", "YOGA", "MEETUP", "CYCLING", "TREKKING"]),
  title: z.string().min(2),
  location: z.string().min(2),
  startsAt: z.coerce.date(),
  capacity: z.number().int().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  publicRegistrationsOpen: z.boolean().optional(),
  paymentInstructions: z.string().max(8000).optional().nullable(),
  whatsappGroupInviteUrl: optionalUrl.nullable(),
});

export const eventPatchSchema = z
  .object({
    type: z.enum(["WALK", "RUN", "YOGA", "MEETUP", "CYCLING", "TREKKING"]).optional(),
    title: z.string().min(2).optional(),
    location: z.string().min(2).optional(),
    startsAt: z.coerce.date().optional(),
    capacity: z.number().int().min(1).nullable().optional(),
    lat: z.number().nullable().optional(),
    lng: z.number().nullable().optional(),
    publicRegistrationsOpen: z.boolean().optional(),
    paymentInstructions: z.string().max(8000).nullable().optional(),
    whatsappGroupInviteUrl: optionalUrl.nullable().optional(),
  })
  .strict();

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
export type EventPatchInput = z.infer<typeof eventPatchSchema>;
