import { useCallback } from "react";
import type { PromptParameter } from "@shared/types/types";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@shared/components/ui/select";

interface ParameterEditorProps {
  parameters: PromptParameter[];
  onChange: (parameters: PromptParameter[]) => void;
}

export function ParameterEditor({ parameters, onChange }: ParameterEditorProps) {
  const handleTypeChange = useCallback(
    (parameterName: string, type: "short-text" | "long-text") => {
      const updatedParameters = parameters.map((param) => (param.name === parameterName ? { ...param, type } : param));
      onChange(updatedParameters);
    },
    [parameters, onChange]
  );

  if (parameters.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No parameters detected. Use {"{{"}
        <span>parameter</span>
        {"}} "} syntax in your prompt content to define parameters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-sm font-medium">Parameters</div>
      <div className="space-y-3">
        {parameters.map((param) => (
          <div key={param.name} className="flex items-center justify-between gap-4 rounded-lg border p-3">
            <div className="font-mono text-sm">{param.name}</div>
            <Select
              value={param.type}
              onValueChange={(value: "short-text" | "long-text") => handleTypeChange(param.name, value)}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="short-text">Short Text</SelectItem>
                  <SelectItem value="long-text">Long Text</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ))}
      </div>
    </div>
  );
}
