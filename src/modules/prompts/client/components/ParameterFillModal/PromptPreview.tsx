interface PromptPreviewProps {
  content: string;
  [key: string]: any;
}

export function PromptPreview({ content, ...props }: PromptPreviewProps) {
  return (
    <div
      className="bg-muted p-3 rounded-md whitespace-pre-wrap text-sm font-mono max-h-[200px] overflow-y-auto"
      {...props}
    >
      {content || <span className="text-muted-foreground italic">Preview will appear here</span>}
    </div>
  );
}
