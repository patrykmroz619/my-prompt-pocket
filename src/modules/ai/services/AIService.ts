import OpenAI from "openai";
import type { ITextCompletionParams } from "../types";

const openai = new OpenAI({
  baseURL: import.meta.env.OPENROUTER_BASE_URL,
  apiKey: import.meta.env.OPENROUTER_API_KEY,
});

const MODEL = "google/gemini-2.0-flash-001";

const textCompletion = async (params: ITextCompletionParams) => {
  const { messages } = params;

  try {
    const response = await openai.chat.completions.create({
      model: MODEL,
      messages,
      response_format: {
        type: "json_object",
      },
    });

    if (!response.choices || response.choices.length === 0) {
      throw new Error("No choices returned from OpenAI");
    }

    return response.choices[0]?.message.content ?? null;
  } catch (error) {
    console.error("Error in text completion:", error);
    throw new Error("Failed to generate text completion");
  }
};

export const AIService = {
  textCompletion,
};
