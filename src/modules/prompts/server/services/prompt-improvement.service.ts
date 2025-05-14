import { z } from "zod"; // Import Zod
import type { PromptImprovementDto } from "@shared/types/types";
import { AIService } from "@modules/ai/services/AIService";
import { getEnv } from "@shared/utils/getEnv";
import { improveUserPrompt } from "../prompts/improve-user-prompt";

export interface ImprovePromptParams {
  content: string;
  instruction?: string | undefined;
}

// Define the Zod schema for the expected AI response
const AIResponseSchema = z.object({
  _thoughts: z.string().optional(), // Keep thoughts optional for validation if not strictly needed downstream
  improved_content: z.string(),
  explanation: z.string(),
});

async function improve({ content }: ImprovePromptParams): Promise<PromptImprovementDto> {
  try {
    // Send the request to OpenRouter
    const aiMessage = await AIService.textCompletion({
      model: getEnv("PROMPTS_IMPROVEMENT_MODEL"),
      messages: [
        { role: "system", content: improveUserPrompt() },
        { role: "user", content },
      ],
    });

    if (!aiMessage) {
      throw new Error("AI did not return a valid response");
    }

    // Parse and validate the JSON response
    const parsedJson = JSON.parse(aiMessage);
    const validationResult = AIResponseSchema.safeParse(parsedJson);

    if (!validationResult.success) {
      console.error("AI response validation failed:", validationResult.error.errors);
      throw new Error(`Invalid AI response structure: ${validationResult.error.message}`);
    }

    const validatedData = validationResult.data;

    return {
      improved_content: validatedData.improved_content,
      explanation: validatedData.explanation,
    };
  } catch (error) {
    // Rethrow with a user-friendly message
    if (error instanceof Error) {
      throw new Error(`Failed to improve prompt: ${error.message}`);
    }
    throw new Error("Failed to improve prompt: Unknown error");
  }
}

export const promptImprovementService = { improve };
