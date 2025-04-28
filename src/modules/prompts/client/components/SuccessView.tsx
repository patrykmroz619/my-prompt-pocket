import { ComparisonView } from "./ComparisonView";
import { ExplanationView } from "./ExplanationView";

interface SuccessViewProps {
  originalContent: string;
  improvedContent: string;
  explanation: string;
}

export const SuccessView = ({ originalContent, improvedContent, explanation }: SuccessViewProps) => {
  return (
    <div>
      <ComparisonView originalContent={originalContent} improvedContent={improvedContent} />
      <ExplanationView explanation={explanation} />
    </div>
  );
};
