import React from "react";
import type { PromptDto } from "@shared/types/types";
import { PromptCard } from "./PromptCard";
import { EmptyState } from "./EmptyState";

interface PromptGridProps {
  prompts: PromptDto[];
  searchTerm?: string;
  selectedTagIds?: string[];
  onResetFilters?: () => void;
  isInitialLoad?: boolean;
}

export const PromptGrid: React.FC<PromptGridProps> = ({
  prompts,
  searchTerm,
  selectedTagIds,
  onResetFilters = () => null,
  isInitialLoad = false,
}) => {
  if (prompts.length === 0) {
    if (isInitialLoad) {
      return <EmptyState type="no-prompts" />;
    }

    return (
      <EmptyState
        type="no-results"
        searchTerm={searchTerm ?? ""}
        selectedTags={selectedTagIds ?? []}
        onReset={onResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {prompts.map((prompt) => (
        <PromptCard key={prompt.id} prompt={prompt} />
      ))}
    </div>
  );
};
