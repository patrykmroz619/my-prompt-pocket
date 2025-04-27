import React, { useRef, useEffect } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import { Button } from "@shared/components/ui/button";
import { Separator } from "@shared/components/ui/separator";
import type { PromptDto } from "@shared/types/types";
import { useParameterFill } from "../hooks/useParameterFill";
import { ParameterForm } from "./parameters/ParameterForm";
import { PromptPreview } from "./parameters/PromptPreview";

export interface ParameterFillModalProps {
  prompt: PromptDto;
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: () => void;
}

export function ParameterFillModal({ prompt, isOpen, onClose, onCopySuccess }: ParameterFillModalProps) {
  const { values, errors, isCopied, isSubmitting, handleChange, copyToClipboard } = useParameterFill(prompt);

  // Reference to the first input field for focus management
  const firstInputRef = useRef<HTMLInputElement>(null);

  // Focus the first input when the modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  const handleCopy = async () => {
    const success = await copyToClipboard();
    if (success && onCopySuccess) {
      onCopySuccess();
      setTimeout(onClose, 1500); // Auto close after success
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Ctrl/Cmd + Enter to copy
    if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
      e.preventDefault();
      if (!isSubmitting && Object.keys(errors).length === 0) {
        handleCopy();
      }
    }
    // Escape to close (already handled by Dialog component)
  };

  // Only show the modal if there are parameters to fill
  if (prompt.parameters.length === 0) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        onKeyDown={handleKeyDown}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby="parameter-fill-title"
        aria-describedby="parameter-fill-description"
      >
        <DialogHeader>
          <DialogTitle id="parameter-fill-title">Fill prompt parameters</DialogTitle>
          <DialogDescription id="parameter-fill-description">
            Enter values for the parameters in this prompt to generate the final text.
            {prompt.parameters.length > 0 && (
              <span className="sr-only">
                This prompt has {prompt.parameters.length} parameter{prompt.parameters.length !== 1 ? "s" : ""} to fill.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <ParameterForm
            parameters={prompt.parameters}
            values={values}
            onChange={handleChange}
            errors={errors}
            firstInputRef={firstInputRef}
          />

          <Separator className="my-4" />

          <div className="space-y-2">
            <h4 className="text-sm font-medium" id="preview-heading">
              Preview
            </h4>
            <PromptPreview content={prompt.content} parameterValues={values} aria-labelledby="preview-heading" />
          </div>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0">
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose} aria-label="Cancel and close modal">
              Cancel
            </Button>
            <Button
              onClick={handleCopy}
              disabled={isSubmitting || Object.keys(errors).length > 0}
              className="gap-2"
              aria-live="polite"
              aria-busy={isSubmitting}
            >
              {isCopied ? (
                <>
                  <CheckIcon className="h-4 w-4" aria-hidden="true" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <CopyIcon className="h-4 w-4" aria-hidden="true" />
                  <span>{isSubmitting ? "Copying..." : "Copy to Clipboard"}</span>
                </>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
