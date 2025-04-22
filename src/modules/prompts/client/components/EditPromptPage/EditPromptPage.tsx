import { useEffect, useState } from "react";
import { toast } from "sonner";

import { useNavigate } from "@shared/hooks";
import type { PromptDto, UpdatePromptCommand } from "@shared/types/types";
import { PromptForm } from "../PromptForm";
import { promptService } from "../../services/prompts.service";

interface EditPromptPageProps {
  promptId: string;
}

export const EditPromptPage = ({ promptId }: EditPromptPageProps) => {
  const { navigate } = useNavigate();
  const [prompt, setPrompt] = useState<PromptDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPrompt = async () => {
      try {
        const data = await promptService.getPromptById(promptId);
        setPrompt(data);
      } catch (error) {
        console.error("Error fetching prompt:", error);

        if (error instanceof Error && error.message === "Prompt not found") {
          toast.error("Prompt not found");
        } else {
          toast.error("Failed to load prompt");
        }

        navigate("/prompts");

        throw error;
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [promptId, navigate]);

  const handleSubmit = async (data: UpdatePromptCommand) => {
    try {
      await promptService.updatePrompt(promptId, data);
      toast.success("Prompt updated successfully");
      navigate("/prompts");
    } catch (error) {
      console.error("Error updating prompt:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!prompt) {
    return null; // Navigation already handled in useEffect
  }

  return <PromptForm initialData={prompt} onSubmit={handleSubmit} />;
};
