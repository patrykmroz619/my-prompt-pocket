# View Implementation Plan - Prompt Form

## 1. Overview

The Prompt Form view allows users to create or edit prompts. It includes fields for name, description, prompt content, parameter detection, tags, and AI-driven prompt improvements.

## 2. View Routing

Accessible at:

- /prompts/create
- /prompts/edit/:id

## 3. Component Structure

1. CreatePromptPage (top-level page)

   - Handles submitting a new prompt to POST /api/prompts.
   - Renders PromptForm component.

2. EditPromptPage (top-level page)

   - Fetches prompt details if editing (via GET /api/prompts/:id).
   - Renders PromptForm pre-filled with existing data and updates via PATCH /api/prompts/:id.

3. PromptForm

   - Renders input fields for name, description, content.
   - Detects parameters and renders ParameterEditor.
   - Renders TagSelector for adding/removing tags.
   - Includes button to open AI ImprovementModal (only mock button, modal will be implemented later).

4. ParameterEditor

   - Lists identified parameters (from content).
   - Allows type selection (“short-text” or “long-text”).

5. TagSelector

   - Allows selecting multiple tags from a list.

## 4. Component Details

### CreatePromptPage

- Purpose: Provides form context for creating a new prompt.
- Main elements:
  - PromptForm with empty default values.
- Supported interactions:
  - Submitting data via POST /api/prompts.

### EditPromptPage

- Purpose: Provides form context for editing an existing prompt.
- Main elements:
  - Fetch prompt data and render PromptForm with existing data.
- Supported interactions:
  - Submitting updated data via PATCH /api/prompts/:id.

### PromptForm

- Purpose: Main form elements for prompts.
- Main elements: name field, description field, content textarea, ParameterEditor, TagSelector, AI Improvement button.
- Supported interactions: user input, onChange calls to re-check parameters, onSubmit calls to parent.
- Validation:
  - “Name” required, “content” required.
  - Parameter definitions match what’s in content.
- Types:
  - PromptParameter, TagDto
- Props:
  - initialData?: PromptDto
  - onSubmit(formState: PromptDto)

### ParameterEditor

- Purpose: Displays extracted parameters, allows type assignment.
- Main elements: parameter rows, type dropdown.
- Supported interactions: parameter type changes, removing unused parameters.
- Validation: ensure no duplicates, each extracted parameter has a type.
- Types:
  - PromptParameter (name, type)
- Props:
  - parameters: PromptParameter[]
  - onChange(updatedParams: PromptParameter[])

### TagSelector

- Purpose: Select or create tags related to the prompt.
- Main elements: tag list, add/remove tag functionality.
- Supported interactions: toggling tags, optional creation of new tags.
- Validation: none beyond ensuring valid tag IDs.
- Types:
  - TagDto
- Props:
  - selectedTagIds: string[]
  - onChange(tagIds: string[])

## 5. Types

- PromptDto for submissions:
  - name (string), description (string?), content (string), tags (string[]?), parameters (PromptParameter[]?).
- PromptParameter: { name: string; type: "short-text" | "long-text"; }
- PromptDto: returned from GET /api/prompts/:id or after creation/updates.

## 6. State Management

- Local form state kept in CreatePromptPage and EditPromptPage (name, description, content, parameters, tag IDs).
- Parameter extraction triggered by changes in content.
- Tag selection updates local array of tag IDs.
- AI improvement triggers a modal to update content in local state.

## 7. API Integration

- GET /api/prompts/:id in edit mode:
  - Expects PromptDto response.
- POST /api/prompts for creating a new prompt:
  - Sends CreatePromptCommand, expects PromptDto.
- PATCH /api/prompts/:id for editing:
  - Sends UpdatePromptCommand, expects updated PromptDto.

## 8. User Interactions

- User fills name, description, content → triggers parameter detection.
- Edits parameter types → changes local state.
- Selects or removes tags → updates local state.
- Clicks “Save” → calls POST or PATCH with form data.

## 9. Conditions and Validation

- Name required, no duplicates allowed per user (checked by server).
- Content required, any parameters in content must have matching definitions.
- Tag IDs must be valid (server will validate ownership).

## 10. Error Handling

- 400 or 409 responses displayed as form-level errors.
- Missing parameters or name conflicts produce validation messages.
- 404 Not Found if editing ID is invalid (redirect or show not found).

## 11. Implementation Steps

1. Create CreatePromptPage component for adding new prompts.
2. Create EditPromptPage component for fetching and editing prompts.
3. Implement PromptForm for displaying fields and managing form logic.
4. Integrate ParameterEditor and TagSelector.
5. Ensure proper API calls (POST for create, PATCH for edit) and error handling.
6. Perform final testing and address any edge cases.
