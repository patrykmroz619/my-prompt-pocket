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

export const tagRepository = {
  checkTagExists,
  insertTag
};
