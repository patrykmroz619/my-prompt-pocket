import type { Json } from "@shared/db/database.types";
import { supabaseClient } from "@shared/db/supabase.client";
import type { PromptParameter, PromptDto } from "@shared/types/types";
import { PromptCreationError } from "../exceptions/prompt.exceptions";

export const promptRepository = {
  createPrompt: async (data: {
    name: string;
    description: string | null;
    content: string;
    parameters: PromptParameter[];
    userId: string;
  }) => {
    const { data: prompt, error } = await supabaseClient
      .from("prompts")
      .insert({
        name: data.name,
        description: data.description,
        content: data.content,
        parameters: data.parameters as unknown as Json,
        user_id: data.userId,
      })
      .select<"*", PromptDto>()
      .single();

    if (error) {
      if (error.code === "23505") { // Unique constraint violation
        throw new Error("Prompt with this name already exists");
      }
      throw new PromptCreationError(error.message);
    }

    if (!prompt) {
      throw new PromptCreationError("Failed to create prompt");
    }

    return prompt;
  },

  associateWithTags: async (promptId: string, tagIds: string[]) => {
    const promptTags = tagIds.map(tagId => ({
      prompt_id: promptId,
      tag_id: tagId,
    }));

    const { error: tagError } = await supabaseClient
      .from("prompt_tags")
      .insert(promptTags);

    if (tagError) {
      throw new PromptCreationError(tagError.message);
    }
  },

  deletePrompt: async (promptId: string) => {
    const { error } = await supabaseClient
      .from("prompts")
      .delete()
      .eq("id", promptId);

    if (error) {
      throw new PromptCreationError(error.message);
    }
  },

  getPromptWithTags: async (promptId: string) => {
    const { data: promptWithTags, error: fetchError } = await supabaseClient
      .from("prompts")
      .select(`
        *,
        tags:prompt_tags (
          tag:tags (*)
        )
      `)
      .eq("id", promptId)
      .single();

    if (fetchError) {
      throw new PromptCreationError(fetchError.message);
    }

    if (!promptWithTags) {
      throw new PromptCreationError("Failed to fetch created prompt");
    }

    return promptWithTags;
  },
};
