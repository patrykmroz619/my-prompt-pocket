import { createSupabaseServerInstance } from "@shared/db/supabase.client";
import type { IRequestContext, PromptTagDto } from "@shared/types/types";
import {
  AssociationNotFoundError,
  DuplicateAssociationError,
  PromptNotFoundError,
  TagNotFoundError,
  UnauthorizedAssociationError,
} from "../exceptions/prompt-tag.exceptions";

export const promptTagRepository = {
  assignTagToPrompt: async (context: IRequestContext, promptId: string, tagId: string): Promise<PromptTagDto> => {
    const supabase = createSupabaseServerInstance(context);

    // Check if prompt exists and belongs to the user
    const { data: prompt, error: promptError } = await supabase
      .from("prompts")
      .select("id, name, user_id")
      .eq("id", promptId)
      .single();

    if (promptError) {
      if (promptError.code === "PGRST116") {
        throw new PromptNotFoundError(promptId);
      }
      throw new Error(`Failed to check prompt: ${promptError.message}`);
    }

    // Check if tag exists and belongs to the user
    const { data: tag, error: tagError } = await supabase
      .from("tags")
      .select("id, name, user_id")
      .eq("id", tagId)
      .single();

    if (tagError) {
      if (tagError.code === "PGRST116") {
        throw new TagNotFoundError(tagId);
      }
      throw new Error(`Failed to check tag: ${tagError.message}`);
    }

    // Verify both prompt and tag belong to the same user
    if (prompt.user_id !== tag.user_id) {
      throw new UnauthorizedAssociationError();
    }

    // Check if association already exists
    const { data: existingAssociation } = await supabase
      .from("prompt_tags")
      .select("*")
      .eq("prompt_id", promptId)
      .eq("tag_id", tagId)
      .single();

    if (existingAssociation) {
      throw new DuplicateAssociationError(promptId, tagId);
    }

    // Only proceed if there's no existing association
    const { error: insertError } = await supabase
      .from("prompt_tags")
      .insert({
        prompt_id: promptId,
        tag_id: tagId,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to associate prompt with tag: ${insertError.message}`);
    }

    // Return the association with names
    return {
      prompt_id: promptId,
      tag_id: tagId,
      prompt_name: prompt.name,
      tag_name: tag.name,
    };
  },

  deleteTagFromPrompt: async (context: IRequestContext, promptId: string, tagId: string): Promise<void> => {
    const supabase = createSupabaseServerInstance(context);

    // Check if prompt exists and belongs to the user
    const { data: prompt, error: promptError } = await supabase
      .from("prompts")
      .select("id, user_id")
      .eq("id", promptId)
      .single();

    if (promptError) {
      if (promptError.code === "PGRST116") {
        throw new PromptNotFoundError(promptId);
      }
      throw new Error(`Failed to check prompt: ${promptError.message}`);
    }

    // Check if tag exists
    const { data: tag, error: tagError } = await supabase.from("tags").select("id, user_id").eq("id", tagId).single();

    if (tagError) {
      if (tagError.code === "PGRST116") {
        throw new TagNotFoundError(tagId);
      }
      throw new Error(`Failed to check tag: ${tagError.message}`);
    }

    // Verify both prompt and tag belong to the same user
    if (prompt.user_id !== tag.user_id) {
      throw new UnauthorizedAssociationError();
    }

    // Check if association exists
    const { data: existingAssociation } = await supabase
      .from("prompt_tags")
      .select("*")
      .eq("prompt_id", promptId)
      .eq("tag_id", tagId)
      .single();

    if (!existingAssociation) {
      throw new AssociationNotFoundError(promptId, tagId);
    }

    // Delete the association
    const { error: deleteError } = await supabase
      .from("prompt_tags")
      .delete()
      .eq("prompt_id", promptId)
      .eq("tag_id", tagId);

    if (deleteError) {
      throw new Error(`Failed to remove tag from prompt: ${deleteError.message}`);
    }
  },
};
