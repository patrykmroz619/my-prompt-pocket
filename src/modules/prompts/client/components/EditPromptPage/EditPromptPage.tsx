import { toast } from "sonner";

import { useNavigate } from "@shared/hooks";
import type { PromptDto, UpdatePromptCommand } from "@shared/types/types";
import { PromptForm } from "../PromptForm";
import { promptService } from "../../services/prompts.service";

interface EditPromptPageProps {
  prompt: PromptDto;
}

export const EditPromptPage = ({ prompt }: EditPromptPageProps) => {
  const { navigate } = useNavigate();

  const handleSubmit = async (data: UpdatePromptCommand) => {
    try {
      await promptService.updatePrompt(prompt.id, data);
      toast.success("Prompt updated successfully");
      navigate("/");
    } catch (error) {
      console.error("Error updating prompt:", error);

      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
    }
  };

  return <PromptForm initialData={prompt} onSubmit={handleSubmit} />;
};
