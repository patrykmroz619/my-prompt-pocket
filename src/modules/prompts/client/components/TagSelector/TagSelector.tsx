import { useCallback, useEffect, useState } from "react";
import type { TagDto } from "@shared/types/types";
import { Check, ChevronsUpDown, Plus, X, Tag as TagIcon } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@shared/components/ui/command";
import { Button } from "@shared/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@shared/components/ui/popover";
import { Badge } from "@shared/components/ui/badge";
import { cn } from "@shared/utils/cn";
import { tagService } from "../../services/tags.service";

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [open, setOpen] = useState(false);
  const [tags, setTags] = useState<TagDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagDto[]>([]);
  const [search, setSearch] = useState("");
  const [isCreatingTag, setIsCreatingTag] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const fetchedTags = await tagService.getAllTags();
        setTags(fetchedTags);

        // Initialize selected tags
        if (selectedTagIds.length > 0) {
          const selected = fetchedTags.filter((tag: TagDto) => selectedTagIds.includes(tag.id));
          setSelectedTags(selected);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
        setError("Failed to load tags. Please try again.");
      }
    };

    fetchTags();
  }, [selectedTagIds]);

  const handleSelect = useCallback(
    (tagId: string) => {
      const tag = tags.find((t) => t.id === tagId);
      if (!tag) return;

      const newSelectedTags = [...selectedTags, tag];
      setSelectedTags(newSelectedTags);
      onChange(newSelectedTags.map((t) => t.id));
      setSearch(""); // Clear search after selection
      setOpen(false); // Close the popover after selection
    },
    [tags, selectedTags, onChange]
  );

  const handleRemove = useCallback(
    (tagId: string) => {
      const newSelectedTags = selectedTags.filter((tag) => tag.id !== tagId);
      setSelectedTags(newSelectedTags);
      onChange(newSelectedTags.map((t) => t.id));
    },
    [selectedTags, onChange]
  );

  const handleCreateTag = useCallback(async () => {
    if (!search.trim() || isCreatingTag) return;

    // Check if tag with same name already exists (case insensitive)
    const tagExists = tags.some((tag) => tag.name.toLowerCase() === search.trim().toLowerCase());
    if (tagExists) {
      setError("A tag with this name already exists.");
      return;
    }

    setIsCreatingTag(true);
    setError(null);

    try {
      // Use the tag service to create the new tag
      const newTag = await tagService.createTag(search);

      // Update tags list with the new tag
      setTags((prevTags) => [...prevTags, newTag]);

      // Add the new tag to selected tags
      const newSelectedTags = [...selectedTags, newTag];
      setSelectedTags(newSelectedTags);
      onChange(newSelectedTags.map((t) => t.id));

      // Clear search
      setSearch("");
      setOpen(false); // Close the popover after creating
    } catch (error: any) {
      console.error("Error creating tag:", error);
      setError(error.message || "Failed to create tag. Please try again.");
    } finally {
      setIsCreatingTag(false);
    }
  }, [search, tags, selectedTags, onChange, isCreatingTag]);

  const filteredTags = tags.filter(
    (tag) =>
      !selectedTags.some((selected) => selected.id === tag.id) && tag.name.toLowerCase().includes(search.toLowerCase())
  );

  const canCreateTag = search.trim() && !tags.some((tag) => tag.name.toLowerCase() === search.trim().toLowerCase());

  return (
    <div className="space-y-4">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" role="combobox" aria-expanded={open} className="w-full justify-between">
            <div className="flex flex-wrap items-center gap-1 max-w-[90%] overflow-hidden">
              {selectedTags.length > 0 ? (
                <>
                  {selectedTags.map((tag) => (
                    <Badge
                      key={tag.id}
                      className="flex items-center gap-1 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemove(tag.id);
                      }}
                    >
                      {tag.name}
                      <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                    </Badge>
                  ))}
                </>
              ) : (
                <span className="text-muted-foreground">Search or add tags...</span>
              )}
            </div>
            <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search or create tags..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>
                <TagIcon className="mx-auto h-8 w-8 text-muted-foreground/50" />
                <p className="mt-2 text-sm font-semibold">No tags found</p>
              </CommandEmpty>

              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => handleSelect(tag.id)}
                    className="cursor-pointer flex items-center"
                  >
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
              {canCreateTag && (
                <div className="w-full p-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleCreateTag}
                    disabled={isCreatingTag}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create <b>{search}</b> tag
                  </Button>
                </div>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
