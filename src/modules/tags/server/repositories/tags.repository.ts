import { createSupabaseServerInstance } from "@shared/db/supabase.client";
import type { CreateTagCommand, IRequestContext, TagDto } from "../../../../shared/types/types";

// Check if a tag with the same name already exists for the user
async function checkTagExists(name: string, userId: string, context: IRequestContext): Promise<boolean> {
  const supabase = createSupabaseServerInstance(context);
  const { data, error } = await supabase.from("tags").select("id").eq("user_id", userId).ilike("name", name).limit(1);

  if (error) {
    throw new Error(`Error checking tag existence: ${error.message}`);
  }

  return data && data.length > 0;
}

// Insert a new tag into the database
async function insertTag(command: CreateTagCommand, userId: string, context: IRequestContext): Promise<TagDto> {
  const supabase = createSupabaseServerInstance(context);

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
    .from("tags")
    .select(
      `
      id,
      name,
      created_at,
      prompt_tags: prompts ( count )
    `
    )
    .order("name", { ascending: true });

  if (error) {
    console.error("Error fetching tags with prompt count:", error);
    throw new Error(`Error fetching tags: ${error.message}`);
  }

  // Map the data to TagDto[], ensuring prompt_tags is an array and getting the count
  const tags: TagDto[] =
    data?.map((tag) => ({
      id: tag.id,
      name: tag.name,
      created_at: tag.created_at,
      // Supabase returns the count within an array object when using foreign table joins like this
      prompt_count: Array.isArray(tag.prompt_tags) ? (tag.prompt_tags[0]?.count ?? 0) : 0,
    })) ?? [];

  return tags;
}

// Find a tag by ID and check if it belongs to the user
async function findTagByIdAndUserId(tagId: string, userId: string, context: IRequestContext): Promise<TagDto | null> {
  const supabase = createSupabaseServerInstance(context);

  const { data, error } = await supabase
    .from("tags")
    .select(
      `
      id,
      name,
      created_at,
      prompt_tags ( count )
    `
    )
    .eq("id", tagId)
    .eq("user_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found error code
      return null;
    }
    throw new Error(`Error finding tag: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    id: data.id,
    name: data.name,
    created_at: data.created_at,
    prompt_count: Array.isArray(data.prompt_tags) ? (data.prompt_tags[0]?.count ?? 0) : 0,
  };
}

// Check if a tag name exists for a user (excluding a specific tag ID)
async function checkTagNameExistsExcludingId(
  name: string,
  userId: string,
  excludeTagId: string,
  context: IRequestContext
): Promise<boolean> {
  const supabase = createSupabaseServerInstance(context);

  const { data, error } = await supabase
    .from("tags")
    .select("id")
    .eq("user_id", userId)
    .ilike("name", name)
    .neq("id", excludeTagId)
    .limit(1);

  if (error) {
    throw new Error(`Error checking tag name existence: ${error.message}`);
  }

  return data && data.length > 0;
}

// Update a tag name
async function updateTag(
  tagId: string,
  command: { name: string },
  userId: string,
  context: IRequestContext
): Promise<TagDto> {
  const supabase = createSupabaseServerInstance(context);

  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("tags")
    .update({
      name: command.name,
      updated_at: now,
    })
    .eq("id", tagId)
    .eq("user_id", userId)
    .select(
      `
      id,
      name,
      created_at,
      prompt_tags ( count )
    `
    )
    .single();

  if (error) {
    throw new Error(`Error updating tag: ${error.message}`);
  }

  if (!data) {
    throw new Error("Failed to retrieve the updated tag");
  }

  return {
    id: data.id,
    name: data.name,
    created_at: data.created_at,
    prompt_count: Array.isArray(data.prompt_tags) ? (data.prompt_tags[0]?.count ?? 0) : 0,
  };
}

// Delete a tag by ID and user, returns true if deleted, false if not found/owned
async function deleteTag(tagId: string, userId: string, context: IRequestContext): Promise<boolean> {
  const supabase = createSupabaseServerInstance(context);
  const { error, count } = await supabase.from("tags").delete({ count: "exact" }).match({ id: tagId, user_id: userId });

  if (error) {
    console.error("Error deleting tag:", error);
    throw new Error(`Failed to delete tag: ${error.message}`);
  }

  return (count ?? 0) === 1;
}

export const tagRepository = {
  checkTagExists,
  insertTag,
  findTagsByUserIdWithPromptCount,
  findTagByIdAndUserId,
  checkTagNameExistsExcludingId,
  updateTag,
  deleteTag,
};
