import type {
  CreatePromptCommand,
  PaginatedResponse,
  PromptDto,
  PromptFilterParams,
  UpdatePromptCommand,
} from "@shared/types/types";

/**
 * Service for handling prompt-related API requests
 */
export const promptService = {
  /**
   * Fetches a paginated list of prompts with optional filtering
   */
  async getPromptsList(params?: PromptFilterParams): Promise<PaginatedResponse<PromptDto>> {
    // Construct query parameters
    const queryParams = new URLSearchParams();

    if (params?.search) queryParams.set("search", params.search);
    if (params?.tags) queryParams.set("tags", params.tags);
    if (params?.page) queryParams.set("page", params.page.toString());
    if (params?.page_size) queryParams.set("page_size", params.page_size.toString());
    if (params?.sort_by) queryParams.set("sort_by", params.sort_by);
    if (params?.sort_dir) queryParams.set("sort_dir", params.sort_dir);

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    const response = await fetch(`/api/prompts${queryString}`);

    if (!response.ok) {
      throw new Error("Failed to fetch prompts list");
    }

    return await response.json();
  },

  /**
   * Fetches a prompt by ID
   */
  async getPromptById(promptId: string): Promise<PromptDto> {
    const response = await fetch(`/api/prompts/${promptId}`);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Prompt not found");
      }
      throw new Error("Failed to fetch prompt");
    }

    return await response.json();
  },

  /**
   * Creates a new prompt
   */
  async createPrompt(data: CreatePromptCommand): Promise<{ id: string }> {
    const response = await fetch("/api/prompts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 409) {
        throw new Error("A prompt with this name already exists");
      }

      if (response.status === 400) {
        if (errorData.parameters) {
          throw new Error(`Missing parameter definitions for: ${errorData.parameters.join(", ")}`);
        }
        if (errorData.missingParameters) {
          throw new Error(`Some parameters are missing type definitions: ${errorData.missingParameters.join(", ")}`);
        }
        throw new Error("Invalid prompt data");
      }

      throw new Error("Failed to create prompt");
    }

    return await response.json();
  },

  /**
   * Updates an existing prompt
   */
  async updatePrompt(promptId: string, data: UpdatePromptCommand): Promise<{ id: string }> {
    const response = await fetch(`/api/prompts/${promptId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (response.status === 409) {
        throw new Error("A prompt with this name already exists");
      }

      if (response.status === 400) {
        if (errorData.parameters) {
          throw new Error(`Missing parameter definitions for: ${errorData.parameters.join(", ")}`);
        }
        if (errorData.missingParameters) {
          throw new Error(`Some parameters are missing type definitions: ${errorData.missingParameters.join(", ")}`);
        }
        throw new Error("Invalid prompt data");
      }

      if (response.status === 404) {
        throw new Error("Prompt not found");
      }

      throw new Error("Failed to update prompt");
    }

    return await response.json();
  },

  /**
   * Delete a prompt by ID
   *
   * @param promptId The ID of the prompt to delete
   * @returns A promise that resolves when the prompt is deleted
   * @throws Error if the API call fails
   */
  async deletePrompt(promptId: string): Promise<void> {
    if (!promptId) {
      throw new Error("Prompt ID is required");
    }

    const response = await fetch(`/api/prompts/${promptId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      // Try to get error message from response
      let errorMessage = `Failed to delete prompt (Status: ${response.status})`;
      try {
        const errorData = await response.json();
        if (errorData.message) {
          errorMessage = errorData.message;
        }
      } catch (e) {
        // If we can't parse the error, just use the default message
      }
      throw new Error(errorMessage);
    }
  },
};
