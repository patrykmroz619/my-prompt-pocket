import { useCallback, useEffect, useState } from "react";
import type { TagDto } from "@shared/types/types";
import { X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@shared/components/ui/command";
import { Button } from "@shared/components/ui/button";

interface TagSelectorProps {
  selectedTagIds: string[];
  onChange: (tagIds: string[]) => void;
}

export function TagSelector({ selectedTagIds, onChange }: TagSelectorProps) {
  const [tags, setTags] = useState<TagDto[]>([]);
  const [selectedTags, setSelectedTags] = useState<TagDto[]>([]);
  const [search, setSearch] = useState("");

  // Fetch tags on mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (!response.ok) throw new Error("Failed to fetch tags");
        const data = await response.json();
        setTags(data.data);

        // Initialize selected tags
        if (selectedTagIds.length > 0) {
          const selected = data.data.filter((tag: TagDto) => selectedTagIds.includes(tag.id));
          setSelectedTags(selected);
        }
      } catch (error) {
        console.error("Error fetching tags:", error);
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

  const filteredTags = tags.filter(
    (tag) =>
      !selectedTags.some((selected) => selected.id === tag.id) && tag.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {selectedTags.map((tag) => (
          <div key={tag.id} className="flex items-center gap-1 rounded-md bg-secondary px-2 py-1 text-sm">
            <span>{tag.name}</span>
            <Button
              variant="ghost"
              size="icon"
              className="size-4 p-0 hover:bg-secondary-foreground/20"
              onClick={() => handleRemove(tag.id)}
            >
              <X className="size-3" />
              <span className="sr-only">Remove {tag.name} tag</span>
            </Button>
          </div>
        ))}
      </div>

      <Command className="border rounded-lg">
        <CommandInput placeholder="Search tags..." value={search} onValueChange={setSearch} />
        <CommandEmpty>No tags found.</CommandEmpty>
        <CommandGroup>
          {filteredTags.map((tag) => (
            <CommandItem key={tag.id} value={tag.id} onSelect={handleSelect} className="cursor-pointer">
              {tag.name}
            </CommandItem>
          ))}
        </CommandGroup>
      </Command>
    </div>
  );
}
