import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { extractParametersFromContent } from "@modules/prompts/shared/utils/extractParametersFromContent.util";
import { createPromptSchema } from "@modules/prompts/shared/schemas/create-prompt.schema";
import type { z } from "zod";
import type { PromptDto, CreatePromptCommand, UpdatePromptCommand } from "@shared/types/types";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import { Button } from "@shared/components/ui/button";
import { ParameterEditor } from "../ParameterEditor";
import { TagSelector } from "../TagSelector";
import { AIImprovementModal } from "../ai-improvement";
import { Sparkles } from "lucide-react";

interface PromptFormProps {
  initialData?: Partial<PromptDto>;
  onSubmit: (data: CreatePromptCommand | UpdatePromptCommand) => Promise<void>;
}

type FormData = z.infer<typeof createPromptSchema>;

export function PromptForm({ initialData, onSubmit }: PromptFormProps) {
  // State for controlling the AI Improvement modal
  const [isImprovementModalOpen, setIsImprovementModalOpen] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(createPromptSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || null,
      content: initialData?.content || "",
      parameters: initialData?.parameters || [],
      tags: initialData?.tags?.map((tag) => tag.id) || [],
    },
  });

  const watchContent = form.watch("content");

  // Update parameters when content changes
  useEffect(() => {
    if (!watchContent) {
      form.setValue("parameters", []);
      return;
    }

    const extractedParams = extractParametersFromContent(watchContent);
    const existingParams = form.getValues("parameters") || [];
    const existingParamNames = new Set(existingParams.map((p) => p.name));

    // Add newly detected parameters with default type
    const updatedParams = [
      ...existingParams,
      ...extractedParams
        .filter((name) => !existingParamNames.has(name))
        .map((name) => ({
          name,
          type: "short-text" as const,
        })),
    ];

    // Remove parameters that no longer exist in content
    const finalParams = updatedParams.filter((param) => extractedParams.includes(param.name));

    form.setValue("parameters", finalParams);
  }, [watchContent, form]);

  const handleSubmit = useCallback(
    async (data: FormData) => {
      try {
        const formattedData: CreatePromptCommand = {
          name: data.name,
          content: data.content,
          description: data.description ?? null,
          ...(data.parameters && { parameters: data.parameters }),
          ...(data.tags && { tags: data.tags }),
        };
        await onSubmit(formattedData);
        form.reset();
      } catch (error) {
        // Error handling is done in the parent component
        console.error("Form submission failed:", error);
      }
    },
    [onSubmit, form]
  );

  // Handler for opening the AI improvement modal
  const handleOpenAIImprovement = useCallback(() => {
    if (watchContent && watchContent.trim().length > 0) {
      setIsImprovementModalOpen(true);
    }
  }, [watchContent]);

  // Handler for applying the AI improved content
  const handleApplyImprovedContent = useCallback(
    (improvedContent: string) => {
      form.setValue("content", improvedContent);
    },
    [form]
  );

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter prompt name..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter prompt description..."
                    className="h-20"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <div className="flex justify-between items-center">
                  <FormLabel>Content</FormLabel>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleOpenAIImprovement}
                    disabled={!watchContent || watchContent.trim().length === 0}
                    className="flex items-center gap-1 text-xs h-8"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Improve with AI
                  </Button>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Enter prompt content... Use {{parameter}} syntax for parameters"
                    className="h-32 font-mono"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parameters"
            render={({ field }) => (
              <FormItem>
                <ParameterEditor parameters={field.value || []} onChange={field.onChange} />
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (optional)</FormLabel>
                <FormControl>
                  <TagSelector selectedTagIds={field.value || []} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            {initialData ? "Update Prompt" : "Create Prompt"}
          </Button>
        </form>
      </Form>

      {/* AI Improvement Modal */}
      <AIImprovementModal
        isOpen={isImprovementModalOpen}
        onOpenChange={setIsImprovementModalOpen}
        originalContent={watchContent}
        onApply={handleApplyImprovedContent}
      />
    </>
  );
}
