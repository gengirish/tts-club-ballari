import { z } from "zod";

export const communityPostSchema = z.object({
  body: z
    .string()
    .trim()
    .min(1, "Write something before posting.")
    .max(5000, "Post is too long (max 5000 characters)."),
});

export const communityCommentSchema = z.object({
  body: z.string().min(1).max(2000),
});
