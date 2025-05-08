import { z } from "zod"; // Import Zod
import type { PromptImprovementDto } from "@shared/types/types";
import { AIService } from "@modules/ai/services/AIService";
import { getEnv } from "@shared/utils/getEnv";

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

async function improve({ content, instruction }: ImprovePromptParams): Promise<PromptImprovementDto> {
  const systemMessage = `Act as an expert prompt engineer specializing in refining prompts for Large Language Models (LLMs).
Your goal is to analyze the user-provided prompt and rewrite it to be clearer, more specific, and more effective.

Focus on:
1.  **Clarity:** Eliminate ambiguity and jargon.
2.  **Specificity:** Add necessary details and context.
3.  **Structure:** Improve the organization for better LLM understanding.
4.  **Effectiveness:** Ensure the prompt directly asks for the desired outcome.
5.  **User Intent:** Consider the user's instructions and tailor the prompt accordingly.

User instruction:
${instruction ? instruction : "No specific instructions provided."}

Response MUST BE a valid JSON object with the following structure without any additional text or characters:
{
  "_thoughts": "[Your brief thought process for the improvements made]",
  "improved_content": "[Your rewritten, improved version of the prompt]",
  "explanation": "[A brief explanation of the key changes you made and why they improve the prompt, referencing the focus areas above.]"
}

Maintain a professional and analytical tone. Do not include any conversational filler or introductory/concluding remarks outside the specified JSON structure.`;

  const userMessage = content;

  try {
    // Send the request to OpenRouter
    const aiMessage = await AIService.textCompletion({
      model: getEnv("PROMPTS_IMPROVEMENT_MODEL"),
      messages: [
        { role: "system", content: systemMessage },
        { role: "user", content: userMessage },
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
