import { createSupabaseServerInstance } from "@shared/db/supabase.client";
import type { CreateTagCommand, IRequestContext, TagDto } from "../../../../shared/types/types";

// Check if a tag with the same name already exists for the user
async function checkTagExists(name: string, userId: string, context: IRequestContext): Promise<boolean> {
  const supabase = createSupabaseServerInstance(context)
  const { data, error } = await supabase
    .from("tags")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", name)
    .limit(1);

  if (error) {
    throw new Error(`Error checking tag existence: ${error.message}`);
  }

  return data && data.length > 0;
}

// Insert a new tag into the database
async function insertTag(command: CreateTagCommand, userId: string, context: IRequestContext): Promise<TagDto> {
  const supabase = createSupabaseServerInstance(context)

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("tags")
    .insert({
      name: command.name,
      user_id: userId,
      created_at: now,
    })
    .select("id, name, created_at")
    .single();

  if (error) {
    throw new Error(`Error creating tag: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to retrieve the created tag");
  }

  // Format the response as a TagDto
  return {
    id: data.id,
    name: data.name,
    prompt_count: 0, // New tag has no prompts associated
    created_at: data.created_at,
  };
}

// Find all tags for a user with the count of associated prompts
async function findTagsByUserIdWithPromptCount(userId: string, context: IRequestContext): Promise<TagDto[]> {
  const supabase = createSupabaseServerInstance(context);

  const { data, error } = await supabase
    .from('tags')
    .select(`
      id,
      name,
      created_at,
      prompt_tags ( count )
    `)
    .eq('user_id', userId)
    .order('name', { ascending: true });

  if (error) {
    console.error("Error fetching tags with prompt count:", error);
    throw new Error(`Error fetching tags: ${error.message}`);
  }

  // Map the data to TagDto[], ensuring prompt_tags is an array and getting the count
  const tags: TagDto[] = data?.map(tag => ({
    id: tag.id,
    name: tag.name,
    created_at: tag.created_at,
    // Supabase returns the count within an array object when using foreign table joins like this
    prompt_count: Array.isArray(tag.prompt_tags) ? tag.prompt_tags[0]?.count ?? 0 : 0,
  })) ?? [];

  return tags;
}

export const tagRepository = {
  checkTagExists,
  insertTag,
  findTagsByUserIdWithPromptCount // Add the new method here
};
