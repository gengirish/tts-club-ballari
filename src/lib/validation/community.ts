import { z } from "zod";

export const communityPostSchema = z.object({
  body: z.string().min(1).max(5000),
});

export const communityCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});
