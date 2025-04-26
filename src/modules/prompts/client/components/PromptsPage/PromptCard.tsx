import React from "react";
import { Pencil } from "lucide-react";

import { Badge } from "@shared/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@shared/components/ui/card";
import { Button } from "@shared/components/ui/button";
import type { PromptDto } from "@shared/types/types";

interface PromptCardProps {
  prompt: PromptDto;
  onClick?: (promptId: string) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({ prompt, onClick }) => {
  // Format the creation date
  const formattedDate = (() => {
    const now = new Date();
    const created = new Date(prompt.created_at);
    const diff = now.getTime() - created.getTime();

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} ${years === 1 ? "year" : "years"} ago`;
    if (months > 0) return `${months} ${months === 1 ? "month" : "months"} ago`;
    if (days > 0) return `${days} ${days === 1 ? "day" : "days"} ago`;
    if (hours > 0) return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    if (minutes > 0) return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    return "just now";
  })();

  // Handle navigation to prompt detail
  const handleClick = () => {
    if (onClick) {
      onClick(prompt.id);
    } else {
      window.location.href = `/prompts/${prompt.id}`;
    }
  };

  // Handle navigation to edit page
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent the card click event
    window.location.href = `/prompts/edit/${prompt.id}`;
  };

  return (
    <Card
      className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer relative"
      onClick={handleClick}
      tabIndex={0}
      role="button"
      aria-label={`View ${prompt.name} prompt details`}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <CardHeader className="pb-2 flex flex-row justify-between items-start">
        <div>
          <CardTitle className="text-xl line-clamp-1">{prompt.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{formattedDate}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={handleEditClick}
          aria-label={`Edit ${prompt.name}`}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      </CardHeader>

      <CardContent className="flex-grow">
        <p className="line-clamp-4 text-sm">{prompt.description || "No description provided."}</p>
      </CardContent>

      <CardFooter className="pt-2 flex flex-wrap gap-2">
        {prompt.tags.length > 0 ? (
          prompt.tags?.map((tag) => (
            <Badge key={tag.id} variant="outline" className="text-xs">
              {tag.name}
            </Badge>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">No tags</span>
        )}
      </CardFooter>
    </Card>
  );
};
