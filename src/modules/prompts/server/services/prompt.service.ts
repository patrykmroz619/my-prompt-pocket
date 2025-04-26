import { z } from "zod";
import { extractParametersFromContent } from "../../shared/utils/extractParametersFromContent.util";
import { createPromptSchema } from "../../shared/schemas/create-prompt.schema";
import {
  MissingParameterDefinitionsError,
  NotFoundException,
  PromptNameConflictError,
  UndefinedParametersError,
} from "../exceptions/prompt.exceptions";
import { promptRepository } from "../repositories/prompt.repository";
import type { IRequestContext, PaginatedResponse, PromptDto } from "@shared/types/types";
import type { ValidatedPromptFilterParams } from "@modules/prompts/shared/schemas/prompt.schemas";
import type { ValidatedUpdatePromptCommand } from "@modules/prompts/shared/schemas/update-prompt.schema";

export const promptService = {
  validatePromptParameters: async (content: string, parameters?: { name: string; type: string }[]) => {
    const extractedParameters = extractParametersFromContent(content);

    if (extractedParameters.length > 0) {
      if (!parameters) {
        throw new MissingParameterDefinitionsError(extractedParameters);
      }

      // Validate that all extracted parameters have corresponding definitions
      const definedParameters = new Set(parameters.map((p) => p.name));
      const missingDefinitions = extractedParameters.filter((p: string) => !definedParameters.has(p));

      if (missingDefinitions.length > 0) {
        throw new UndefinedParametersError(missingDefinitions);
      }
    }
  },

  createPrompt: async (context: IRequestContext, data: z.infer<typeof createPromptSchema>, userId: string) => {
    try {
      // TODO: Validate that all tags exist and belong to the user

      const prompt = await promptRepository.createPrompt(context, {
        name: data.name,
        description: data.description ?? null,
        content: data.content,
        parameters: data.parameters ?? [],
        userId,
      });

      if (data.tags && data.tags.length > 0) {
        try {
          await promptRepository.associateWithTags(context, prompt.id, data.tags);
        } catch (error) {
          // Rollback prompt creation if tag association fails
          await promptRepository.deletePrompt(context, prompt.id);
          throw error;
        }
      }

      return await promptRepository.getPromptWithTags(context, prompt.id);
    } catch (error) {
      if (error instanceof Error && error.message === "Prompt with this name already exists") {
        throw new PromptNameConflictError();
      }
      throw error;
    }
  },

  updatePrompt: async (
    context: IRequestContext,
    promptId: string,
    userId: string,
    data: ValidatedUpdatePromptCommand
  ): Promise<PromptDto> => {
    try {
      // Update the prompt in the database
      await promptRepository.updatePrompt(context, promptId, userId, {
        name: data.name,
        description: data.description ?? null,
        content: data.content,
        parameters: data.parameters ?? [],
      });

      // Update tags if provided
      if (data.tags !== undefined) {
        await promptRepository.updatePromptTags(context, promptId, data.tags);
      }

      // Fetch the complete updated prompt with tags
      const promptWithTags = await promptRepository.findById(context, promptId);

      if (!promptWithTags) {
        throw new NotFoundException(promptId);
      }

      // Map the database prompt to the PromptDto format
      return {
        id: promptWithTags.id,
        name: promptWithTags.name,
        description: promptWithTags.description,
        content: promptWithTags.content,
        parameters: Array.isArray(promptWithTags.parameters) ? promptWithTags.parameters : [],
        user_id: promptWithTags.user_id,
        created_at: promptWithTags.created_at,
        updated_at: promptWithTags.updated_at,
        tags: promptWithTags.prompt_tags.map((pt) => pt.tag),
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === "A prompt with this name already exists for your account") {
          throw new PromptNameConflictError();
        }
        if (error.message === "Prompt not found") {
          throw new NotFoundException(promptId);
        }
      }
      throw error;
    }
  },

  getPromptById: async (context: IRequestContext, promptId: string): Promise<PromptDto> => {
    // Fetch the prompt from the repository
    const prompt = await promptRepository.findById(context, promptId);

    // If prompt is not found, throw a NotFoundException
    if (!prompt) {
      throw new NotFoundException(promptId);
    }

    // Map the database prompt to the PromptDto format
    return {
      id: prompt.id,
      name: prompt.name,
      description: prompt.description,
      content: prompt.content,
      // Ensure parameters is an array, handle null/undefined from DB if necessary
      parameters: Array.isArray(prompt.parameters) ? prompt.parameters : [],
      user_id: prompt.user_id,
      created_at: prompt.created_at,
      updated_at: prompt.updated_at,
      // Extract and flatten tags
      tags: prompt.prompt_tags.map((pt) => pt.tag),
    };
  },

  getPrompts: async (
    context: IRequestContext,
    userId: string,
    filters: ValidatedPromptFilterParams
  ): Promise<PaginatedResponse<PromptDto>> => {
    // Fetch potentially matching prompts and total count (before strict tag filtering)
    const { prompts: dbPrompts, totalCount } = await promptRepository.findMany(context, userId, filters);

    // Map filtered database results to PromptDto
    const mappedPrompts: PromptDto[] = dbPrompts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      content: p.content,
      // Ensure parameters is an array, handle null/undefined from DB if necessary
      parameters: Array.isArray(p.parameters) ? p.parameters : [],
      created_at: p.created_at,
      updated_at: p.updated_at,
      user_id: p.user_id,
      // Extract and flatten tags
      tags: p.prompt_tags.map((pt) => pt.tag),
    }));

    // Calculate pagination based on the initial total count
    // Note: total_items and total_pages reflect the count *before* service-layer tag filtering.
    // This is a limitation of filtering after fetching paginated results.
    // A more accurate count would require filtering at the DB level (e.g., with a function/view).
    const { page, page_size } = filters;
    const total_pages = Math.ceil(totalCount / page_size);

    return {
      data: mappedPrompts,
      pagination: {
        total_items: totalCount, // Reflects count before service-layer filtering
        total_pages: total_pages,
        current_page: page,
        page_size: page_size,
      },
    };
  },

  deletePrompt: async (context: IRequestContext, promptId: string, userId: string): Promise<void> => {
    // Check if the prompt exists and belongs to the user
    const prompt = await promptRepository.findById(context, promptId);

    // If prompt is not found, throw a NotFoundException
    if (!prompt) {
      throw new NotFoundException(promptId);
    }

    // Check if the prompt belongs to the user
    if (prompt.user_id !== userId) {
      throw new NotFoundException(promptId);
    }

    // Delete the prompt
    await promptRepository.deletePrompt(context, promptId);
  },
};
