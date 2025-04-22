import { z } from "zod";
import { extractParametersFromContent } from "../../shared/utils/extractParametersFromContent.util";
import { createPromptSchema } from "../../shared/schemas/create-prompt.schema";
import {
  MissingParameterDefinitionsError,
  PromptNameConflictError,
  UndefinedParametersError,
} from "../exceptions/prompt.exceptions";
import { promptRepository } from "../repositories/prompt.repository";
import type { IRequestContext } from "@shared/types/types";

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
};
