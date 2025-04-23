import { useEffect, useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@shared/components/ui/command";
import { Badge } from "@shared/components/ui/badge";
import { Button } from "@shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import { cn } from "@shared/utils/cn";
import type { TagDto } from "@shared/types/types";
import { tagService } from "../../services/tags.service";

interface TagFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

export const TagFilter = ({ value = [], onChange }: TagFilterProps) => {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      setLoading(true);
      setError(null);

      try {
        // Use the tag service instead of direct fetch
        const data = await tagService.getAllTags();
        setTags(data);

        // Set selected tags based on prop values
        if (value.length > 0) {
          const selected = data.filter((tag: TagDto) => value.includes(tag.id));
          setSelectedTags(selected);
        }
      } catch (error) {
        setError(error instanceof Error ? error : new Error("Failed to load tags"));
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, [value]);

  // Handle tag selection/deselection
  const toggleTag = (tag: TagDto) => {
    if (value.includes(tag.id)) {
      // Remove tag
      const newValues = value.filter((id) => id !== tag.id);
      onChange(newValues);
      setSelectedTags((prev) => prev.filter((t) => t.id !== tag.id));
    } else {
      // Add tag
      const newValues = [...value, tag.id];
      onChange(newValues);
      setSelectedTags((prev) => [...prev, tag]);
    }
  };

  // Remove a selected tag
  const removeTag = (tagId: string) => {
    const newValues = value.filter((id) => id !== tagId);
    onChange(newValues);
    setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
  };

  // Clear all selected tags
  const clearTags = () => {
    onChange([]);
    setSelectedTags([]);
  };

  return (
    <div className="flex flex-col space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="justify-between" disabled={loading}>
            {loading ? (
              <span>Loading tags...</span>
            ) : (
              <span className="truncate">
                {value.length > 0 ? `${value.length} tag${value.length > 1 ? "s" : ""} selected` : "Filter by tag"}
              </span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput placeholder="Search tags..." />
            <CommandEmpty>{error ? "Error loading tags. Try again." : "No tags found."}</CommandEmpty>
            <CommandGroup>
              {tags.map((tag) => (
                <CommandItem key={tag.id} value={tag.name} onSelect={() => toggleTag(tag)}>
                  <Check className={cn("mr-2 h-4 w-4", value.includes(tag.id) ? "opacity-100" : "opacity-0")} />
                  {tag.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selectedTags.map((tag) => (
            <Badge key={tag.id} variant="secondary" className="flex items-center gap-1">
              {tag.name}
              <button
                onClick={() => removeTag(tag.id)}
                className="rounded-full text-muted-foreground hover:text-foreground"
                aria-label={`Remove ${tag.name} tag`}
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {selectedTags.length > 1 && (
            <Button variant="ghost" size="sm" onClick={clearTags} className="h-6 text-xs">
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
