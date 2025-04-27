import { useRef, useEffect } from "react";
import { CheckIcon, CopyIcon, AlertCircle } from "lucide-react";
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
import { Form } from "@shared/components/ui/form";
import { Alert, AlertDescription } from "@shared/components/ui/alert";
import type { PromptDto } from "@shared/types/types";
import { useParameterFill } from "./useParameterFill";
import { ParameterForm } from "./ParameterForm";
import { PromptPreview } from "./PromptPreview";

export interface ParameterFillModalProps {
  prompt: PromptDto;
  isOpen: boolean;
  onClose: () => void;
  onCopySuccess?: () => void;
}

export function ParameterFillModal({ prompt, isOpen, onClose, onCopySuccess }: ParameterFillModalProps) {
  const { form, isCopied, filledPromptContent, onSubmit } = useParameterFill({
    prompt,
    onSuccess: onCopySuccess,
  });

  // Reference to the first input field for focus management
  const firstInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  // Focus the first input when the modal opens
  useEffect(() => {
    if (isOpen && firstInputRef.current) {
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Only show the modal if there are parameters to fill
  if (prompt.parameters.length === 0) return null;

  // Check if there are validation errors
  const hasErrors = Object.keys(form.formState.errors).length > 0;
  const isSubmitted = form.formState.isSubmitted;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent
        className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <DialogHeader>
          <DialogTitle>Fill prompt parameters</DialogTitle>
          <DialogDescription>
            Enter values for the parameters in this prompt to generate the final text. All parameters are required.
            {prompt.parameters.length > 0 && (
              <span className="sr-only">
                This prompt has {prompt.parameters.length} parameter{prompt.parameters.length !== 1 ? "s" : ""} to fill.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={onSubmit}>
            {isSubmitted && hasErrors && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>Please fill all required parameters to continue.</AlertDescription>
              </Alert>
            )}

            <ParameterForm parameters={prompt.parameters} control={form.control} firstInputRef={firstInputRef} />

            <Separator className="my-4" />

            <div className="space-y-2">
              <h4 className="text-sm font-medium" id="preview-heading">
                Preview
              </h4>
              <PromptPreview content={filledPromptContent} aria-labelledby="preview-heading" />
            </div>

            <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-0 mt-4">
              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={onClose} aria-label="Cancel and close modal">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={form.formState.isSubmitting}
                  className="gap-2"
                  aria-live="polite"
                  aria-busy={form.formState.isSubmitting}
                >
                  {isCopied ? (
                    <>
                      <CheckIcon className="h-4 w-4" aria-hidden="true" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <CopyIcon className="h-4 w-4" aria-hidden="true" />
                      <span>{form.formState.isSubmitting ? "Copying..." : "Copy to Clipboard"}</span>
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
