import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import type { PromptDto } from "@shared/types/types";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Parameter value state type
export type ParameterValues = Record<string, string>;

type UseParameterFillParams = {
  prompt: PromptDto;
  onSuccess?: (() => void) | undefined;
};

const fillPromptContent = (content: string, values: ParameterValues) => {
  let filledContent = content;
  // Replace each parameter with its value
  for (const [name, value] of Object.entries(values)) {
    filledContent = content.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), value);
  }

  return filledContent;
};

export function useParameterFill(params: UseParameterFillParams) {
  const { prompt, onSuccess } = params;

  // Create dynamic validation schema based on parameters
  const formSchema = useMemo(() => {
    const schema: Record<string, z.ZodString> = {};

    prompt.parameters.forEach((param) => {
      schema[param.name] = z.string().min(1, `${param.name} is required`);
    });

    return z.object(schema);
  }, [prompt.parameters]);

  // Initialize form with react-hook-form
  const form = useForm<ParameterValues>({
    resolver: zodResolver(formSchema),
    defaultValues: prompt.parameters.reduce((acc, param) => {
      acc[param.name] = "";
      return acc;
    }, {} as ParameterValues),
  });

  const formValues = form.watch();

  // State for copy operation
  const [isCopied, setIsCopied] = useState(false);

  const filledPromptContent = useMemo(
    () => fillPromptContent(prompt.content, formValues),
    [prompt.content, formValues]
  );

  const onSubmit = form.handleSubmit(async (data) => {
    console.log("Form submitted with data:", data);
    try {
      const promptToCopy = fillPromptContent(prompt.content, data);
      await navigator.clipboard.writeText(promptToCopy);
      setIsCopied(true);
      onSuccess?.();
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    }
  });

  return {
    form,
    onSubmit,
    isCopied,
    filledPromptContent,
  };
}
