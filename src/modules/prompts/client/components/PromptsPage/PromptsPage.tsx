import React, { useCallback } from "react";
import { usePromptsData } from "../../hooks/usePromptsData";
import { useQueryParams } from "../../hooks/useQueryParams";
import type { PaginatedResponse, PromptDto } from "@shared/types/types";
import { Button } from "@shared/components/ui/button";
import { Card } from "@shared/components/ui/card";
import { Skeleton } from "@shared/components/ui/skeleton";
import { PlusIcon } from "lucide-react";

import { SearchBar } from "./SearchBar";
import { TagFilter } from "./TagFilter";
import { PromptGrid } from "./PromptGrid";
import { PaginationControls } from "./PaginationControls";
import { EmptyState } from "./EmptyState";

interface PromptsPageProps {
  initialData: PaginatedResponse<PromptDto>;
}

const PromptsPage: React.FC<PromptsPageProps> = ({ initialData }) => {
  // Use query params for state management instead of useState
  const { params, setParam, resetParams } = useQueryParams({
    search: "",
    tags: [] as string[],
    page: "1",
  });

  // Extract values from params
  const search = params.search;
  const selectedTagIds = params.tags as string[];
  const page = parseInt(params.page as string, 10);

  // Custom hook for data fetching
  const { data, loading, error, refetch } = usePromptsData(search as string, selectedTagIds, page, { initialData });

  // Check if this is the initial state with no filters
  const isInitialState = !search && selectedTagIds.length === 0 && page === 1;
  const isInitialLoad = isInitialState && data.data.length === 0;

  // Event handlers
  const handleSearchChange = (value: string) => {
    setParam("search", value);
    setParam("page", "1"); // Reset page when search changes
  };

  const handleTagFilterChange = (value: string[]) => {
    setParam("tags", value);
    setParam("page", "1"); // Reset page when tags change
  };

  const handlePageChange = (newPage: number) => {
    setParam("page", newPage.toString());
  };

  // Reset all filters and force a data refetch
  const handleResetFilters = useCallback(() => {
    resetParams();
    // Call refetch after a short delay to ensure state updates have been processed
    setTimeout(() => {
      refetch();
    }, 0);
  }, [resetParams, refetch]);

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">My Prompts</h1>
        <Button className="flex items-center gap-2" onClick={() => (window.location.href = "/prompts/create")}>
          <PlusIcon size={16} />
          <span>Create Prompt</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <SearchBar value={search as string} onChange={handleSearchChange} />
        </div>
        <div className="w-full md:w-64">
          <TagFilter value={selectedTagIds} onChange={handleTagFilterChange} />
        </div>
      </div>

      {error ? (
        <EmptyState type="error" onRetry={refetch} />
      ) : loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="p-4">
                <Skeleton className="h-8 w-3/4 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4 mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </Card>
            ))}
        </div>
      ) : (
        <>
          <PromptGrid
            prompts={data.data}
            searchTerm={search as string}
            selectedTagIds={selectedTagIds}
            onResetFilters={handleResetFilters}
            isInitialLoad={isInitialLoad}
          />

          {data.pagination.total_pages > 1 && (
            <div className="mt-6">
              <PaginationControls pagination={data.pagination} onPageChange={handlePageChange} />
            </div>
          )}
        </>
      )}
    </>
  );
};

export default PromptsPage;
