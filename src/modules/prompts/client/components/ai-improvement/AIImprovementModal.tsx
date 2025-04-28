import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { useAIImprovement } from "../../hooks/useAIImprovement";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorDisplay } from "./ErrorDisplay";
import { SuccessView } from "./SuccessView";

interface AIImprovementModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  originalContent: string;
  onApply: (improvedContent: string) => void;
}

export const AIImprovementModal = ({ isOpen, onOpenChange, originalContent, onApply }: AIImprovementModalProps) => {
  const { state, improvePrompt } = useAIImprovement({
    initialContent: originalContent,
    isOpen,
  });

  const [showContent, setShowContent] = useState(false);

  // Add animation effect when modal content changes
  useEffect(() => {
    if (isOpen) {
      // Small delay for animation effect
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);

      return () => clearTimeout(timer);
    } else {
      setShowContent(false);
      return undefined;
    }
  }, [isOpen]);

  const handleApply = () => {
    if (state.improvedContent) {
      onApply(state.improvedContent);
      onOpenChange(false);
    }
  };

  const handleRetry = () => {
    if (state.originalContent) {
      // Reset animation for content change
      setShowContent(false);
      setTimeout(() => {
        improvePrompt(state.originalContent as string);
        setShowContent(true);
      }, 150);
    }
  };

  // Render content based on current state
  const renderContent = () => {
    switch (state.status) {
      case "loading":
        return <LoadingIndicator />;

      case "error":
        return <ErrorDisplay errorMessage={state.errorMessage || "An unexpected error occurred"} />;

      case "success":
        if (state.originalContent && state.improvedContent && state.explanation) {
          return (
            <SuccessView
              originalContent={state.originalContent}
              improvedContent={state.improvedContent}
              explanation={state.explanation}
            />
          );
        }
        return null;

      case "idle":
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl"
        onOpenAutoFocus={(e) => {
          // Prevent autofocus when in loading state
          if (state.status === "loading") {
            e.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>AI Prompt Improvement</DialogTitle>
          <DialogDescription>
            Our AI will analyze your prompt and suggest improvements to make it more effective.
          </DialogDescription>
        </DialogHeader>

        <div className={`py-4 transition-opacity duration-300 ${showContent ? "opacity-100" : "opacity-0"}`}>
          {renderContent()}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row justify-end gap-2 mt-2">
          {state.status === "success" && (
            <Button
              onClick={handleApply}
              className="w-full sm:w-auto min-w-24"
              aria-label="Apply improved content to prompt"
            >
              Apply
            </Button>
          )}

          {state.status === "error" && (
            <Button
              onClick={handleRetry}
              variant="secondary"
              className="w-full sm:w-auto min-w-24"
              aria-label="Retry AI improvement"
            >
              Retry
            </Button>
          )}

          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="w-full sm:w-auto min-w-24"
            disabled={state.status === "loading"}
            aria-label={state.status === "success" ? "Cancel and close modal" : "Close modal"}
          >
            {state.status === "success" ? "Cancel" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
