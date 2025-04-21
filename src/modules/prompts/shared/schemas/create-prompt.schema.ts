import { z } from "zod";

export const createPromptSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(1000).nullable().optional(),
  content: z.string().min(1),
  parameters: z
    .array(
      z.object({
        name: z.string().min(1),
        type: z.enum(["short-text", "long-text"]),
      })
    )
    .optional(),
  tags: z.array(z.string().uuid()).optional(),
});
