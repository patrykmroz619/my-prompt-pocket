import type { PromptDto, PromptParameter, TagDto } from "../../../../shared/types/types";

/**
 * View model for the prompt detail view
 * Based on PromptDto but omits user_id as it's not needed in the UI
 */
export interface PromptDetailViewModel {
  id: string;
  name: string;
  description: string | null;
  content: string;
  parameters: PromptParameter[];
  tags: TagDto[];
  created_at: string;
  updated_at: string;
}

/**
 * Helper function to convert PromptDto to PromptDetailViewModel
 */
export function toPromptDetailViewModel(dto: PromptDto): PromptDetailViewModel {
  const { user_id, ...viewModel } = dto;
  return viewModel;
}
