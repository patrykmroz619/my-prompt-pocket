import { Loader2 } from "lucide-react";

// Simple loading indicator component
export const LoadingIndicator = () => {
  return (
    <div className="flex flex-col items-center justify-center py-8">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="mt-4 text-sm text-muted-foreground">Analyzing your prompt...</p>
    </div>
  );
};
