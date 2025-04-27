import type { RefObject } from "react";
import { Input } from "@shared/components/ui/input";
import { Label } from "@shared/components/ui/label";
import { Textarea } from "@shared/components/ui/textarea";
import type { PromptParameter } from "@shared/types/types";
import type { ParameterErrors, ParameterValues } from "../../hooks/useParameterFill";

export interface ParameterFormProps {
  parameters: PromptParameter[];
  values: ParameterValues;
  onChange: (name: string, value: string) => void;
  errors: ParameterErrors;
  firstInputRef?: RefObject<HTMLInputElement | null>;
}

export function ParameterForm({ parameters, values, onChange, errors, firstInputRef }: ParameterFormProps) {
  return (
    <div className="space-y-4" role="form">
      <div className="sr-only" id="form-description">
        Fill in all parameter values to generate your prompt.
      </div>

      {parameters.map((param, index) => (
        <div key={param.name} className="space-y-2">
          <Label htmlFor={`param-${param.name}`} className="text-sm font-medium">
            {param.name}
            <span className="text-destructive ml-1">*</span>
          </Label>

          {param.type === "short-text" ? (
            <Input
              id={`param-${param.name}`}
              name={param.name}
              value={values[param.name] || ""}
              onChange={(e) => onChange(param.name, e.target.value)}
              placeholder={`Enter ${param.name}`}
              aria-invalid={!!errors[param.name]}
              aria-describedby={errors[param.name] ? `error-${param.name}` : undefined}
              className={errors[param.name] ? "border-destructive" : ""}
              ref={index === 0 ? firstInputRef : undefined}
              required
            />
          ) : (
            <Textarea
              id={`param-${param.name}`}
              name={param.name}
              value={values[param.name] || ""}
              onChange={(e) => onChange(param.name, e.target.value)}
              placeholder={`Enter ${param.name}`}
              rows={4}
              aria-invalid={!!errors[param.name]}
              aria-describedby={errors[param.name] ? `error-${param.name}` : undefined}
              className={errors[param.name] ? "border-destructive" : ""}
              required
            />
          )}

          {errors[param.name] && (
            <p className="text-xs text-destructive mt-1" id={`error-${param.name}`} role="alert">
              {errors[param.name]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
