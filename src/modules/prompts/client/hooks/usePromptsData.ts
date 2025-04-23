import { useEffect, useRef, useState } from "react";
import type { PaginatedResponse, PromptDto } from "@shared/types/types";
import { useDebounce } from "@shared/hooks/useDebounce";
import { promptService } from "../services/prompts.service";

interface UsePromptsDataOptions {
  initialData?: PaginatedResponse<PromptDto>;
}

export function usePromptsData(
  search: string,
  selectedTagIds: string[],
  page: number,
  options: UsePromptsDataOptions = {}
) {
  const [data, setData] = useState<PaginatedResponse<PromptDto>>(
    options.initialData || {
      data: [],
      pagination: {
        total_items: 0,
        total_pages: 1,
        current_page: 1,
        page_size: 10,
      },
    }
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 300);

  // Function to fetch data with current parameters
  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Use the service method instead of direct fetch
      const tagsParam = selectedTagIds.length > 0 ? selectedTagIds.join(",") : undefined;

      const newData = await promptService.getPromptsList({
        search: debouncedSearch || undefined,
        tags: tagsParam,
        page: page,
      });

      setData(newData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    } finally {
      setLoading(false);
    }
  };

  const firstRenderRef = useRef(true);

  useEffect(() => {
    if (!options.initialData || firstRenderRef.current === false) {
      fetchData();
    }
    firstRenderRef.current = false;
  }, [debouncedSearch, selectedTagIds, page, options.initialData]);

  return {
    data,
    loading: loading && data.data.length === 0,
    error,
    refetch: () => {
      fetchData()
    }
  };
}
