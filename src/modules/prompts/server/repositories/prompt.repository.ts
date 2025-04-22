import type { Json } from "@shared/db/database.types";
import { createSupabaseServerInstance } from "@shared/db/supabase.client";
import type { PromptParameter, PromptDto, IRequestContext } from "@shared/types/types";
import { PromptCreationError } from "../exceptions/prompt.exceptions";

export const promptRepository = {
  createPrompt: async (
    context: IRequestContext,
    data: {
      name: string;
      description: string | null;
      content: string;
      parameters: PromptParameter[];
      userId: string;
    }
  ) => {
    const supabase = createSupabaseServerInstance(context);
    const { data: prompt, error } = await supabase
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

  associateWithTags: async (context: IRequestContext, promptId: string, tagIds: string[]) => {
    const supabase = createSupabaseServerInstance(context);
    const promptTags = tagIds.map(tagId => ({
      prompt_id: promptId,
      tag_id: tagId,
    }));

    const { error: tagError } = await supabase
      .from("prompt_tags")
      .insert(promptTags);

    if (tagError) {
      throw new PromptCreationError(tagError.message);
    }
  },

  deletePrompt: async (context: IRequestContext, promptId: string) => {
    const supabase = createSupabaseServerInstance(context);
    const { error } = await supabase
      .from("prompts")
      .delete()
      .eq("id", promptId);

    if (error) {
      throw new PromptCreationError(error.message);
    }
  },

  getPromptWithTags: async (context: IRequestContext, promptId: string) => {
    const supabase = createSupabaseServerInstance(context);
    const { data: promptWithTags, error: fetchError } = await supabase
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
