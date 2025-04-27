import { z } from "zod";

// Schema for validating prompt improvement request
export const promptImprovementSchema = z.object({
  content: z
    .string({
      required_error: "Prompt content is required",
    })
    .min(3, "Prompt content must be at least 3 characters long")
    .max(10000, "Prompt content exceeds maximum length"),
  instruction: z.string().max(1000, "Instruction exceeds maximum length").optional(),
});

// Type inference from the schema
export type PromptImprovementInput = z.infer<typeof promptImprovementSchema>;
