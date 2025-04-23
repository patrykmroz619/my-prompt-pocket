import type { Json } from "@shared/db/database.types";
import { createSupabaseServerInstance } from "@shared/db/supabase.client";
import type {
  PromptParameter,
  PromptDto,
  IRequestContext,
  TagDto,
} from "@shared/types/types";
import { PromptCreationError } from "../exceptions/prompt.exceptions";
import type { ValidatedPromptFilterParams } from "@modules/prompts/shared/schemas/prompt.schemas";

// Define a type for the structure returned by the query
interface PromptWithTagsDb extends Omit<PromptDto, 'tags' | 'parameters'> {
  parameters: PromptParameter;
  prompt_tags: {
    tag: TagDto;
  }[];
}

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

  findById: async (context: IRequestContext, promptId: string): Promise<PromptWithTagsDb | null> => {
    const supabase = createSupabaseServerInstance(context);

    // Query the database for a prompt with the given ID
    // Join with prompt_tags and tags to retrieve associated tag information
    const { data, error } = await supabase
      .from("prompts")
      .select(`
        *,
        prompt_tags(
          tag:tags(*)
        )
      `)
      .eq("id", promptId)
      .single();

    if (error) {
      // If the error is "not found", return null instead of throwing
      if (error.code === "PGRST116") {
        return null;
      }

      console.error("Error fetching prompt by ID:", error);
      throw new Error(`Failed to fetch prompt: ${error.message}`);
    }

    // Return the prompt with tags
    return data as unknown as PromptWithTagsDb;
  },

  findMany: async (
    context: IRequestContext,
    userId: string,
    filters: ValidatedPromptFilterParams,
  ): Promise<{ prompts: PromptWithTagsDb[]; totalCount: number }> => {
    const supabase = createSupabaseServerInstance(context);
    const { page, page_size, search, sort_by, sort_dir } = filters;
    const offset = (page - 1) * page_size;

    // Base query to select prompts and their tags
    let query = supabase
      .from("prompts")
      .select<string, any>( // Use 'any' temporarily for complex select
        `
        *,
        prompt_tags!inner(tag:tags!inner(*))
      `,
        { count: "exact" }, // Request total count matching filters
      )
      .eq("user_id", userId);

    // Apply search filter
    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    // Tag filtering is removed here - will be handled in the service layer

    // Apply sorting
    query = query.order(sort_by, { ascending: sort_dir === "asc" });

    // Apply pagination
    query = query.range(offset, offset + page_size - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching prompts:", error);
      // Consider throwing a specific repository error
      throw new Error(`Failed to fetch prompts: ${error.message}`);
    }

    // Cast the data to the expected type
    const prompts = (data || []) as PromptWithTagsDb[];

    // The count returned by Supabase with { count: 'exact' } is the total count matching filters
    const totalCount = count ?? 0;

    // TODO: Refine tag filtering logic if strict 'all tags' is needed and the current approach is insufficient.
    // This might involve fetching prompts and then filtering in the service layer or using a DB function.

    return { prompts, totalCount };
  },

  updatePrompt: async (
    context: IRequestContext,
    promptId: string,
    userId: string,
    data: {
      name: string;
      description: string | null;
      content: string;
      parameters: PromptParameter[];
    }
  ): Promise<PromptDto> => {
    const supabase = createSupabaseServerInstance(context);

    // Check if prompt exists and belongs to the user
    const { data: existingPrompt, error: checkError } = await supabase
      .from("prompts")
      .select("id")
      .eq("id", promptId)
      .eq("user_id", userId)
      .single();

    if (checkError || !existingPrompt) {
      if (checkError?.code === "PGRST116") {
        throw new Error("Prompt not found");
      }
      throw new Error(`Failed to check prompt: ${checkError?.message || "Unknown error"}`);
    }

    // Update the prompt
    const { data: updatedPrompt, error: updateError } = await supabase
      .from("prompts")
      .update({
        name: data.name,
        description: data.description,
        content: data.content,
        parameters: data.parameters as unknown as Json,
        updated_at: new Date().toISOString(),
      })
      .eq("id", promptId)
      .select<"*", PromptDto>()
      .single();

    if (updateError) {
      if (updateError.code === "23505") { // Unique constraint violation
        throw new Error("A prompt with this name already exists for your account");
      }
      throw new Error(`Failed to update prompt: ${updateError.message}`);
    }

    if (!updatedPrompt) {
      throw new Error("Failed to update prompt");
    }

    return updatedPrompt;
  },

  updatePromptTags: async (
    context: IRequestContext,
    promptId: string,
    tagIds: string[]
  ) => {
    const supabase = createSupabaseServerInstance(context);

    // Delete all existing prompt-tag associations
    const { error: deleteError } = await supabase
      .from("prompt_tags")
      .delete()
      .eq("prompt_id", promptId);

    if (deleteError) {
      throw new Error(`Failed to update prompt tags: ${deleteError.message}`);
    }

    // Skip creating new associations if no tags are provided
    if (!tagIds.length) {
      return;
    }

    // Create new prompt-tag associations
    const promptTags = tagIds.map(tagId => ({
      prompt_id: promptId,
      tag_id: tagId,
    }));

    const { error: insertError } = await supabase
      .from("prompt_tags")
      .insert(promptTags);

    if (insertError) {
      throw new Error(`Failed to associate prompt with tags: ${insertError.message}`);
    }
  },
};
