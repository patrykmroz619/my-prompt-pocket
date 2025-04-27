# UI Architecture for MyPromptPocket

## 1. UI Structure Overview

This application is organized around an authenticated main layout with a top navigation bar header and a content area displaying various prompt-related views. Dedicated forms, modals, and states handle prompt creation, editing, parameter filling, and AI suggestions. Responsive design ensures usability on different devices.

## 2. List of Views

### 2.1 Authentication Views

- **Login / Register**
  **Path**: `/login`, `/register`
  **Purpose**: Allow users to log in or create an account via email/password or Google.
  **Key Information**: Form inputs for credentials, social login button, error messages.
  **Key Components**: Form, validation messages, Supabase login handling.
  **Accessibility & Security**: Proper labels for form fields, password masking, secure form submission.

### 2.2 Main Layout

- **Layout**
  **Path**: (encapsulates application routes)
  **Purpose**: Provides a consistent wrapper with a top navigation bar for navigation, branding, and user actions.
  **Key Information**: Links: "Prompts library", "Create new prompt". Highlights active route.
  **Key Components**: Top bar header with navigation, brand/logo area, navigation links, logged-in user info, logout button.
  **Accessibility & Security**: Proper ARIA states for active navigation.

### 2.3 Prompts Library (List)

- **View Name**: Prompts Library
  **Path**: `/prompts`
  **Purpose**: Display a paginated grid of prompt cards, allowing search and filtering by tags.
  **Key Information**: Prompt name, description excerpt, creation date, tags.
  **Key View Components**:
  - Search input (debounced)
  - Tag multi-select (Combobox)
  - Prompt cards grid
  - Pagination
    **Accessibility & Security**: Screen-reader-friendly cards, easy keyboard navigation for search.

### 2.4 Prompt Detail (Modal)

- **View Name**: Prompt Detail
  **Triggered by**: “Show” action on a prompt card
  **Purpose**: Display brief read-only details of a single prompt.
  **Key Information**: Full content, name, description, parameter highlights, tags, creation and update dates.
  **Key View Components**: Modal (Dialog), parameter highlighting, action buttons (Edit, Delete).
  **Accessibility & Security**: Proper dialog role, focus management, close button with keyboard support.

### 2.5 Create/Edit Prompt (Form)

- **View Name**: Prompt Form
  **Path**: `/prompts/create`, `/prompts/edit/:id`
  **Purpose**: Provide fields to create or edit a prompt’s name, description, content, tags, parameters.
  **Key Information**: Name, description, content with detected parameters, tags.
  **Key View Components**:
  - Form fields for name, description, content
  - Automatic parameter detection list with type selection (short/long text)
  - AI improvement button opening a modal
    **Accessibility & Security**: In-form validation messages, semantic form elements, role-based access to ensure only owners can edit.

### 2.6 Parameter Filling (Modal)

- **View Name**: Parameter Fill
  **Triggered by**: “Copy” action on a prompt card and prompt detail modal (if parameters exist)
  **Purpose**: Let the user fill parameter values and copy final text to clipboard.
  **Key Information**: Parameter fields, real-time preview, copy confirmation.
  **Key View Components**: Modal form, dynamic inputs for each parameter, preview area, “Copy to Clipboard” button.
  **Accessibility & Security**: Clear input labeling, real-time validation errors, minimal friction for screen readers.

### 2.7 AI Improvement (Modal)

- **View Name**: AI Improvement
  **Triggered by**: Button in Prompt Form
  **Purpose**: Request improved content from AI, display explanation, allow user to accept or reject changes.
  **Key Information**: Original prompt content, improved content, explanation.
  **Key View Components**: Modal dialog, side-by-side or stacked content comparison, “Apply” button.
  **Accessibility & Security**: Clear text markup, accessible buttons, error handling for failed AI requests.

### 2.8 Delete Confirmation (Modal)

- **View Name**: Delete Confirmation
  **Triggered by**: “Delete” action on a prompt card or in the prompt detail modal
  **Purpose**: Confirm deletion of a prompt.
  **Key Information**: Prompt ID or name, confirmation text.
  **Key View Components**: Short message, proceed/cancel buttons.
  **Accessibility & Security**: Straightforward keyboard and screen-reader flow; ensures accidental deletes are minimized.

## 3. User Journey Map

1. **Login/Register** → User logs in using email/password or Google.
2. **Prompts Library** → Displays a grid of existing prompts. User can search, filter by tags, or navigate pages.
3. **Prompt Creation** → User clicks "Create new prompt" to open form. Fills in details, saves prompt.
4. **Prompt Editing** → User opens a prompt card menu, selects "Edit", modifies fields, tags, parameters, or uses AI improvements, then saves.
5. **Prompt Detail** → User can quickly view prompt details via “Show” modal and optionally click “Delete” or “Edit.”
6. **Parameter Filling** → From a prompt, user chooses “Copy.” If parameters are present, the fill modal appears to input values. The user copies the final text.
7. **Logout** → User logs out to secure data.

## 4. Navigation Layout and Structure

- **Top Bar Header**: Displays:
  - App logo/name (left side)
  - Main navigation links:
    - Prompts Library (`/prompts`)
    - Create New Prompt (`/prompts/create`)
  - Information about logged-in user and logout action (right side)
- **Routes**:
  - `/login`, `/register`: Unauthenticated routes
  - `/prompts`: Authenticated route for the prompts library
  - `/prompts/create`: Authenticated route for creating a prompt
  - `/prompts/edit/:id`: Authenticated route for editing a specific prompt
- **Modals**: Accessed contextually from within these routes (Detail, Parameter Fill, AI Improvement, Delete Confirmation).

## 5. Key Components

- **PromptCard**: Displays prompt information (name, excerpt, tags, date) and card actions.
- **PromptForm**: Main form for prompt creation/editing with fields, parameter detection, and AI improvement trigger.
- **ParameterFillModal**: Dynamically generated inputs for parameter substitution before copying to clipboard.
- **PromptDetailModal**: Read-only display of all prompt details.
- **AIImprovementModal**: Handles AI suggestions, displayed as improved content and explanation.
- **TagMultiSelect**: Combobox component for adding/removing tags.
- **DeleteConfirmationModal**: Confirms destructive actions.
- **NotificationToasts**: Show success/error messages with minimal user interruption (e.g., form errors, API failures).
- **TopBarNavigation**: Renders main navigation items, logo, and user actions in the header.

This architecture satisfies the main user stories by supporting prompt organization, parameter handling, AI improvements, and straightforward, secure authentication. It also addresses accessibility, responsiveness, and potential error conditions (via modals and notifications).
