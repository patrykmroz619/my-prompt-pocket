import { z } from "zod";
import type { CreateTagCommand, IRequestContext, TagDto } from "../../../../shared/types/types";
import { TagAlreadyExistsError } from "../exceptions/tagExceptions";
import { tagRepository } from "../repositories/tagRepository";

// Schema for validating tag creation requests
const createTagSchema = z.object({
  name: z.string().min(1).max(50),
});

// Validate tag creation command
function validateCreateTagCommand(data: unknown): CreateTagCommand {
  const result = createTagSchema.safeParse(data);

  if (!result.success) {
    throw new Error(`Invalid tag data: ${result.error.message}`);
  }

  return result.data;
}

// Create a new tag
async function createTag(command: CreateTagCommand, userId: string, context: IRequestContext): Promise<TagDto> {
  // Check if tag already exists for this user
  const tagExists = await tagRepository.checkTagExists(command.name, userId, context);

  if (tagExists) {
    throw new TagAlreadyExistsError(`Tag '${command.name}' already exists`);
  }

  // Insert the new tag
  const newTag = await tagRepository.insertTag(command, userId, context);

  return newTag;
}

export const tagService = {
  validateCreateTagCommand,
  createTag
};
