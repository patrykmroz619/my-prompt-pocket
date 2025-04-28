import { useState, useCallback, useEffect } from "react";
import type { PromptImprovementCommand } from "../../../../shared/types/types";
import { promptService } from "../services/prompts.service";

// Hook state types
export type AIImprovementStatus = "idle" | "loading" | "success" | "error";

export interface AIImprovementState {
  status: AIImprovementStatus;
  originalContent: string | null;
  improvedContent: string | null;
  explanation: string | null;
  errorMessage: string | null;
}

interface UseAIImprovementProps {
  initialContent: string;
  isOpen: boolean;
}

export const useAIImprovement = ({ initialContent, isOpen }: UseAIImprovementProps) => {
  const [state, setState] = useState<AIImprovementState>({
    status: "idle",
    originalContent: null,
    improvedContent: null,
    explanation: null,
    errorMessage: null,
  });

  const resetState = useCallback(() => {
    setState({
      status: "idle",
      originalContent: null,
      improvedContent: null,
      explanation: null,
      errorMessage: null,
    });
  }, []);

  const improvePrompt = useCallback(async (content: string) => {
    // Validate content
    if (!content || content.trim().length === 0) {
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: "Prompt content cannot be empty.",
      }));
      return;
    }

    // Update state to loading
    setState((prev) => ({
      ...prev,
      status: "loading",
      originalContent: content,
      errorMessage: null,
    }));

    try {
      // Prepare request payload
      const command: PromptImprovementCommand = {
        content,
      };

      // Use the service method for the API call
      const result = await promptService.improvePrompt(command);

      setState((prev) => ({
        ...prev,
        status: "success",
        improvedContent: result.improved_content,
        explanation: result.explanation,
      }));
    } catch (error) {
      // Handle network or other errors
      setState((prev) => ({
        ...prev,
        status: "error",
        errorMessage: error instanceof Error ? error.message : "Network error. Please check your connection.",
      }));
    }
  }, []);

  // Auto-trigger improvement when modal opens with content
  useEffect(() => {
    if (isOpen && initialContent && initialContent.trim().length > 0) {
      improvePrompt(initialContent);
    } else if (!isOpen) {
      resetState();
    }
  }, [isOpen, initialContent, improvePrompt, resetState]);

  return {
    state,
    improvePrompt,
    resetState,
  };
};
