# API Endpoint Implementation Plan: POST /api/tags

## 1. Endpoint Overview

This endpoint allows users to create a new tag in their personal tag library. It handles validation of the tag data, checks for uniqueness within the user's tags, and properly inserts the record into the database.

## 2. Request Details

- **HTTP Method**: POST
- **URL**: /api/tags

- **Parameters**:

  - **Required**:
    - `name`: String (1-50 characters)
  - **Optional**: None

- **Request Body**:

  ```json
  {
    "name": "Tag Name"
  }
  ```

## 3. Types Used

The endpoint will utilize the following types from the existing type definitions:

```typescript
// CreateTagCommand - For request validation and handling
interface CreateTagCommand {
  name: string;
}

// TagDto - For response formatting
interface TagDto {
  id: string;
  name: string;
  prompt_count?: number;
  created_at: string;
  updated_at: string;
}
```

## 4. Response Details

- **Success Response**:

  - Status: 201 Created
  - Body: TagDto object including the created tag with its ID, timestamps, and prompt count (0 for new tags)

- **Error Responses**:
  - 400 Bad Request: Invalid input (e.g., name too long or empty)
  - 409 Conflict: Tag name already exists for user
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Server-side errors

## 5. Data Flow

1. Request arrives at the Astro API route
2. Request body is validated using Zod schema
3. Check for tag name uniqueness for the current user
4. Insert new tag into the `tags` table with user_id from the authenticated user
5. Retrieve the newly created tag with all required fields
6. Format and return response with detailed tag information

## 6. Security Considerations

- **Authentication**: Ensure user is authenticated via Supabase auth
- **Input Validation**: Thorough validation of all input fields using Zod
- **SQL Injection Prevention**: Use parameterized queries through Supabase SDK
- **Data Sanitization**: Sanitize input to prevent XSS attacks

## 7. Error Handling

- **Validation Errors**: Return 400 with specific validation error messages
- **Name Conflict**: If tag name already exists for user, return 409
- **Database Errors**: Catch and log database exceptions, return 500 with generic error message
- **Auth Errors**: Middleware will handle 401 responses for unauthenticated requests

## 8. Performance Considerations

- **Database Index**: Ensure the (user_id, name) combination is properly indexed
- **Query Optimization**: Minimize database roundtrips

## 9. Implementation Steps

1. **Create API Route File**:
   Create `src/pages/api/tags/index.ts` for handling POST requests

2. **Create Tag Service**:
   Create a tag service in the proper module structure

3. **Define Zod Schema**:

   ```typescript
   const createTagSchema = z.object({
     name: z.string().min(1).max(50),
   });
   ```

4. **Create Repository Functions**:
   Implement functions to check tag existence and create new tags

5. **Implement POST Handler**:

   - Validate request body against schema
   - Check for tag name uniqueness
   - Insert tag record
   - Return formatted response

6. **Error Handling Implementation**:
   Add try/catch blocks with appropriate error responses
