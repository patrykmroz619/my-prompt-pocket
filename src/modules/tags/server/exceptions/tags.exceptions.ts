/**
 * Exception thrown when attempting to create a tag that already exists
 */
export class TagAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TagAlreadyExistsError";
  }
}

/**
 * Exception thrown when a tag is not found or doesn't belong to the user
 */
export class TagNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TagNotFoundError";
  }
}
