import { z } from "zod";

export const sosCreateSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  eventId: z.string().optional(),
});
