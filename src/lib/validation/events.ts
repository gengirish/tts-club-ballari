import { z } from "zod";

export const eventCreateSchema = z.object({
  type: z.enum(["WALK", "RUN", "YOGA", "MEETUP", "CYCLING", "TREKKING"]),
  title: z.string().min(2),
  location: z.string().min(2),
  startsAt: z.coerce.date(),
  capacity: z.number().int().min(1).optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
