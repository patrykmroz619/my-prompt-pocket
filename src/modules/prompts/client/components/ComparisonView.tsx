import { Textarea } from "@shared/components/ui/textarea";

interface ComparisonViewProps {
  originalContent: string;
  improvedContent: string;
}

export const ComparisonView = ({ originalContent, improvedContent }: ComparisonViewProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Original Prompt</h3>
        <Textarea value={originalContent} readOnly className="h-60 resize-none font-mono text-sm bg-muted" />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Improved Suggestion</h3>
        <Textarea value={improvedContent} readOnly className="h-60 resize-none font-mono text-sm bg-muted/30" />
      </div>
    </div>
  );
};
