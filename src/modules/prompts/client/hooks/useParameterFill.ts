import { useState, useCallback } from "react";
import type { PromptDto } from "@shared/types/types";

// Parameter value state type
export type ParameterValues = Record<string, string>;

// Form errors state type
export type ParameterErrors = Record<string, string>;

// State for the parameter fill modal
export interface ParameterFillState {
  values: ParameterValues;
  errors: ParameterErrors;
  isCopied: boolean;
  isSubmitting: boolean;
}

export function useParameterFill(prompt: PromptDto) {
  // Initialize values with empty strings for each parameter
  const [values, setValues] = useState<ParameterValues>(() => {
    return prompt.parameters.reduce((acc, param) => {
      acc[param.name] = "";
      return acc;
    }, {} as ParameterValues);
  });

  const [errors, setErrors] = useState<ParameterErrors>({});
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = useCallback(
    (name: string, value: string) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear error for this field if it exists
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate all fields
  const validate = useCallback(() => {
    const newErrors: ParameterErrors = {};

    prompt.parameters.forEach((param) => {
      if (!values[param.name]?.trim()) {
        newErrors[param.name] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, prompt.parameters]);

  // Get substituted content
  const getSubstitutedContent = useCallback(() => {
    let content = prompt.content;

    // Replace each parameter with its value
    for (const [name, value] of Object.entries(values)) {
      content = content.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), value);
    }

    return content;
  }, [values, prompt.content]);

  // Copy to clipboard function
  const copyToClipboard = useCallback(async () => {
    if (!validate()) return false;

    setIsSubmitting(true);
    try {
      const content = getSubstitutedContent();
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, getSubstitutedContent]);

  return {
    values,
    errors,
    isCopied,
    isSubmitting,
    handleChange,
    validate,
    getSubstitutedContent,
    copyToClipboard,
  };
}
