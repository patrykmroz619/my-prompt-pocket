import { Alert, AlertTitle, AlertDescription } from "@shared/components/ui/alert";
import { AlertTriangle } from "lucide-react";

interface ErrorDisplayProps {
  errorMessage: string;
}

export const ErrorDisplay = ({ errorMessage }: ErrorDisplayProps) => {
  return (
    <Alert variant="destructive" className="my-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{errorMessage}</AlertDescription>
    </Alert>
  );
};
