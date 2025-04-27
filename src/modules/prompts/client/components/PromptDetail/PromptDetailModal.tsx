import React, { useEffect, useRef } from "react";
import { usePromptDetail } from "../../hooks/usePromptDetail";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../../../../../shared/components/ui/dialog";
import { Button } from "../../../../../shared/components/ui/button";
import { Badge } from "../../../../../shared/components/ui/badge";
import { Separator } from "../../../../../shared/components/ui/separator";
import { Skeleton } from "../../../../../shared/components/ui/skeleton";
import { formatFullDate } from "../../../../../shared/utils/formatDate";
import { Loader2 } from "lucide-react";
import type { PromptParameter } from "../../../../../shared/types/types";
import { DialogDescription } from "@radix-ui/react-dialog";
import { PromptCopyButton } from "../PromptCopyButton";

interface PromptDetailModalProps {
  promptId: string;
  onClose: () => void;
  onEdit?: (promptId: string) => void;
  onDelete?: (promptId: string) => void;
  isDeleting?: boolean;
}

// Helper to highlight parameters in the prompt content
function highlightParameters(content: string, parameters: PromptParameter[]): React.ReactNode {
  if (!parameters || parameters.length === 0) {
    return <pre className="whitespace-pre-wrap text-sm">{content}</pre>;
  }

  const parameterRegex = new RegExp(`\\{\\{(${parameters.map((p) => p.name).join("|")})\\}\\}`, "g");
  const parts = content.split(parameterRegex);

  return (
    <pre className="whitespace-pre-wrap text-sm">
      {parts.map((part, i) => {
        // Every odd index is a parameter name
        if (i % 2 === 1) {
          return (
            <span key={i} className="bg-yellow-100 dark:bg-yellow-900 px-1 rounded" aria-label={`Parameter: ${part}`}>
              {`{{${part}}}`}
            </span>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </pre>
  );
}

export function PromptDetailModal({ promptId, onClose, onEdit, onDelete, isDeleting = false }: PromptDetailModalProps) {
  const { prompt, isLoading, error } = usePromptDetail(promptId);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = React.useState(false);

  const handleEdit = () => {
    if (onEdit && prompt) {
      onEdit(prompt.id);
    }
    onClose();
  };

  const handleDeleteRequest = () => {
    setShowDeleteConfirmation(true);
  };

  const handleDeleteConfirm = () => {
    if (onDelete && prompt) {
      onDelete(prompt.id);
    }
    // Don't need to close confirmation dialog here as the parent component
    // will unmount this component after deletion is complete
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirmation(false);
  };

  // Handle escape key for the delete confirmation dialog
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && showDeleteConfirmation) {
        e.preventDefault();
        handleDeleteCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showDeleteConfirmation]);

  // Focus the close button when the modal opens
  useEffect(() => {
    setTimeout(() => {
      closeButtonRef.current?.focus();
    }, 100); // Small delay to ensure the dialog is fully rendered
  }, []);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] overflow-auto">
        <DialogHeader>
          <DialogTitle>{prompt?.name}</DialogTitle>
          <DialogDescription>{prompt?.description}</DialogDescription>
        </DialogHeader>

        {/* Modal Body */}
        <div className="space-y-4">
          {isLoading && (
            <div className="space-y-2" aria-label="Loading prompt details">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
              <div className="flex gap-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          )}

          {error && (
            <div
              className="p-4 border border-red-200 bg-red-50 dark:bg-red-900/20 dark:border-red-800 rounded-md"
              role="alert"
              aria-live="assertive"
            >
              <p className="text-red-600 dark:text-red-400">Error: {error.message}</p>
            </div>
          )}

          {!isLoading && !error && prompt && (
            <>
              <div>
                <h4 className="text-sm font-medium mb-2">Prompt Content</h4>
                <div className="p-3 overflow-auto max-h-48 border rounded-md bg-muted/40">
                  {highlightParameters(prompt.content, prompt.parameters)}
                </div>
              </div>

              {prompt.parameters.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Parameters</h4>
                  <ul className="space-y-1" aria-label="List of parameters">
                    {prompt.parameters.map((param) => (
                      <li key={param.name} className="flex items-center gap-2">
                        <Badge variant="outline" className="font-mono">
                          {`${param.name}`}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {param.type === "short-text" ? "Short text" : "Long text"}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {prompt.tags.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-2" aria-label="List of tags">
                    {prompt.tags.map((tag) => (
                      <Badge key={tag.id} variant="secondary">
                        {tag.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex justify-between text-xs text-muted-foreground">
                <div>Created: {formatFullDate(prompt.created_at)}</div>
                <div>Updated: {formatFullDate(prompt.updated_at)}</div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <DialogFooter className="gap-2">
          {onDelete && (
            <Button className="sm:mr-auto" variant="destructive" onClick={handleDeleteRequest} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          )}
          {onEdit && (
            <Button variant="outline" onClick={handleEdit} disabled={isDeleting}>
              Edit prompt
            </Button>
          )}
          <Button
            className="order-[-1] sm:order-0"
            variant="outline"
            onClick={onClose}
            ref={closeButtonRef}
            disabled={isDeleting}
          >
            Close
          </Button>
          {prompt && <PromptCopyButton prompt={prompt} />}
        </DialogFooter>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirmation && (
        <Dialog open={true} onOpenChange={handleDeleteCancel}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Confirm Deletion</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p>Are you sure you want to delete this prompt?</p>
              <p className="text-sm text-muted-foreground mt-2">This action cannot be undone.</p>
            </div>
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button variant="outline" onClick={handleDeleteCancel} disabled={isDeleting}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm} autoFocus disabled={isDeleting}>
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}
