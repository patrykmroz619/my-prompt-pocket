# API Endpoint Implementation Plan: PATCH /api/prompts/:id

## 1. Endpoint Overview

This endpoint allows users to update an existing prompt with new name, description, content, and tag associations. It extracts parameters from the prompt content and updates the database accordingly.

## 2. Request Details

- **HTTP Method**: PATCH
- **URL Structure**: `/api/prompts/:id`
- **Path Parameters**:
  - `id` (UUID): The unique identifier of the prompt to update
- **Request Body**:
  ```json
  {
    "name": "Updated Name",
    "description": "Updated description",
    "content": "Updated content with {{parameters}}",
    "tags": ["uuid-1", "uuid-3"]
  }
  ```
- **Required Fields**: `name`, `content`
- **Optional Fields**: `description`, `tags`

## 3. Types Used

- **Request**: `UpdatePromptCommand` - Contains the data needed to update a prompt
- **Response**: `PromptDto` - The complete updated prompt with all its details
- **Validation**: `updatePromptSchema` - Zod schema for input validation

## 4. Response Details

- **Success Response**: 200 OK

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

- **Error Responses**:
  - 400 Bad Request: Invalid input data
  - 401 Unauthorized: User not authenticated
  - 404 Not Found: Prompt doesn't exist or doesn't belong to the user
  - 409 Conflict: A prompt with the updated name already exists for this user
  - 500 Internal Server Error: Unexpected error during processing

## 5. Data Flow

1. Authenticate user from request (using locals.user)
2. Extract and validate prompt ID from URL parameters
3. Validate request body using Zod schema
4. Extract parameters from the prompt content
5. Check if the prompt exists and belongs to the user
6. Update the prompt record in the database
7. Update prompt-tag associations (if tags provided)
8. Retrieve associated tags data
9. Return the complete updated prompt with tags

## 6. Security Considerations

- **Authentication**: Verify user is authenticated through Astro middleware
- **Authorization**: Verify user owns the prompt they're trying to update
- **Input Validation**: Validate all inputs using Zod schemas
- **Row Level Security**: Supabase RLS policies ensure users can only update their own prompts
- **Error Messages**: Avoid exposing sensitive information in error messages

## 7. Error Handling

| Error Case                         | Status Code | Response                                                                   |
| ---------------------------------- | ----------- | -------------------------------------------------------------------------- |
| User not authenticated             | 401         | `{ "message": "Unauthorized" }`                                            |
| Invalid prompt ID format           | 400         | `{ "message": "Invalid prompt ID format", "error": [...] }`                |
| Invalid request body               | 400         | `{ "message": "Invalid input", "error": [...] }`                           |
| Prompt not found                   | 404         | `{ "message": "Prompt not found" }`                                        |
| Name conflict with existing prompt | 409         | `{ "message": "A prompt with this name already exists for your account" }` |
| Unexpected error                   | 500         | `{ "message": "Internal Server Error" }`                                   |

## 8. Performance Considerations

- **Database Operations**: Multiple database operations are needed (check, update prompt, delete tags, add tags, get tags)
- **Parameter Extraction**: Use efficient regex for extracting parameters from content
- **Error Logging**: Log errors for monitoring without exposing sensitive information in responses

## 9. Implementation Steps

1. Create the `updatePromptSchema` using Zod for input validation
2. Update the prompt repository with a function to update prompts
   - Check if prompt exists and belongs to user
   - Update the prompt details
   - Handle tag associations
   - Return the updated prompt with tags
3. Add an update method to the prompt service
   - Validate input
   - Extract parameters from content
   - Call repository function
   - Handle specific error cases
4. Implement the PATCH handler in `/api/prompts/[id].ts`
   - Authentication check
   - Parameter validation
   - Request body validation
   - Call service method
   - Handle success and error responses
5. Create utility function to extract parameters from prompt content
6. Add appropriate exception types for error handling
