import { useMemo } from "react";
import type { ParameterValues } from "../../hooks/useParameterFill";

export interface PromptPreviewProps {
  content: string;
  parameterValues: ParameterValues;
  "aria-labelledby"?: string;
}

export function PromptPreview({ content, parameterValues, "aria-labelledby": ariaLabelledBy }: PromptPreviewProps) {
  const substitutedContent = useMemo(() => {
    let result = content;

    // Replace each parameter with its value
    for (const [name, value] of Object.entries(parameterValues)) {
      result = result.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), value || `{{${name}}}`);
    }

    return result;
  }, [content, parameterValues]);

  // Count how many parameters still need values
  const missingParams = useMemo(() => {
    const paramRegex = /{{([^{}]+)}}/g;
    const matches = Array.from(substitutedContent.matchAll(paramRegex));
    return matches.length;
  }, [substitutedContent]);

  return (
    <div className="bg-muted p-4 rounded-md overflow-auto max-h-[300px]" role="region" aria-labelledby={ariaLabelledBy}>
      {missingParams > 0 && (
        <div className="text-xs text-muted-foreground mb-2" aria-live="polite">
          {missingParams} parameter{missingParams !== 1 ? "s" : ""} still need{missingParams === 1 ? "s" : ""} values
        </div>
      )}
      <pre className="text-sm whitespace-pre-wrap font-mono">{substitutedContent}</pre>
    </div>
  );
}
