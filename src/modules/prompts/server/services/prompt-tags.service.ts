// filepath: c:\Users\patry\Documents\Projekty\my-prompt-pocket\src\modules\prompts\server\services\prompt-tags.service.ts
import type { IRequestContext, PromptTagDto } from "@shared/types/types";
import type {
  ValidatedAssignPromptToTagCommand,
  ValidatedRemoveTagFromPromptCommand,
} from "../../shared/schemas/prompt-tags.schema";
import { promptTagRepository } from "../repositories/prompt-tag.repository";

export const promptTagsService = {
  /**
   * Assigns a tag to a prompt
   * @param command The validated command with prompt_id and tag_id
   * @param context The request context with auth information
   * @returns The created prompt-tag association
   */
  assignTagToPrompt: async (
    command: ValidatedAssignPromptToTagCommand,
    context: IRequestContext
  ): Promise<PromptTagDto> => {
    return promptTagRepository.assignTagToPrompt(context, command.prompt_id, command.tag_id);
  },

  /**
   * Removes a tag from a prompt
   * @param command The validated command with prompt_id and tag_id
   * @param context The request context with auth information
   * @returns void - 204 No Content response expected
   */
  removeTagFromPrompt: async (
    command: ValidatedRemoveTagFromPromptCommand,
    context: IRequestContext
  ): Promise<void> => {
    await promptTagRepository.deleteTagFromPrompt(context, command.prompt_id, command.tag_id);

    // No return value needed as we'll return 204 No Content
  },
};
