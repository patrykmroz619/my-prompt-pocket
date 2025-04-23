import { useEffect, useState } from "react";
import type { PaginatedResponse, PromptDto } from "@shared/types/types";
import { useDebounce } from "./useDebounce";

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Debounce search to reduce API calls
  const debouncedSearch = useDebounce(search, 300);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Build the query string with search, tags, and pagination
        const queryParams = new URLSearchParams();
        if (debouncedSearch) queryParams.set("search", debouncedSearch);
        if (selectedTagIds.length > 0) queryParams.set("tags", selectedTagIds.join(","));
        queryParams.set("page", page.toString());

        const response = await fetch(`/api/prompts?${queryParams.toString()}`, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch prompts");
        }

        const newData = await response.json();
        setData(newData);
      } catch (err) {
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      } finally {
        setLoading(false);
      }
    };

    // Skip the initial fetch if we have initial data and this is the first render
    if (!options.initialData || debouncedSearch || selectedTagIds.length > 0 || page > 1) {
      fetchData();
    }
  }, [debouncedSearch, selectedTagIds, page, options.initialData]);

  return { data, loading, error, refetch: () => setData({ ...data }) };
}
