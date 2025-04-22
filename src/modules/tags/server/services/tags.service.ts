import type { CreateTagCommand, IRequestContext, TagDto } from "../../../../shared/types/types";
import { TagAlreadyExistsError } from "../exceptions/tags.exceptions";
import { tagRepository } from "../repositories/tags.repository";
import { createTagSchema } from "@modules/tags/shared/schemas/create-tag-schema";

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

// Get all tags for a user with prompt counts
async function getTagsForUser(userId: string, context: IRequestContext): Promise<TagDto[]> {
  try {
    const tags = await tagRepository.findTagsByUserIdWithPromptCount(userId, context);
    // No additional transformations needed for now, repository returns TagDto[]
    return tags;
  } catch (error: any) {
    // Log the error and re-throw or handle appropriately
    console.error("Error fetching tags in service:", error);
    // Depending on desired error handling, might re-throw or return a specific error response
    throw new Error(`Service error fetching tags: ${error.message}`);
  }
}

export const tagService = {
  validateCreateTagCommand,
  createTag,
  getTagsForUser // Add the new method here
};
