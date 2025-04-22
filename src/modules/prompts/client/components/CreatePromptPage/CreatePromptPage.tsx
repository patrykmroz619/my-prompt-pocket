import { toast } from "sonner";

import { useNavigate } from "@shared/hooks";
import type { CreatePromptCommand } from "@shared/types/types";
import { PromptForm } from "../PromptForm";
import { promptService } from "../../services/prompts.service";

export const CreatePromptPage = () => {
  const { navigate } = useNavigate();

  const handleSubmit = async (data: CreatePromptCommand) => {
    try {
      await promptService.createPrompt(data);
      toast.success("Prompt created successfully");
      navigate("/prompts");
    } catch (error) {
      console.error("Error creating prompt:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }

      throw error;
    }
  };

  return <PromptForm onSubmit={handleSubmit} />;
};
