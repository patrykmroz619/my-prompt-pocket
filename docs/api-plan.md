# REST API Plan - MyPromptPocket

This document outlines the REST API design for the MyPromptPocket application, detailing all endpoints, authentication mechanisms, and business logic implementation.

## 1. Resources

The API manages the following main resources that correspond to database tables:

| Resource    | Description                                   | Database Table |
| ----------- | --------------------------------------------- | -------------- |
| Prompts     | User-created prompt templates with parameters | prompts        |
| Tags        | Categories for organizing prompts             | tags           |
| Prompt Tags | Association between prompts and tags          | prompt_tags    |
| Users       | User accounts (handled by Supabase Auth)      | auth.users     |

## 2. Endpoints

### 2.1 Authentication

Authentication is managed through Supabase Auth using the `@supabase/ssr` package with server-side API endpoints for core authentication operations:

#### POST /api/auth/login

Handles user login with email/password credentials.

**Request:**

```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:** 200 OK

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "app_metadata": {},
    "user_metadata": {},
    "aud": "authenticated"
  }
}
```

**Errors:**

- 400 Bad Request: Invalid credentials
- 429 Too Many Requests: Rate limit exceeded

#### POST /api/auth/register

Registers a new user account.

**Request:**

```json
{
  "email": "newuser@example.com",
  "password": "securepassword"
}
```

**Response:** 200 OK

```json
{
  "user": {
    "id": "uuid",
    "email": "newuser@example.com",
    "app_metadata": {},
    "user_metadata": {},
    "aud": "authenticated",
    "confirmation_sent_at": "2023-06-15T10:30:00Z"
  }
}
```

**Errors:**

- 400 Bad Request: Invalid input or password requirements not met
- 409 Conflict: Email already registered

#### POST /api/auth/logout

Signs out the current user.

**Response:** 200 OK

**Errors:**

- 401 Unauthorized: No active session

#### POST /api/auth/forgot-password

Initiates the password reset process by sending a reset link to the user's email.

**Request:**

```json
{
  "email": "user@example.com"
}
```

**Response:** 200 OK (Indicates email sent, even if user doesn't exist to prevent enumeration)

**Errors:**

- 400 Bad Request: Invalid email format
- 429 Too Many Requests: Rate limit exceeded

#### POST /api/auth/reset-password

Updates the user's password. This endpoint is intended to be called after the user has clicked the reset link in their email and Supabase has authenticated them via a temporary session/token (usually handled via cookies set during the redirect from the email link).

**Request:**

```json
{
  "password": "newSecurePassword"
}
```

**Response:** 200 OK

**Errors:**

- 400 Bad Request: Invalid input (e.g., password doesn't meet requirements)
- 401 Unauthorized: User is not authenticated via the reset token (e.g., token expired or invalid)
- 429 Too Many Requests: Rate limit exceeded

### 2.2 Prompts

#### GET /api/prompts

Retrieves a list of prompts belonging to the authenticated user.

**Query Parameters:**

- `search` (string, optional): Filter prompts by name
- `tags` (string, optional): Comma-separated list of tag IDs to filter by
- `page` (number, optional): Page number for pagination, default: 1
- `page_size` (number, optional): Items per page, default: 20
- `sort_by` (string, optional): Field to sort by (`name`, `created_at`, `updated_at`), default: `updated_at`
- `sort_dir` (string, optional): Sort direction (`asc` or `desc`), default: `desc`

**Response:** 200 OK

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Prompt Name",
      "description": "Brief description",
      "content": "Prompt content with {{parameters}}",
      "parameters": [{ "name": "parameter", "type": "short-text" }],
      "created_at": "2023-06-15T10:30:00Z",
      "updated_at": "2023-06-15T10:30:00Z",
      "tags": [{ "id": "uuid", "name": "Tag Name" }]
    }
  ],
  "pagination": {
    "total_items": 45,
    "total_pages": 3,
    "current_page": 1,
    "page_size": 20
  }
}
```

#### POST /api/prompts

Creates a new prompt.

**Request:**

```json
{
  "name": "Prompt Name",
  "description": "Optional description",
  "content": "Prompt content with {{parameters}}",
  "tags": ["uuid-1", "uuid-2"],
  "parameters": [{ "name": "parameters", "type": "short-text" }]
}
```

**Response:** 201 Created

```json
{
  "id": "uuid",
  "name": "Prompt Name",
  "description": "Optional description",
  "content": "Prompt content with {{parameters}}",
  "parameters": [{ "name": "parameters", "type": "short-text" }],
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z",
  "tags": [
    { "id": "uuid-1", "name": "Tag Name 1" },
    { "id": "uuid-2", "name": "Tag Name 2" }
  ]
}
```

**Errors:**

- 400 Bad Request: Invalid input (validation failed)
- 400 Bad Request: Missing parameter types (when parameters found in content don't have types specified)
- 409 Conflict: Prompt name already exists for user

#### GET /api/prompts/:id

Retrieves a specific prompt by ID.

**Response:** 200 OK

```json
{
  "id": "uuid",
  "name": "Prompt Name",
  "description": "Optional description",
  "content": "Prompt content with {{parameters}}",
  "parameters": [{ "name": "parameters", "type": "short-text" }],
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z",
  "tags": [{ "id": "uuid", "name": "Tag Name" }]
}
```

**Errors:**

- 404 Not Found: Prompt not found

#### PATCH /api/prompts/:id

Updates a specific prompt.

**Request:**

```json
{
  "name": "Updated Name",
  "description": "Updated description",
  "content": "Updated content with {{parameters}}",
  "tags": ["uuid-1", "uuid-3"]
}
```

**Response:** 200 OK

```json
{
  "id": "uuid",
  "name": "Updated Name",
  "description": "Updated description",
  "content": "Updated content with {{parameters}}",
  "parameters": [{ "name": "parameters", "type": "short-text" }],
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T11:45:00Z",
  "tags": [
    { "id": "uuid-1", "name": "Tag Name 1" },
    { "id": "uuid-3", "name": "Tag Name 3" }
  ]
}
```

**Errors:**

- 400 Bad Request: Invalid input
- 404 Not Found: Prompt not found
- 409 Conflict: Prompt name already exists for user

#### DELETE /api/prompts/:id

Deletes a specific prompt.

**Response:** 204 No Content

**Errors:**

- 404 Not Found: Prompt not found

#### POST /api/prompts/improve

Gets AI-generated improvement suggestions for a prompt.

**Request:**

```json
{
  "content": "Prompt content to improve",
  "instruction": "Optional instructions for improvement focus"
}
```

**Response:** 200 OK

```json
{
  "improved_content": "Improved prompt content",
  "explanation": "Explanation of improvements"
}
```

**Errors:**

- 400 Bad Request: Invalid or empty prompt content
- 429 Too Many Requests: AI request rate limit exceeded

### 2.3 Tags

#### GET /api/tags

Retrieves all tags belonging to the authenticated user.

**Response:** 200 OK

```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Tag Name",
      "prompt_count": 5,
      "created_at": "2023-06-15T10:30:00Z",
      "updated_at": "2023-06-15T10:30:00Z"
    }
  ]
}
```

#### POST /api/tags

Creates a new tag.

**Request:**

```json
{
  "name": "Tag Name"
}
```

**Response:** 201 Created

```json
{
  "id": "uuid",
  "name": "Tag Name",
  "prompt_count": 0,
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T10:30:00Z"
}
```

**Errors:**

- 400 Bad Request: Invalid input (e.g., name too long)
- 409 Conflict: Tag name already exists for user

#### PATCH /api/tags/:id

Updates a tag name.

**Request:**

```json
{
  "name": "Updated Tag Name"
}
```

**Response:** 200 OK

```json
{
  "id": "uuid",
  "name": "Updated Tag Name",
  "prompt_count": 0,
  "created_at": "2023-06-15T10:30:00Z",
  "updated_at": "2023-06-15T11:45:00Z"
}
```

**Errors:**

- 400 Bad Request: Invalid input
- 404 Not Found: Tag not found
- 409 Conflict: Tag name already exists for user

#### DELETE /api/tags/:id

Deletes a tag.

**Response:** 204 No Content

**Errors:**

- 404 Not Found: Tag not found

### 2.4 Prompt Tags

#### POST /api/prompt-tags

Associates a tag with a prompt.

**Request:**

```json
{
  "prompt_id": "uuid",
  "tag_id": "uuid"
}
```

**Response:** 201 Created

```json
{
  "prompt_id": "uuid",
  "tag_id": "uuid",
  "prompt_name": "Prompt Name",
  "tag_name": "Tag Name"
}
```

**Errors:**

- 400 Bad Request: Invalid input
- 404 Not Found: Prompt or tag not found
- 409 Conflict: Association already exists

#### DELETE /api/prompt-tags

Removes a tag from a prompt.

**Request:**

```json
{
  "prompt_id": "uuid",
  "tag_id": "uuid"
}
```

**Response:** 204 No Content

**Errors:**

- 404 Not Found: Association not found

## 3. Authentication and Authorization

The API leverages Supabase Auth for authentication, providing:

### Authentication Mechanisms

- Email/password authentication
- Google OAuth integration
- Session-based authentication with JWT tokens

### Authorization Implementation

- Every API request must include an Authorization header with a valid JWT token
- Row-Level Security (RLS) policies in the database ensure users can only access their own data
- API endpoints verify user ownership of resources before allowing operations

### Security Measures

- Rate limiting to prevent abuse (especially for AI integration endpoints)
- CORS configuration to restrict origins
- JWTs with short expiration times and refresh token rotation

## 4. Validation and Business Logic

### Validation Rules

#### Prompts

- `name`: Required, 1-100 characters, unique per user
- `description`: Optional, 0-1000 characters
- `content`: Required, non-empty
- `parameters`: Automatically extracted from content using {{parameter}} syntax

#### Tags

- `name`: Required, 1-50 characters, unique per user

#### Parameter Values

- Values must be provided for all parameters defined in a prompt when using fill-parameters endpoint

### Business Logic Implementation

#### Parameter Extraction

- When creating or updating a prompt, the API automatically:
  1. Scans the prompt content for patterns matching {{parameter}}
  2. Extracts unique parameter names
  3. Validates that each parameter has a type specified in the request payload
  4. Stores them in the parameters JSONB field

#### Parameter Types

- The system supports the following parameter types:
  - `short-text`: For single-line text inputs (default type)
  - `long-text`: For multi-line text inputs (paragraphs, code snippets, etc.)
- Additional parameter types can be added in future versions

### Constraints and Edge Cases

- Deleting a tag removes all associations with prompts but doesn't affect the prompts themselves
- Parameter names must be unique within a prompt
- User can only see and manipulate their own prompts and tags
- Appropriate error handling for network issues with the AI service
