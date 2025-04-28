import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { LoadingIndicator } from "./LoadingIndicator";
import { ErrorDisplay } from "./ErrorDisplay";
import { SuccessView } from "./SuccessView";
import { useAIImprovement } from "../hooks/useAIImprovement";

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

  const handleApply = () => {
    if (state.improvedContent) {
      onApply(state.improvedContent);
      onOpenChange(false);
    }
  };

  const handleRetry = () => {
    if (state.originalContent) {
      improvePrompt(state.originalContent);
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
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Prompt Improvement</DialogTitle>
          <DialogDescription>
            Our AI will analyze your prompt and suggest improvements to make it more effective.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">{renderContent()}</div>

        <DialogFooter className="flex justify-end gap-2">
          {state.status === "success" && (
            <Button onClick={handleApply} className="min-w-24">
              Apply
            </Button>
          )}

          {state.status === "error" && (
            <Button onClick={handleRetry} variant="secondary" className="min-w-24">
              Retry
            </Button>
          )}

          <Button
            onClick={() => onOpenChange(false)}
            variant="outline"
            className="min-w-24"
            disabled={state.status === "loading"}
          >
            {state.status === "success" ? "Cancel" : "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
