# Parameter Fill Modal Implementation Plan

## 1. Overview

The Parameter Fill Modal is a critical UI component that allows users to input values for parameters defined in their prompts before copying the finalized text to clipboard. This modal appears when a user attempts to copy a prompt that contains parameters (using the {{parameter}} syntax).

## 2. View Routing

This component doesn't require a dedicated route as it's a modal that appears on top of existing views when triggered by the "Copy" action on either:

- Prompt cards in the prompt list view
- The prompt detail modal

## 3. Component Structure

```
ParameterFillModal (React component)
├── Modal (from shadcn/ui)
│   ├── ModalHeader
│   │   ├── ModalTitle
│   │   └── ModalDescription
│   ├── ModalContent
│   │   ├── ParameterForm
│   │   │   ├── FormField (for each parameter)
│   │   │   │   ├── Label
│   │   │   │   ├── Input (for short-text parameters)
│   │   │   │   └── Textarea (for long-text parameters)
│   │   ├── Separator
│   │   ├── PromptPreview
│   │   │   ├── PreviewHeader
│   │   │   └── PreviewContent
│   │   └── CopyToClipboardButton
│   └── ModalFooter
│       ├── CancelButton
│       └── InfoText (parameter count)
```

## 4. Component Details

### ParameterFillModal

- **Component description**: Main container that manages the entire parameter filling flow
- **Main elements**: Modal container with header, content, and footer
- **Supported interactions**: Open/close modal, handle parameter value changes, copy to clipboard
- **Supported validation**: Checks if all required parameters have values
- **Types**: Uses PromptDto and custom state types
- **Props**:
  ```typescript
  interface ParameterFillModalProps {
    prompt: PromptDto;
    isOpen: boolean;
    onClose: () => void;
    onCopySuccess?: () => void;
  }
  ```

### ParameterForm

- **Component description**: Form containing inputs for each parameter in the prompt
- **Main elements**: Form with dynamically generated inputs based on parameter types
- **Supported interactions**: Input changes, form submission
- **Supported validation**: Required field validation
- **Types**: Uses PromptParameter and form state
- **Props**:
  ```typescript
  interface ParameterFormProps {
    parameters: PromptParameter[];
    values: Record<string, string>;
    onChange: (name: string, value: string) => void;
    errors: Record<string, string>;
  }
  ```

### PromptPreview

- **Component description**: Shows a real-time preview of the prompt with parameters substituted
- **Main elements**: Preview header and scrollable content area with formatted text
- **Supported interactions**: None (display only)
- **Supported validation**: None
- **Types**: Uses the original prompt content and parameter values
- **Props**:
  ```typescript
  interface PromptPreviewProps {
    content: string;
    parameterValues: Record<string, string>;
  }
  ```

### CopyToClipboardButton

- **Component description**: Button that copies the finalized prompt to clipboard
- **Main elements**: Button with loading/success states and icon
- **Supported interactions**: Click to copy
- **Supported validation**: Disabled when not all required parameters have values
- **Types**: Uses simple types for the content and callback
- **Props**:
  ```typescript
  interface CopyToClipboardButtonProps {
    content: string;
    disabled: boolean;
    onCopySuccess?: () => void;
  }
  ```

## 5. Types

### New Types to Implement

```typescript
// Parameter value state type
type ParameterValues = Record<string, string>;

// Form errors state type
type ParameterErrors = Record<string, string>;

// State for the parameter fill modal
interface ParameterFillState {
  values: ParameterValues;
  errors: ParameterErrors;
  isCopied: boolean;
  isSubmitting: boolean;
}
```

## 6. State Management

The modal will use React's useState and useCallback hooks for state management. A custom hook called `useParameterFill` will be implemented to encapsulate the logic:

```typescript
function useParameterFill(prompt: PromptDto) {
  // Initialize values with empty strings for each parameter
  const [values, setValues] = useState<ParameterValues>(() => {
    return prompt.parameters.reduce((acc, param) => {
      acc[param.name] = "";
      return acc;
    }, {} as ParameterValues);
  });

  const [errors, setErrors] = useState<ParameterErrors>({});
  const [isCopied, setIsCopied] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle input changes
  const handleChange = useCallback(
    (name: string, value: string) => {
      setValues((prev) => ({ ...prev, [name]: value }));
      // Clear error for this field if it exists
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }
    },
    [errors]
  );

  // Validate all fields
  const validate = useCallback(() => {
    const newErrors: ParameterErrors = {};

    prompt.parameters.forEach((param) => {
      if (!values[param.name]?.trim()) {
        newErrors[param.name] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [values, prompt.parameters]);

  // Get substituted content
  const getSubstitutedContent = useCallback(() => {
    let content = prompt.content;

    // Replace each parameter with its value
    for (const [name, value] of Object.entries(values)) {
      content = content.replace(new RegExp(`{{\\s*${name}\\s*}}`, "g"), value);
    }

    return content;
  }, [values, prompt.content]);

  // Copy to clipboard function
  const copyToClipboard = useCallback(async () => {
    if (!validate()) return false;

    setIsSubmitting(true);
    try {
      const content = getSubstitutedContent();
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
      return true;
    } catch (error) {
      console.error("Failed to copy:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [validate, getSubstitutedContent]);

  return {
    values,
    errors,
    isCopied,
    isSubmitting,
    handleChange,
    validate,
    getSubstitutedContent,
    copyToClipboard,
  };
}
```

## 7. API Integration

This feature does not require any API calls as everything happens client-side:

1. The prompt data is already available from the parent component
2. Parameter values are managed in local state
3. The clipboard API is used directly for copying

## 8. User Interactions

1. **Opening the modal**:

   - Triggered when user clicks "Copy" on a prompt that contains parameters
   - Modal appears with form inputs for each parameter

2. **Filling parameter values**:

   - User enters values in the form inputs
   - Real-time validation provides feedback
   - Preview updates as user types

3. **Copying to clipboard**:

   - User clicks "Copy to Clipboard" button
   - System validates all inputs
   - On success, prompt with substituted values is copied to clipboard
   - Success message is displayed briefly
   - Modal can be closed manually or automatically after successful copy

4. **Canceling the operation**:
   - User clicks "Cancel" button or outside the modal
   - Modal closes without copying anything
   - Form state is reset

## 9. Conditions and Validation

1. **Required Parameters**:

   - All parameter fields are required and cannot be empty
   - Validation occurs on blur and on submission attempt
   - Error messages appear below invalid fields

2. **Copy Button State**:

   - Button is disabled when any required parameter is empty
   - Button shows loading state during copy operation
   - Button shows success state briefly after successful copy

3. **Preview Updates**:
   - Preview should update in real-time as parameters are filled
   - The preview should maintain formatting of the original prompt
   - Parameter substitution should handle whitespace variations in the parameter syntax

## 10. Error Handling

1. **Validation Errors**:

   - Display inline error messages for empty required fields
   - Highlight the form field with appropriate styling

2. **Clipboard API Errors**:

   - Handle cases where clipboard access is denied
   - Provide fallback mechanism (e.g., manual selection of text)
   - Display user-friendly error message

3. **Edge Cases**:
   - Handle extremely long parameter values gracefully
   - Ensure proper escaping of special characters
   - Handle prompts with duplicate parameter names correctly

## 11. Implementation Steps

1. **Create the component files**:

   - Create `src/modules/prompts/client/components/ParameterFillModal.tsx`
   - Create the custom hook in `src/modules/prompts/client/hooks/useParameterFill.ts`

2. **Implement the custom hook**:

   - Implement state management for parameter values
   - Create functions for validation and parameter substitution
   - Add clipboard functionality

3. **Implement the UI components**:

   - Create the modal structure using shadcn/ui
   - Implement the parameter form with dynamic inputs
   - Create the preview component
   - Add the copy to clipboard button

4. **Add accessibility features**:

   - Ensure proper focus management
   - Add appropriate ARIA attributes
   - Test keyboard navigation

5. **Implement integration with parent components**:

   - Add trigger mechanisms from prompt card and detail view
   - Handle the success callback
