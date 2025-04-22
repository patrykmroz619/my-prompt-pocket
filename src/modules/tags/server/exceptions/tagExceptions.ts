/**
 * Exception thrown when attempting to create a tag that already exists
 */
export class TagAlreadyExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TagAlreadyExistsError";
  }
}
