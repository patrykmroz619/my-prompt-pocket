import { useState, type MouseEvent } from "react";
import { Button } from "@shared/components/ui/button";
import { ParameterFillModal } from "./ParameterFillModal";
import type { PromptDto } from "@shared/types/types";
import { toast } from "sonner";
import { CopyIcon } from "lucide-react";

interface PromptCopyButtonProps {
  prompt: PromptDto;
  variant?: "default" | "icon";
  className?: string;
}

export function PromptCopyButton({ prompt, variant = "default", className }: PromptCopyButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleCopyClick = async (event: MouseEvent) => {
    event.stopPropagation(); // Prevent the click from bubbling up

    // Check if prompt has parameters
    const hasParameters = prompt.parameters && prompt.parameters.length > 0;

    if (hasParameters) {
      // Open the parameter fill modal
      setIsModalOpen(true);
    } else {
      // Direct copy without parameters
      try {
        await navigator.clipboard.writeText(prompt.content);
        toast.success("Prompt copied to clipboard!");
      } catch (error) {
        console.error("Failed to copy:", error);
        toast.error("Failed to copy prompt to clipboard");
      }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  const handleCopySuccess = () => {
    toast.success("Prompt copied to clipboard!");
    setTimeout(() => {
      handleModalClose();
    }, 1000);
  };

  return (
    <>
      <Button
        variant={variant === "default" ? "default" : "ghost"}
        size={variant === "default" ? "default" : "icon"}
        onClick={handleCopyClick}
        className={className}
        aria-label="Copy prompt"
        title="Copy prompt"
      >
        {variant === "default" ? "Copy Prompt" : <CopyIcon className="h-4 w-4" />}
      </Button>

      {/* Only render the modal when it's open to save resources */}
      {isModalOpen && (
        <ParameterFillModal
          prompt={prompt}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onCopySuccess={handleCopySuccess}
        />
      )}
    </>
  );
}
