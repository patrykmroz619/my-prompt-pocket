import type { AstroCookies } from "astro";

export interface IUser {
  id: string;
  email: string | undefined;
}

export interface IRequestContext {
  headers: Headers;
  cookies: AstroCookies;
}

/**
 * Base types for parameter handling
 */
export type PromptParameterType = "short-text" | "long-text";

export interface PromptParameter {
  name: string;
  type: PromptParameterType;
}

/**
 * Tag DTOs
 */
export interface TagDto {
  id: string;
  name: string;
  prompt_count?: number; // Optional as it's only included in GET /api/tags
  created_at: string;
}

export interface CreateTagCommand {
  name: string;
}

export interface UpdateTagCommand {
  name: string;
}

/**
 * Prompt DTOs
 */
export interface PromptDto {
  id: string;
  name: string;
  description: string | null;
  content: string;
  parameters: PromptParameter[];
  user_id: string;
  created_at: string;
  updated_at: string;
  tags: TagDto[];
}

export interface CreatePromptCommand {
  name: string;
  description?: string | null;
  content: string;
  parameters?: PromptParameter[]; // Parameter definitions
  tags?: string[]; // Array of tag IDs
}

export interface UpdatePromptCommand {
  name: string;
  description?: string | null;
  content: string;
  parameters?: PromptParameter[]; // Parameter definitions
  tags?: string[]; // Array of tag IDs
}

/**
 * Prompt Tags DTOs
 */
export interface PromptTagDto {
  prompt_id: string;
  tag_id: string;
  prompt_name: string;
  tag_name: string;
}

export interface AssignPromptToTagCommand {
  prompt_id: string;
  tag_id: string;
}

/**
 * Pagination types
 */
export interface PaginationParams {
  page?: number;
  page_size?: number;
  sort_by?: "name" | "created_at" | "updated_at";
  sort_dir?: "asc" | "desc";
}

export interface PaginationInfo {
  total_items: number;
  total_pages: number;
  current_page: number;
  page_size: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationInfo;
}

/**
 * Filter and search types
 */
export interface PromptFilterParams extends PaginationParams {
  search?: string | undefined;
  tags?: string | undefined; // Comma-separated string of tag IDs
}

/**
 * AI-related DTOs
 */
export interface PromptImprovementCommand {
  content: string;
  instruction?: string;
}

export interface PromptImprovementDto {
  improved_content: string;
  explanation: string;
}
