import OpenAI from "openai";
import type { ITextCompletionParams } from "../types";
import { getEnv } from "@shared/utils/getEnv";

const openai = new OpenAI({
  baseURL: getEnv("OPENROUTER_BASE_URL"),
  apiKey: getEnv("OPENROUTER_API_KEY"),
});

const textCompletion = async (params: ITextCompletionParams) => {
  const { messages, model } = params;

  try {
    const response = await openai.chat.completions.create({
      model,
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
