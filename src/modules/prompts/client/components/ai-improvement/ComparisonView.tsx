import { Textarea } from "@shared/components/ui/textarea";
import { useMediaQuery } from "@shared/hooks/useMediaQuery";

interface ComparisonViewProps {
  originalContent: string;
  improvedContent: string;
}

export const ComparisonView = ({ originalContent, improvedContent }: ComparisonViewProps) => {
  const isMobile = useMediaQuery("(max-width: 768px)");

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4" role="region" aria-label="Prompt comparison">
      <div>
        <h3 className="text-sm font-medium mb-2">Original Prompt</h3>
        <Textarea
          value={originalContent}
          readOnly
          className="h-52 md:h-60 resize-none font-mono text-sm bg-muted"
          aria-label="Original prompt content"
        />
      </div>
      <div>
        <h3 className="text-sm font-medium mb-2">Improved Suggestion</h3>
        <Textarea
          value={improvedContent}
          readOnly
          className="h-52 md:h-60 resize-none font-mono text-sm bg-muted/30"
          aria-label="Improved prompt suggestion"
        />
      </div>

      {isMobile && (
        <div className="col-span-1 flex justify-center items-center text-sm text-muted-foreground my-2">
          Scroll to compare the original and improved versions.
        </div>
      )}
    </div>
  );
};
