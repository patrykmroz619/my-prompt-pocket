// filepath: c:\Users\patry\Documents\Projekty\my-prompt-pocket\src\modules\prompts\server\exceptions\prompt-tag.exceptions.ts
/**
 * Exception classes for prompt-tag operations
 */

// Base exception class for prompt-tag operations
export class PromptTagError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PromptTagError";
  }
}

// Thrown when a prompt is not found during tag association
export class PromptNotFoundError extends PromptTagError {
  constructor(promptId: string) {
    super(`Prompt with ID ${promptId} not found`);
    this.name = "PromptNotFoundError";
  }
}

// Thrown when a tag is not found during prompt association
export class TagNotFoundError extends PromptTagError {
  constructor(tagId: string) {
    super(`Tag with ID ${tagId} not found`);
    this.name = "TagNotFoundError";
  }
}

// Thrown when attempting to create a duplicate association
export class DuplicateAssociationError extends PromptTagError {
  constructor(promptId: string, tagId: string) {
    super(`Prompt with ID ${promptId} is already associated with tag ID ${tagId}`);
    this.name = "DuplicateAssociationError";
  }
}

// Thrown when attempting to associate a prompt with a tag belonging to another user
export class UnauthorizedAssociationError extends PromptTagError {
  constructor() {
    super("Unauthorized to associate this prompt with this tag");
    this.name = "UnauthorizedAssociationError";
  }
}

// Thrown when an association is not found during deletion
export class AssociationNotFoundError extends PromptTagError {
  constructor(promptId: string, tagId: string) {
    super(`Association between prompt ID ${promptId} and tag ID ${tagId} not found`);
    this.name = "AssociationNotFoundError";
  }
}
