import type { TagDto } from "@shared/types/types";

/**
 * Service for handling tag-related API requests
 */
export const tagService = {
  /**
   * Fetches all tags for the current user
   */
  async getAllTags(): Promise<TagDto[]> {
    const response = await fetch("/api/tags");

    if (!response.ok) {
      throw new Error("Failed to fetch tags");
    }

    const json = await response.json();

    return json.data;
  },

  // Additional tag-related service methods can be added here
};
