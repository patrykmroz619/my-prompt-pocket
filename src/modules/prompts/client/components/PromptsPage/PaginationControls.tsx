import React from "react";
import { Button } from "@shared/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationInfo } from "@shared/types/types";

interface PaginationControlsProps {
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({ pagination, onPageChange }) => {
  const { current_page, total_pages } = pagination;

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    // Always show first page
    pages.push(1);

    // If current page is far from start, add ellipsis
    if (current_page > 3) {
      pages.push("...");
    }

    // Add pages around current page
    for (let i = Math.max(2, current_page - 1); i <= Math.min(total_pages - 1, current_page + 1); i++) {
      if (i > 1 && i < total_pages) {
        pages.push(i);
      }
    }

    // If current page is far from end, add ellipsis
    if (current_page < total_pages - 2) {
      pages.push("...");
    }

    // Always show last page if there is more than one page
    if (total_pages > 1) {
      pages.push(total_pages);
    }

    return pages;
  };

  if (total_pages <= 1) {
    return null;
  }

  return (
    <div className="flex justify-center items-center space-x-2">
      {/* Previous button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(current_page - 1)}
        disabled={current_page === 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {/* Page numbers */}
      {getPageNumbers().map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={index}
            variant={page === current_page ? "default" : "outline"}
            size="sm"
            onClick={() => onPageChange(page)}
            aria-current={page === current_page ? "page" : undefined}
            aria-label={`Page ${page}`}
          >
            {page}
          </Button>
        ) : (
          <span key={index} className="px-2">
            {page}
          </span>
        )
      )}

      {/* Next button */}
      <Button
        variant="outline"
        size="icon"
        onClick={() => onPageChange(current_page + 1)}
        disabled={current_page === total_pages}
        aria-label="Next page"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};
