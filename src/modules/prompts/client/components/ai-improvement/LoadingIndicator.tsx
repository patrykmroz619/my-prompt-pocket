import { Loader2 } from "lucide-react";

// Simple loading indicator component with accessibility improvements
export const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8" role="status" aria-live="polite">
      <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
      <p className="mt-4 text-sm text-muted-foreground">Analyzing your prompt...</p>
      <span className="sr-only">Loading. Please wait while we analyze your prompt.</span>
    </div>
  );
};
