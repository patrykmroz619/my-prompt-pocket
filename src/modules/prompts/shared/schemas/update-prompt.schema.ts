// filepath: c:\Users\patry\Documents\Projekty\my-prompt-pocket\src\modules\prompts\shared\schemas\update-prompt.schema.ts
import { z } from "zod";

export const updatePromptSchema = z.object({
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

export type ValidatedUpdatePromptCommand = z.infer<typeof updatePromptSchema>;
