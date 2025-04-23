# API Endpoint Implementation Plan: DELETE /api/prompts/:id

## 1. Endpoint Overview

This endpoint deletes a specific prompt by its ID. It ensures the prompt exists and belongs to the authenticated user before performing the deletion.

## 2. Request Details

- **HTTP Method**: DELETE
- **URL Structure**: `/api/prompts/:id`
- **Parameters**:
  - Required: `id` (UUID of the prompt to delete, as URL parameter)
- **Authentication**: Required

## 3. Response Details

- **Success**: 204 No Content
- **Error Responses**:
  - 400 Bad Request: Invalid prompt ID format
  - 401 Unauthorized: User is not authenticated
  - 404 Not Found: Prompt doesn't exist or doesn't belong to the user
  - 500 Internal Server Error: Server-side error during deletion

## 4. Data Flow

1. User sends DELETE request to `/api/prompts/:id`
2. API validates the prompt ID format
3. API validates user authentication
4. Prompt service checks if the prompt exists and belongs to the user
5. Prompt repository executes the delete operation in the database
6. API returns 204 No Content response

## 5. Security Considerations

- **Authentication**: Endpoint ensures the user is authenticated
- **Authorization**: Service checks that the prompt belongs to the authenticated user
- **Input Validation**: Validates the prompt ID format using Zod schema
- **Supabase RLS**: Row Level Security policies provide additional security by ensuring users can only delete their own prompts

## 6. Error Handling

- Invalid UUID format: Return 400 Bad Request
- User not authenticated: Return 401 Unauthorized
- Prompt not found or doesn't belong to user: Return 404 Not Found
- Database or server error: Return 500 Internal Server Error with appropriate message

## 7. Performance Considerations

- The delete operation is lightweight as it only requires removing a single record
- The Row Level Security policies in Supabase handle authorization efficiently
- Since the `prompt_tags` table has ON DELETE CASCADE reference, related tag associations will be automatically removed

## 8. Implementation Steps

1. Create or extend the prompt repository with a delete function
2. Create or extend the prompt service with a delete function that uses the repository
3. Create custom error class for "Prompt Not Found" scenarios if it doesn't exist
4. Implement the DELETE handler in the Astro API endpoint
5. Add authentication check using the auth utility functions
6. Implement input validation using Zod schema
7. Add error handling for various scenarios
