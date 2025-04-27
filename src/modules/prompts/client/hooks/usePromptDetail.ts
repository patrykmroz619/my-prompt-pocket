import { useState, useEffect } from "react";

import type { PromptDto } from "../../../../shared/types/types";

interface UsePromptDetailResult {
  prompt: PromptDto | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch prompt details from the API
 */
export function usePromptDetail(promptId: string): UsePromptDetailResult {
  const [prompt, setPrompt] = useState<PromptDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchPromptDetail() {
      if (!promptId) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/prompts/${promptId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch prompt: ${response.statusText}`);
        }

        const data: PromptDto = await response.json();
        setPrompt(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      } finally {
        setIsLoading(false);
      }
    }

    fetchPromptDetail();
  }, [promptId]);

  return { prompt, isLoading, error };
}
