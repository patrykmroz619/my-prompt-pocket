import { z } from "zod";

// Schema for validating POST /api/prompt-tags request body
export const AssignPromptToTagCommandSchema = z.object({
  prompt_id: z.string().uuid({
    message: "Prompt ID must be a valid UUID",
  }),
  tag_id: z.string().uuid({
    message: "Tag ID must be a valid UUID",
  }),
});

export type ValidatedAssignPromptToTagCommand = z.infer<typeof AssignPromptToTagCommandSchema>;

// Schema for validating DELETE /api/prompt-tags request body
export const RemoveTagFromPromptCommandSchema = z.object({
  prompt_id: z.string().uuid({
    message: "Prompt ID must be a valid UUID",
  }),
  tag_id: z.string().uuid({
    message: "Tag ID must be a valid UUID",
  }),
});

export type ValidatedRemoveTagFromPromptCommand = z.infer<typeof RemoveTagFromPromptCommandSchema>;
