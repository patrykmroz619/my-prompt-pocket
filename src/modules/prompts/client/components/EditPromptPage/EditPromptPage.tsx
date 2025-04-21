import { useNavigate } from "@shared/hooks";
import type { PromptDto, UpdatePromptCommand } from "@shared/types/types";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { PromptForm } from "../PromptForm";

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
        const response = await fetch(`/api/prompts/${promptId}`);

        if (!response.ok) {
          if (response.status === 404) {
            toast.error("Prompt not found");
            navigate("/prompts");
            return;
          }
          throw new Error("Failed to fetch prompt");
        }

        const data = await response.json();
        setPrompt(data);
      } catch (error) {
        console.error("Error fetching prompt:", error);
        toast.error("Failed to load prompt");
        navigate("/prompts");
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrompt();
  }, [promptId, navigate]);

  const handleSubmit = async (data: UpdatePromptCommand) => {
    try {
      const response = await fetch(`/api/prompts/${promptId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();

        if (response.status === 409) {
          toast.error("A prompt with this name already exists");
          return;
        }

        if (response.status === 400) {
          if (errorData.parameters) {
            toast.error(`Missing parameter definitions for: ${errorData.parameters.join(", ")}`);
            return;
          }
          if (errorData.missingParameters) {
            toast.error(`Some parameters are missing type definitions: ${errorData.missingParameters.join(", ")}`);
            return;
          }
          toast.error("Please check the form for errors");
          return;
        }

        if (response.status === 404) {
          toast.error("Prompt not found");
          navigate("/prompts");
          return;
        }

        toast.error("Failed to update prompt");
        return;
      }

      await response.json(); // Ensure valid response
      toast.success("Prompt updated successfully");
      navigate("/prompts");
    } catch (error) {
      console.error("Error updating prompt:", error);
      toast.error("An unexpected error occurred");
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
