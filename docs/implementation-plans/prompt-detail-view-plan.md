# View Implementation Plan: Prompt Detail

## 1. Overview

The Prompt Detail view is a modal dialog that displays read-only details of a selected prompt. It shows the prompt's full content, name, description, highlighted parameters, tags, and creation/update dates.

## 2. View Routing

This view is triggered as a modal overlay from the prompt list page (e.g. `/prompts`). It does not have its own dedicated URL.

## 3. Component Structure

- PromptDetailModal
  - ModalHeader
  - ModalBody
  - ModalFooter

## 4. Component Details

### PromptDetailModal

- Component description: Main modal container that renders prompt details.
- Main elements: Dialog container (with proper ARIA role), header section, body displaying prompt data, and footer with action buttons.
- Supported interactions:
  - Close modal (via button or ESC key)
  - Navigate to edit view via "Edit" button
  - Trigger delete confirmation via "Delete" button
- Supported validation: Verify prompt data is fetched correctly; if not, display an error message.
- Types: PromptDetailViewModel (new custom type based on PromptDto)
- Props:
  - promptId: string
  - onClose: () => void

### ModalHeader

- Component description: Displays the title ("Prompt Details") and the close button.
- Main elements: Title text and accessible close button.
- Supported interactions: Click on close button triggers onClose prop.

### ModalBody

- Component description: Renders the prompt’s name, description, content with highlighted parameters, tags, and creation/update dates.
- Main elements: Text blocks, parameter highlight styling, tag list, date displays.
- Supported interactions: None (read-only).
- Supported validation: Ensure proper formatting and presence of required fields.

### ModalFooter

- Component description: Contains action buttons for additional interactions.
- Main elements: "Edit" and "Delete" buttons.
- Supported interactions:
  - "Edit" button navigates to the prompt edit screen.
  - "Delete" button triggers prompt deletion process and confirmation.

## 5. Types

### PromptDetailViewModel

- id: string
- name: string
- description: string | null
- content: string
- parameters: Array<{ name: string; type: "short-text" | "long-text" }>
- tags: Array<{ id: string; name: string }>
- created_at: string
- updated_at: string

This type is based on PromptDto from the shared types.

## 6. State Management

State is managed via React hooks. A custom hook `usePromptDetail(promptId: string)` will:

- Fetch prompt data from GET /api/prompts/:id.
- Manage loading, error, and data states.
- Expose the prompt detail data to PromptDetailModal.

## 7. API Integration

Integrate with endpoint GET /api/prompts/:id:

- Request: Pass `promptId` as URL parameter.
- Response: Returns a PromptDetailViewModel as defined.
- Handle errors: For instance, display an error if the prompt is not found (404).

## 8. User Interactions

- Opening: Triggered by a "Show" action on a prompt card.
- Closing: Modal is closed by clicking the close button or pressing ESC.
- Edit: Clicking "Edit" navigates to the edit view.
- Delete: Clicking "Delete" initiates a deletion confirmation flow.

## 9. Conditions and Validation

- Validate that fetched prompt data includes mandatory fields: name, content, created_at.
- Ensure highlighted parameters are extracted and rendered from the content.
- Check that the API returns proper timestamps and tag arrays.

## 10. Error Handling

- Display an error message if the API call fails or returns a 404.
- Fallback UI when prompt data cannot be loaded.
- Handle network or unexpected errors gracefully.

## 11. Implementation Steps

1. Create the PromptDetailModal component with subcomponents (ModalHeader, ModalBody, ModalFooter).
2. Define the PromptDetailViewModel type in shared types (or extend PromptDto in a new file if needed).
3. Implement the `usePromptDetail` hook to call GET /api/prompts/:id and manage state.
4. Build the UI:
   - In ModalHeader, add title and close button.
   - In ModalBody, display prompt details and apply parameter highlight styling.
   - In ModalFooter, place "Edit" and "Delete" buttons with appropriate event handlers.
5. Integrate API call in `usePromptDetail` and handle error states.
6. Add accessibility features (ARIA roles, focus management, keyboard support).
7. Test the modal for responsiveness, correct data rendering, and proper error handling.
