import type { CreatePromptCommand, PromptDto, UpdatePromptCommand } from "@shared/types/types";

/**
 * Service for handling prompt-related API requests
 */
export const promptService = {
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
  }
};
