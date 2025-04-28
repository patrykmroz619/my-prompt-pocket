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
        <p className="text-sm">{explanation}</p>
      </CardContent>
    </Card>
  );
};
