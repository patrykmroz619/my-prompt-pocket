import React from "react";
import { FileSearch, Tag, Search, RefreshCw } from "lucide-react";
import { Button } from "@shared/components/ui/button";
import { Card, CardContent } from "@shared/components/ui/card";

interface EmptyStateProps {
  type: "no-prompts" | "no-results" | "error";
  searchTerm?: string;
  selectedTags?: string[];
  onReset?: () => void;
  onRetry?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ type, searchTerm, selectedTags, onReset, onRetry }) => {
  const renderContent = () => {
    switch (type) {
      case "no-prompts":
        return (
          <>
            <FileSearch className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No prompts yet</h3>
            <p className="text-muted-foreground text-center mb-4">
              You haven't created any prompts yet. Create your first prompt to get started.
            </p>
            <Button onClick={() => (window.location.href = "/prompts/create")}>Create your first prompt</Button>
          </>
        );

      case "no-results":
        return (
          <>
            <Search className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">No matching prompts</h3>
            <p className="text-muted-foreground text-center mb-4">
              {searchTerm && selectedTags && selectedTags.length > 0 ? (
                <>
                  No prompts match your search term <strong>"{searchTerm}"</strong> and selected tags.
                </>
              ) : searchTerm ? (
                <>
                  No prompts match your search term <strong>"{searchTerm}"</strong>.
                </>
              ) : selectedTags && selectedTags.length > 0 ? (
                <>No prompts match your selected tags.</>
              ) : (
                <>No prompts found with the current filters.</>
              )}
            </p>
            <Button variant="outline" onClick={onReset}>
              Clear all filters
            </Button>
          </>
        );

      case "error":
        return (
          <>
            <RefreshCw className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-medium mb-2">Something went wrong</h3>
            <p className="text-muted-foreground text-center mb-4">
              We encountered an error while loading your prompts.
            </p>
            <Button onClick={onRetry}>Try again</Button>
          </>
        );
    }
  };

  return (
    <Card className="w-full bg-muted/20 border border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-12">{renderContent()}</CardContent>
    </Card>
  );
};
