import type { CreateTagCommand, TagDto } from "@shared/types/types";

/**
 * Service for handling tag-related API requests
 */
export const tagService = {
  /**
   * Fetches all tags for the current user
   */
  async getAllTags(): Promise<TagDto[]> {
    try {
      const response = await fetch("/api/tags");

      if (!response.ok) {
        // Handle specific HTTP status codes
        if (response.status === 401) {
          throw new Error("You must be logged in to access tags");
        }

        throw new Error("Failed to fetch tags");
      }

      const json = await response.json();

      // Ensure data is an array, even if empty
      if (!json.data || !Array.isArray(json.data)) {
        return [];
      }

      return json.data;
    } catch (error) {
      console.error("Error in getAllTags:", error);
      throw error;
    }
  },

  /**
   * Creates a new tag for the current user
   * @param name The name of the tag to create
   * @returns The newly created tag
   */
  async createTag(name: string): Promise<TagDto> {
    if (!name || !name.trim()) {
      throw new Error("Tag name cannot be empty");
    }

    const command: CreateTagCommand = {
      name: name.trim()
    };

    const response = await fetch("/api/tags", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(command)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to create tag");
    }

    return await response.json();
  }
};
