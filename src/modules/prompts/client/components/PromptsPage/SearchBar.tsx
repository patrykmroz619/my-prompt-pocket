import React, { useEffect, useState } from "react";
import { Input } from "@shared/components/ui/input";
import { SearchIcon, XCircleIcon } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  // Add client-side only state to prevent hydration mismatch
  const [mounted, setMounted] = useState(false);

  // Only render the clear button on the client to prevent hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <SearchIcon className="h-4 w-4 text-muted-foreground" />
      </div>
      <Input
        type="search"
        placeholder="Search prompts..."
        className="pl-10 pr-10"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {/* Only render the clear button after client-side hydration */}
      {mounted && value && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <XCircleIcon className="h-4 w-4 text-muted-foreground hover:text-foreground" />
        </button>
      )}
    </div>
  );
};
