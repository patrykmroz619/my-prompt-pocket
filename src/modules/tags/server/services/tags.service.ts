import type { CreateTagCommand, IRequestContext, TagDto } from "../../../../shared/types/types";
import { TagAlreadyExistsError, TagNotFoundError } from "../exceptions/tags.exceptions";
import { tagRepository } from "../repositories/tags.repository";
import { createTagSchema } from "@modules/tags/shared/schemas/create-tag-schema";
import { updateTagSchema } from "@modules/tags/shared/schemas/update-tag-schema";
import type { UpdateTagCommand } from "../../../../shared/types/types";
import { tagIdSchema } from "../../shared/schemas/tag-schema";
import type { IUser } from "@shared/types/types";

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

// Validate tag update command
function validateUpdateTagCommand(data: unknown): UpdateTagCommand {
  const result = updateTagSchema.safeParse(data);

  if (!result.success) {
    throw new Error(`Invalid tag data: ${result.error.message}`);
  }

  return result.data;
}

// Update an existing tag
async function updateTag(
  tagId: string,
  command: UpdateTagCommand,
  userId: string,
  context: IRequestContext
): Promise<TagDto> {
  // Check if tag exists and belongs to user
  const existingTag = await tagRepository.findTagByIdAndUserId(tagId, userId, context);

  if (!existingTag) {
    throw new TagNotFoundError(`Tag with ID ${tagId} not found or does not belong to user`);
  }

  // Check if the new name conflicts with existing ones (excluding current tag)
  const tagNameExists = await tagRepository.checkTagNameExistsExcludingId(
    command.name,
    userId,
    tagId,
    context
  );

  if (tagNameExists) {
    throw new TagAlreadyExistsError(`Tag name '${command.name}' already exists`);
  }

  // Update the tag
  const updatedTag = await tagRepository.updateTag(tagId, command, userId, context);

  return updatedTag;
}

// Service to validate and delete a tag
async function deleteTagService(tagId: string, user: IUser, context: IRequestContext): Promise<void> {
  // Validate tag ID
  try {
    tagIdSchema.parse(tagId);
  } catch (error) {
    throw new Error("Invalid tag ID format");
  }

  // Attempt to delete the tag
  const deleted = await tagRepository.deleteTag(tagId, user.id, context);

  // If tag wasn't deleted (not found or not owned by user)
  if (!deleted) {
    throw new TagNotFoundError("Tag not found");
  }
}

export const tagService = {
  validateCreateTagCommand,
  createTag,
  getTagsForUser,
  validateUpdateTagCommand,
  updateTag,
  deleteTagService
};
