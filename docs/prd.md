# Product Requirements Document (PRD) - MyPromptPocket

## 1. Product Overview

MyPromptPocket is a web application for managing a private library of prompts used in communication with LLMs. The application allows users to create, edit, parameterize, and organize prompts efficiently.

The main goal of the product is to provide users with a convenient tool for storing and managing their own prompts, which can be used in various contexts when working with AI language models.

The application in its MVP version will be available as a web solution with a responsive interface, with plans for development towards a desktop application in the future.

Target users: people using LLM (Large Language Models) in their daily work, including professionals from various industries, researchers and scientists, content creators, programmers and artificial intelligence engineers, and AI enthusiasts.

Core features:

- Creating and managing prompt library
- Prompt parameterization using {{ parameter }} syntax
- Categorizing prompts using a tag system
- Searching prompts by name
- Filling parameter values before copying prompts to clipboard
- Improving prompts with AI support
- User authentication via email/password and Google login

## 2. User Problem

AI model users often create and repeatedly use the same or similar prompts. However, currently most users don't have a dedicated tool for organizing and managing these prompts, which leads to the following problems:

1. Wasting time on recreating similar prompts
2. Inconsistency in quality and structure of prompts used for similar tasks
3. Difficulty in finding previously created, effective prompts
4. Lack of easy parameterization and reuse of prompts in different contexts
5. Inefficient prompt storage in various places (text files, notes, documents)

MyPromptPocket solves these problems by providing a centralized, private prompt library with parameterization, categorization, and quick search capabilities.

## 3. Functional Requirements

### Prompt Management

- Creating new prompts with fields: name, description, content, parameters
- Editing existing prompts
- Deleting prompts
- Displaying prompt details
- Copying prompt to clipboard

### Parameterization

- Defining parameters in prompt content using {{ parameter }} syntax
- Automatic parameter detection in prompt content
- Filling parameter values before copying prompt
- Validation of entered parameter values

### Organization and Search

- Categorizing prompts using tags (flat system, no hierarchy)
- Searching prompts by name
- Filtering prompts by tags

### AI Support

- Generating improvement suggestions for existing prompts
- Help in creating new prompts

### Authentication and Security

- Registration and login via email/password
- Integration with Google login

### User Interface

- Responsive design (RWD)
- Intuitive prompt editor with syntax highlighting
- Notification system for successful prompt copying to clipboard

## 4. Product Boundaries

### In Scope

- Web application for prompt management
- Private prompt library for logged-in users
- Prompt parameterization using {{ parameter }}
- Basic prompt editing and organization features
- English language interface

### Out of Scope

- Desktop version (planned for future)
- Prompt versioning
- Prompt archiving
- Prompt sharing between users
- Multilingual user interface
- Hierarchical category/folder structure

## 5. User Stories

### US-001: User Registration

**Title**: New Account Registration
**Description**: As a new user, I want to create an account in the application to be able to use my private prompts.

**Acceptance Criteria**:

- User can fill out registration form with fields: email address, password, repeat password
- System validates email address correctness
- System requires strong password (min. 8 characters, containing upper and lower case letters, numbers)
- After successful registration, user receives confirmation message
- User can log in to newly created account

### US-002: Email/Password Login

**Title**: Login using credentials
**Description**: As a registered user, I want to log in to the system using my email and password to access my prompts.

**Acceptance Criteria**:

- User can enter email and password on login page
- System verifies data correctness
- After successful login, user is redirected to application main page
- In case of incorrect data, system displays appropriate message

### US-003: Google Login

**Title**: Login using Google account
**Description**: As a user, I want to log in to the application using my Google account to avoid remembering additional login credentials.

**Acceptance Criteria**:

- "Login with Google" button is available on login page
- After clicking the button, user is redirected to Google login page
- After successful Google authentication, user is automatically logged into application
- If it's first Google login, system creates new account linked to Google account

### US-004: Logout

**Title**: Application logout
**Description**: As a logged-in user, I want to log out of the application to secure my data.

**Acceptance Criteria**:

- Logout option is available in interface
- After selecting logout option, user session is closed
- User is redirected to login page
- Renewed access to data requires logging in

### US-005: Adding New Prompt

**Title**: Creating new prompt
**Description**: As a user, I want to add a new prompt to my library to use it later.

**Acceptance Criteria**:

- New prompt form is available
- User can enter name, description, and prompt content
- System automatically detects parameters in {{ parameter }} syntax
- User can add tags to prompt
- After saving, prompt is visible in user's library

### US-006: Editing Prompt

**Title**: Modifying existing prompt
**Description**: As a user, I want to edit existing prompts to adapt them to changing needs.

**Acceptance Criteria**:

- User can select prompt for editing
- System displays form with current prompt data
- User can modify all prompt fields
- System dynamically updates detected parameters list during editing
- After saving changes, prompt is updated in library

### US-007: Deleting Prompt

**Title**: Deleting prompt from library
**Description**: As a user, I want to delete unnecessary prompts to maintain order in my library.

**Acceptance Criteria**:

- User can select prompt deletion option
- System displays confirmation message
- After confirmation, prompt is permanently deleted from library
- System displays successful deletion confirmation

### US-008: Viewing Prompt Details

**Title**: Displaying prompt details
**Description**: As a user, I want to see selected prompt details to review its content and parameters.

**Acceptance Criteria**:

- User can select prompt from list
- System displays prompt details: name, description, content, parameters, and tags
- Parameters are highlighted in prompt content
- Interface shows prompt creation date

### US-009: Prompt Parameterization

**Title**: Creating prompt with parameters
**Description**: As a user, I want to define parameters in my prompt to adapt it to different contexts.

**Acceptance Criteria**:

- User can enter parameters in prompt content using {{ parameter }} syntax
- System automatically detects and highlights parameters during editing
- Parameters are visually highlighted in different color
- System prevents creating duplicate parameter names

### US-010: Parameter Filling and Clipboard Copy

**Title**: Filling parameters and copying prompt
**Description**: As a user, I want to fill parameter values and copy ready prompt to clipboard to paste it into LLM model.

**Acceptance Criteria**:

- After selecting prompt for use, system displays form with fields for all detected parameters
- User can enter values for each parameter
- System validates entered values
- After filling parameters, user can preview prompt with substituted values
- "Copy to Clipboard" button is available
- After clicking button, prompt with substituted parameters is copied to system clipboard
- System displays successful copy message
- User can paste copied text anywhere

### US-011: Prompt Categorization Using Tags

**Title**: Adding tags to prompts
**Description**: As a user, I want to organize my prompts using tags to find them easier.

**Acceptance Criteria**:

- During prompt creation or editing user can add tags
- System suggests existing tags previously used by user
- User can add multiple tags to one prompt
- Tags are visible on prompt list and in prompt details

### US-012: Searching Prompts

**Title**: Searching prompts by name
**Description**: As a user, I want to quickly find prompt by its name to save time.

**Acceptance Criteria**:

- Search field is available
- System searches prompts containing entered phrase in name
- Search results are updated in real-time while typing
- If no results found, system displays appropriate message

### US-013: Filtering Prompts by Tags

**Title**: Filtering prompt library by tags
**Description**: As a user, I want to filter my prompts by tags to quickly find prompts from specific category.

**Acceptance Criteria**:

- Interface displays list of all used tags
- User can select one or more tags for filtering
- System displays only prompts matching selected tags
- User can easily remove selected filters

### US-014: Improving Prompt with AI

**Title**: Getting improvement suggestions from AI
**Description**: As a user, I want to ask AI to improve my prompt to make it more effective.

**Acceptance Criteria**:

- During prompt creation or editing "Get AI suggestions" option is available
- After selecting option, system generates improvement suggestions for given prompt
- User can review suggestions and choose which ones to apply
- User can edit suggestions before applying them
- After applying suggestions, prompt is updated

### US-016: Prompt Library Overview

**Title**: Browsing prompt list
**Description**: As a user, I want to see list of all my prompts to have overview of my collection.

**Acceptance Criteria**:

- After logging in, user sees list of all their prompts
- List contains basic information about each prompt (name, description excerpt, tags)
- List is paginated if number of prompts is large

### US-017: Responsive Interface

**Title**: Using application on different devices
**Description**: As a user, I want to use the application both on computer and mobile devices to have access to my prompts regardless of device used.

**Acceptance Criteria**:

- Application interface adapts to different screen sizes
- All features are available on both mobile and desktop devices
- Interface elements are convenient to use on touch screens
- Text is readable on small screens

## 6. Success Metrics

### MVP Evaluation Criteria

- Usefulness in private use (main criterion)
- Ease of creating and parameterizing prompts
- Speed of searching and copying prompts to clipboard
- Effectiveness of AI suggestions for improving prompts
