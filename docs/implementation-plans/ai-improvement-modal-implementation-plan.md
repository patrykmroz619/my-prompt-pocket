# View Implementation Plan: AI Improvement Modal

## 1. Overview

This document outlines the implementation plan for the AI Improvement Modal view. This modal allows users to request AI-powered suggestions to enhance their prompt content. It displays the original prompt, the AI-generated improvement, and an explanation of the changes. Users can then choose to apply the suggested improvements to their prompt in the parent form or discard them. The modal handles loading states and potential errors during the AI interaction.

## 2. View Routing

This view is not directly routable via a URL path. It is implemented as a modal component (`AIImprovementModal`) invoked from within another view, specifically the Prompt Form (used for creating or editing prompts).

## 3. Component Details

### `AIImprovementModal`

- **Component description:** The main container component for the modal. It utilizes the `useAIImprovement` hook to manage state and API calls. It renders the Shadcn `Dialog` component and conditionally displays loading, error, or success views based on the state from the hook. It receives the original prompt content and callbacks from the parent.
- **Main elements:** Shadcn `Dialog`, `DialogContent`, `DialogHeader`, `DialogFooter`, `DialogTitle`, `DialogDescription`, `Button`. Renders `LoadingIndicator`, `ErrorDisplay`, or `SuccessView` conditionally.
- **Supported interactions:** Opens/closes via parent control, triggers AI improvement on open, handles Apply, Cancel/Close, and Retry button clicks.
- **Supported validation:** None directly; relies on the hook for validation.
- **Types:** Uses `AIImprovementState` from the hook.
- **Props:**
  - `isOpen: boolean`: Controls modal visibility.
  - `onOpenChange: (open: boolean) => void`: Callback to inform the parent of visibility changes.
  - `originalContent: string`: The current prompt content to be improved.
  - `onApply: (improvedContent: string) => void`: Callback invoked when the user clicks "Apply", passing the improved content back to the parent form.

### `LoadingIndicator`

- **Component description:** A simple component displaying a loading spinner (e.g., Shadcn `Loader2` icon with animation).
- **Main elements:** `div` containing an icon.
- **Supported interactions:** None.
- **Supported validation:** None.
- **Types:** None.
- **Props:** None.

### `ErrorDisplay`

- **Component description:** Displays an error message using a Shadcn `Alert` component (variant="destructive").
- **Main elements:** Shadcn `Alert`, `AlertTitle`, `AlertDescription`.
- **Supported interactions:** None.
- **Supported validation:** None.
- **Types:** None.
- **Props:**
  - `errorMessage: string`: The error message to display.

### `SuccessView`

- **Component description:** Container component rendered when the AI request is successful. It displays the comparison and explanation views.
- **Main elements:** `div` containing `ComparisonView` and `ExplanationView`.
- **Supported interactions:** None.
- **Supported validation:** None.
- **Types:** None.
- **Props:**
  - `originalContent: string`
  - `improvedContent: string`
  - `explanation: string`

### `ComparisonView`

- **Component description:** Displays the original and improved prompt content side-by-side on larger screens and stacked vertically on smaller screens. Uses simple text areas or preformatted text blocks for display.
- **Main elements:** `div` (flex container), two child `div` elements (one for original, one for improved), potentially using Shadcn `Textarea` (read-only) or `<pre>` tags for content display. Each section should have a clear heading (e.g., "Original Prompt", "Improved Suggestion").
- **Supported interactions:** None (display only).
- **Supported validation:** None.
- **Types:** None.
- **Props:**
  - `originalContent: string`
  * `improvedContent: string`

### `ExplanationView`

- **Component description:** Displays the explanation provided by the AI for the suggested improvements. Could use a Shadcn `Card` or a simple `div` with a heading.
- **Main elements:** `div` or Shadcn `Card`, `CardHeader`, `CardTitle` ("Explanation"), `CardContent`.
- **Supported interactions:** None.
- **Supported validation:** None.
- **Types:** None.
- **Props:**
  - `explanation: string`

## 4. Types

### DTOs (Data Transfer Objects - from `src/shared/types/types.ts`)

- **`PromptImprovementCommand`**: Used for the API request body.
  ```typescript
  interface PromptImprovementCommand {
    content: string;
    instruction?: string; // Note: Instruction input is deferred for MVP
  }
  ```
- **`PromptImprovementDto`**: Used for the successful API response body.
  ```typescript
  interface PromptImprovementDto {
    improved_content: string;
    explanation: string;
  }
  ```

### ViewModels / State Types

- **`AIImprovementStatus`**: Represents the different states of the modal's process.
  ```typescript
  type AIImprovementStatus = "idle" | "loading" | "success" | "error";
  ```
- **`AIImprovementState`**: The shape of the state managed by the `useAIImprovement` hook.
  ```typescript
  type AIImprovementState = {
    status: AIImprovementStatus;
    originalContent: string | null; // Store the content being improved
    improvedContent: string | null;
    explanation: string | null;
    errorMessage: string | null;
  };
  ```

## 5. State Management

State will be managed primarily within a custom React hook: `useAIImprovement`.

- **Hook Name:** `useAIImprovement`
- **Location:** `src/modules/prompts/client/hooks/useAIImprovement.ts`
- **Purpose:** Encapsulates the state logic (`AIImprovementState`), API call execution, response handling (success/error), and provides state values and action functions (`improvePrompt`, `resetState`) to the `AIImprovementModal` component.
- **State:** Manages `AIImprovementState` using `React.useState`.
- **Logic:**
  - Accepts `initialContent: string` as an argument.
  - Provides an `improvePrompt` async function to trigger the API call. This function handles setting loading state, making the fetch request, processing success (parsing JSON, updating state), and processing errors (parsing error JSON, updating state).
  - Provides a `resetState` function to return the state to its initial 'idle' condition.
  - Uses `React.useEffect` to automatically call `improvePrompt` when the hook is initialized with valid content (or when `isOpen` becomes true in the component, passed down to the hook).
  - Handles client-side validation (checking if `initialContent` is empty).

## 6. API Integration

- **Endpoint:** `POST /api/prompts/improve`
- **Request:**
  - Method: `POST`
  - Headers: `Content-Type: application/json` (Authorization headers handled by a global fetch wrapper if applicable).
  - Body: JSON representation of `PromptImprovementCommand` (e.g., `{ "content": "..." }`).
  - Request Type: `PromptImprovementCommand`
- **Response (Success):**
  - Status: 200 OK
  - Body: JSON representation of `PromptImprovementDto`.
  - Response Type: `PromptImprovementDto`
- **Response (Error):**
  - Status Codes: 400, 429, 500, 503.
  - Body: JSON object `{ "error": "message", "details"?: [...] }`.
- **Implementation:** The `fetch` API will be used within the `useAIImprovement` hook to interact with the endpoint.

## 7. User Interactions

1.  **Open Modal:** User clicks the "Improve with AI" button in the Prompt Form. The parent component sets `isOpen` to `true`.
2.  **Loading:** Modal opens, `useAIImprovement` hook triggers API call. `LoadingIndicator` is shown. Buttons are disabled/hidden except Cancel/Close.
3.  **Success:** API returns 200. `LoadingIndicator` is hidden. `SuccessView` (with `ComparisonView` and `ExplanationView`) is shown. "Apply", "Cancel/Close" buttons are visible and enabled.
4.  **Error:** API returns error (4xx/5xx) or network error occurs. `LoadingIndicator` is hidden. `ErrorDisplay` is shown with the error message. "Retry" and "Cancel/Close" buttons are visible and enabled. "Apply" is hidden/disabled.
5.  **Click Apply:** User clicks the "Apply" button. The `onApply` prop is called with `improvedContent`. The `onOpenChange(false)` prop is called to close the modal.
6.  **Click Cancel/Close:** User clicks the "Cancel" button or the 'X' icon. The `onOpenChange(false)` prop is called. No changes are applied.
7.  **Click Retry:** User clicks the "Retry" button (after an error). The `improvePrompt` function in the hook is called again, returning to the Loading state.

## 8. Conditions and Validation

- **Empty Original Content:**
  - **Check:** Performed in `useAIImprovement` before making the API call (`originalContent.trim().length === 0`).
  - **Effect:** API call is skipped. State is set to `status: 'error'` with message "Prompt content cannot be empty." `ErrorDisplay` is shown. The trigger button in the parent form should ideally be disabled if the content is empty.
- **Loading State:**
  - **Check:** `state.status === 'loading'`.
  - **Effect:** Show `LoadingIndicator`. Disable/hide Apply/Retry buttons.
- **Success State:**
  - **Check:** `state.status === 'success'`.
  - **Effect:** Show `SuccessView`. Enable Apply button.
- **Error State:**
  - **Check:** `state.status === 'error'`.
  - **Effect:** Show `ErrorDisplay`. Enable Retry button. Disable/hide Apply button.

## 9. Error Handling

- **Empty Content:** Handled via client-side validation before API call (see above).
- **Network Errors:** `fetch` promise rejection caught in `useAIImprovement`. Set `status: 'error'`, `errorMessage: 'Network error. Please check your connection.'`.
- **API Errors (400, 429, 500, 503):** Catch non-2xx responses in `useAIImprovement`. Parse the JSON error body. Set `status: 'error'`, `errorMessage: parsedError.error || 'An unknown API error occurred.'`. Provide specific messages for 429 ("Rate limit exceeded. Please try again later.") and 503 ("AI service unavailable. Please try again later.").
- **UI Feedback:** Use `ErrorDisplay` component within the modal. Provide "Retry" and "Cancel/Close" options.

## 10. Implementation Steps

1.  **Create Hook:** Implement the `useAIImprovement` custom hook (`src/modules/prompts/client/hooks/useAIImprovement.ts`) with state management (`AIImprovementState`), API call logic (`fetch POST /api/prompts/improve`), success/error handling, and exported functions (`improvePrompt`, `resetState`). Include client-side validation for empty content.
2.  **Create Basic Modal Component:** Create the `AIImprovementModal` component (`src/modules/prompts/client/components/AIImprovementModal.tsx`). Integrate the `useAIImprovement` hook. Set up the basic Shadcn `Dialog` structure.
3.  **Implement Conditional Rendering:** Add logic to `AIImprovementModal` to conditionally render `LoadingIndicator`, `ErrorDisplay`, or `SuccessView` based on `state.status` from the hook.
4.  **Create Display Components:** Implement `LoadingIndicator`, `ErrorDisplay`, `SuccessView`, `ComparisonView`, and `ExplanationView` as presentational components, styling with Tailwind/Shadcn. Ensure `ComparisonView` is responsive (side-by-side vs. stacked).
5.  **Implement Buttons & Actions:** Add "Apply", "Cancel/Close", and "Retry" buttons to `DialogFooter`. Connect their `onClick` handlers to call the appropriate functions (`onApply`, `onOpenChange`, `improvePrompt` from hook). Ensure buttons are enabled/disabled based on the state (`status`).
6.  **Integrate with Parent:** In the `PromptForm` component (outside this plan's scope but necessary for integration):
    - Add state to control `isOpen` for the modal.
    - Add a button ("Improve with AI") to trigger opening the modal (`onOpenChange(true)`). Disable this button if prompt content is empty.
    - Implement the `onApply` callback function to update the form's prompt content state with the `improvedContent` received from the modal.
    - Pass `isOpen`, `onOpenChange`, `originalContent`, and `onApply` as props to `<AIImprovementModal />`.
7.  **Styling & Refinement:** Apply Tailwind classes for layout, spacing, and appearance. Ensure responsiveness and accessibility (keyboard navigation, focus management, ARIA attributes).
