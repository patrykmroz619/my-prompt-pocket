import React, { useState } from "react";
import type { PromptDto } from "@shared/types/types";
import { PromptCard } from "./PromptCard";
import { EmptyState } from "./EmptyState";
import { PromptDetailModal } from "../../components/PromptDetail";
import { promptService } from "../../services/prompts.service";
import { toast } from "sonner";

interface PromptGridProps {
  prompts: PromptDto[];
  searchTerm?: string;
  selectedTagIds?: string[];
  onResetFilters?: () => void;
  isInitialLoad?: boolean;
  onPromptDeleted?: () => void;
}

export const PromptGrid: React.FC<PromptGridProps> = ({
  prompts,
  searchTerm,
  selectedTagIds,
  onResetFilters = () => null,
  isInitialLoad = false,
  onPromptDeleted,
}) => {
  const [selectedPromptId, setSelectedPromptId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handlePromptSelect = (promptId: string) => {
    setSelectedPromptId(promptId);
  };

  const handleCloseModal = () => {
    setSelectedPromptId(null);
  };

  const handleEditPrompt = (promptId: string) => {
    // Navigate to edit page
    window.location.href = `/prompts/edit/${promptId}`;
  };

  const handleDeletePrompt = async (promptId: string) => {
    try {
      setIsDeleting(true);
      await promptService.deletePrompt(promptId);

      toast.success("Prompt deleted successfully");

      // Refresh prompt list
      if (onPromptDeleted) {
        onPromptDeleted();
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to delete prompt");
    } finally {
      setIsDeleting(false);
      setSelectedPromptId(null);
    }
  };

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
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((prompt) => (
          <PromptCard key={prompt.id} prompt={prompt} onClick={() => handlePromptSelect(prompt.id)} />
        ))}
      </div>

      {selectedPromptId && (
        <PromptDetailModal
          promptId={selectedPromptId}
          onClose={handleCloseModal}
          onEdit={handleEditPrompt}
          onDelete={handleDeletePrompt}
          isDeleting={isDeleting}
        />
      )}
    </>
  );
};
