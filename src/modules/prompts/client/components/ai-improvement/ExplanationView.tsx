import { Card, CardHeader, CardTitle, CardContent } from "@shared/components/ui/card";

interface ExplanationViewProps {
  explanation: string;
}

export const ExplanationView = ({ explanation }: ExplanationViewProps) => {
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">Explanation</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className="text-sm whitespace-pre-line max-h-64 overflow-y-auto pr-2"
          role="region"
          aria-label="AI explanation"
        >
          {explanation}
        </div>
      </CardContent>
    </Card>
  );
};
