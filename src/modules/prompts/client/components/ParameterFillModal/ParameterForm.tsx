import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import { Textarea } from "@shared/components/ui/textarea";
import type { Control } from "react-hook-form";
import type { ParameterValues } from "./useParameterFill";
import type { PromptParameter } from "@shared/types/types";

interface ParameterFormProps {
  parameters: PromptParameter[];
  control: Control<ParameterValues>;
  firstInputRef: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>;
}

export function ParameterForm({ parameters, control, firstInputRef }: ParameterFormProps) {
  return (
    <div className="space-y-4">
      {parameters.map((param, index) => (
        <FormField
          key={param.name}
          control={control}
          name={param.name}
          render={({ field }) => (
            <FormItem>
              <FormLabel htmlFor={`param-${param.name}`}>
                {param.name}
                <span className="text-destructive ml-1">*</span>
              </FormLabel>
              <FormControl>
                {param.type === "long-text" ? (
                  <Textarea
                    id={`param-${param.name}`}
                    placeholder={`Enter value for ${param.name}...`}
                    className="resize-none min-h-[100px]"
                    {...field}
                    aria-required="true"
                    ref={index === 0 ? (firstInputRef as React.RefObject<HTMLTextAreaElement>) : undefined}
                  />
                ) : (
                  <Input
                    id={`param-${param.name}`}
                    placeholder={`Enter value for ${param.name}...`}
                    {...field}
                    aria-required="true"
                    ref={index === 0 ? (firstInputRef as React.RefObject<HTMLInputElement>) : undefined}
                  />
                )}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
}
