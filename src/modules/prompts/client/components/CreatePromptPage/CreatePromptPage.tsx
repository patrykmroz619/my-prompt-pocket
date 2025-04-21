import { useNavigate } from "@shared/hooks";
import type { CreatePromptCommand } from "@shared/types/types";
import { toast } from "sonner";
import { PromptForm } from "../PromptForm";

export const CreatePromptPage = () => {
  const { navigate } = useNavigate();

  const handleSubmit = async (data: CreatePromptCommand) => {
    try {
      const response = await fetch("/api/prompts", {
        method: "POST",
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

        toast.error("Failed to create prompt");
        return;
      }

      await response.json(); // Still parse the response to ensure it's valid
      toast.success("Prompt created successfully");
      navigate("/prompts");
    } catch (error) {
      console.error("Error creating prompt:", error);
      toast.error("An unexpected error occurred");
    }
  };

  return <PromptForm onSubmit={handleSubmit} />;
};
