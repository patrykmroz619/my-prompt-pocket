import { useCallback, useEffect, useState } from "react";

/**
 * A custom hook to manage URL query parameters
 * @returns Functions and state for managing URL search parameters
 */
export function useQueryParams<T extends Record<string, string | string[]>>(
  defaultValues: T
): {
  params: T;
  setParam: (key: keyof T, value: string | string[] | null) => void;
  resetParams: () => void;
} {
  // Initialize params from URL on first render
  const [params, setParams] = useState<T>(() => {
    if (typeof window === "undefined") {
      return defaultValues;
    }

    const url = new URL(window.location.href);
    const initialParams = { ...defaultValues };

    // Get all entries from search params
    for (const [key, value] of url.searchParams.entries()) {
      if (key in defaultValues) {
        if (Array.isArray(defaultValues[key])) {
          // Handle array values
          // First ensure the value is initialized as an array
          if (!Array.isArray(initialParams[key])) {
            (initialParams as any)[key] = [];
          }

          // Split comma-separated values
          if (value.includes(',')) {
            (initialParams[key] as unknown as string[]).push(...value.split(','));
          } else {
            (initialParams[key] as unknown as string[]).push(value);
          }
        } else {
          // Handle string value
          (initialParams as any)[key] = value;
        }
      }
    }

    return initialParams;
  });

  // Update URL when params change
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);

    // Clear existing params
    url.searchParams.forEach((_, key) => {
      url.searchParams.delete(key);
    });

    // Add current params
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        return;
      }

      if (Array.isArray(value) && value.length > 0) {
        url.searchParams.set(key, value.join(','));
      } else if (!Array.isArray(value) && value !== "") {
        url.searchParams.set(key, value);
      }
    });

    // Update the URL without reloading the page
    window.history.replaceState({}, '', url);
  }, [params]);

  // Set a single param
  const setParam = useCallback((key: keyof T, value: string | string[] | null) => {
    setParams(prev => ({
      ...prev,
      [key]: value === null ? defaultValues[key] : value
    }));
  }, [defaultValues]);

  // Reset all params to default values
  const resetParams = useCallback(() => {
    // Instead of just setting state to defaultValues, we need to trigger a data refetch
    setParams({ ...defaultValues });
  }, [defaultValues]);

  return { params, setParam, resetParams };
}
