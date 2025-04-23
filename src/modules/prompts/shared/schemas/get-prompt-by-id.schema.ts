import { z } from "zod";

// Schema for validating the prompt ID parameter
export const promptIdSchema = z.object({
  id: z.string().uuid({
    message: "Prompt ID must be a valid UUID",
  }),
});

export type PromptIdParams = z.infer<typeof promptIdSchema>;
