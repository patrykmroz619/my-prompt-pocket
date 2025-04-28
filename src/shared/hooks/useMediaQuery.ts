import { useState, useEffect } from "react";

/**
 * Hook to detect if a media query matches
 *
 * @param query The media query to check
 * @returns boolean indicating if the media query matches
 */
export const useMediaQuery = (query: string): boolean => {
  // Default to false for SSR
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Create media query list
    const mediaQuery = window.matchMedia(query);

    // Set initial value
    setMatches(mediaQuery.matches);

    // Define listener function
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Add listener for changes
    mediaQuery.addEventListener("change", handleChange);

    // Clean up listener on unmount
    return () => {
      mediaQuery.removeEventListener("change", handleChange);
    };
  }, [query]);

  return matches;
};
