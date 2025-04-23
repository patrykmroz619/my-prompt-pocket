import { z } from "zod";
import { extractParametersFromContent } from "../../shared/utils/extractParametersFromContent.util";
import { createPromptSchema } from "../../shared/schemas/create-prompt.schema";
import {
  MissingParameterDefinitionsError,
  PromptNameConflictError,
  UndefinedParametersError,
} from "../exceptions/prompt.exceptions";
import { promptRepository } from "../repositories/prompt.repository";
import type {
  IRequestContext,
  PaginatedResponse,
  PromptDto,
} from "@shared/types/types";
import type { ValidatedPromptFilterParams } from "@modules/prompts/shared/schemas/prompt.schemas";

export const promptService = {
  validatePromptParameters: async (content: string, parameters?: { name: string; type: string }[]) => {
    const extractedParameters = extractParametersFromContent(content);

    if (extractedParameters.length > 0) {
      if (!parameters) {
        throw new MissingParameterDefinitionsError(extractedParameters);
      }

      // Validate that all extracted parameters have corresponding definitions
      const definedParameters = new Set(parameters.map(p => p.name));
      const missingDefinitions = extractedParameters.filter((p: string) => !definedParameters.has(p));

      if (missingDefinitions.length > 0) {
        throw new UndefinedParametersError(missingDefinitions);
      }
    }
  },

  createPrompt: async (
    context: IRequestContext,
    data: z.infer<typeof createPromptSchema>,
    userId: string
  ) => {
    try {
      // TODO: Validate that all tags exist and belong to the user

      const prompt = await promptRepository.createPrompt(
        context,
        {
          name: data.name,
          description: data.description ?? null,
          content: data.content,
          parameters: data.parameters ?? [],
          userId,
        }
      );

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

  getPrompts: async (
    context: IRequestContext,
    userId: string,
    filters: ValidatedPromptFilterParams,
  ): Promise<PaginatedResponse<PromptDto>> => {
    // Fetch potentially matching prompts and total count (before strict tag filtering)
    const { prompts: dbPrompts, totalCount: initialTotalCount } = await promptRepository.findMany(
      context,
      userId,
      filters,
    );

    // Filter for 'all tags' in the service layer if tags are specified
    let filteredDbPrompts = dbPrompts;
    if (filters.tags && filters.tags.length > 0) {
      const requiredTagIds = new Set(filters.tags);
      filteredDbPrompts = dbPrompts.filter((p) => {
        const promptTagIds = new Set(p.prompt_tags.map((pt) => pt.tag.id));
        // Check if the prompt's tags contain all required tags
        return [...requiredTagIds].every((requiredTagId) =>
          promptTagIds.has(requiredTagId),
        );
      });
    }

    // Map filtered database results to PromptDto
    const mappedPrompts: PromptDto[] = filteredDbPrompts.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      content: p.content,
      // Ensure parameters is an array, handle null/undefined from DB if necessary
      parameters: Array.isArray(p.parameters) ? p.parameters : [],
      created_at: p.created_at,
      updated_at: p.updated_at,
      // Extract and flatten tags
      tags: p.prompt_tags.map((pt) => pt.tag),
    }));

    // Calculate pagination based on the initial total count
    // Note: total_items and total_pages reflect the count *before* service-layer tag filtering.
    // This is a limitation of filtering after fetching paginated results.
    // A more accurate count would require filtering at the DB level (e.g., with a function/view).
    const { page, page_size } = filters;
    const total_pages = Math.ceil(initialTotalCount / page_size);

    return {
      data: mappedPrompts,
      pagination: {
        total_items: initialTotalCount, // Reflects count before service-layer filtering
        total_pages: total_pages,
        current_page: page,
        page_size: page_size,
      },
    };
  },
};
