# API Endpoint Implementation Plan: PATCH /api/tags/:id

## 1. Endpoint Overview

This endpoint allows users to update the name of an existing tag. The operation ensures the tag exists, belongs to the requesting user, and that the new name doesn't conflict with existing tag names for that user (enforcing uniqueness per user).

## 2. Request Details

- **HTTP Method**: PATCH
- **URL Structure**: `/api/tags/:id`
- **Parameters**:
  - **Required Path Parameter**: `id` (UUID of the tag to update)
- **Request Body**:
  ```json
  {
    "name": "Updated Tag Name"
  }
  ```
- **Headers**:
  - `Authorization`: Bearer token for user authentication

## 3. Types Used

- **UpdateTagCommand**: Object containing the updated tag name
- **TagDto**: Response object with tag details including updated_at field

## 4. Response Details

- **Success Response (200 OK)**:

  ```json
  {
    "id": "uuid",
    "name": "Updated Tag Name",
    "prompt_count": 0,
    "created_at": "2023-06-15T10:30:00Z",
    "updated_at": "2023-06-15T11:45:00Z"
  }
  ```

- **Error Responses**:
  - 400 Bad Request: Invalid input
  - 401 Unauthorized: User not authenticated
  - 404 Not Found: Tag not found
  - 409 Conflict: Tag name already exists for user
  - 500 Internal Server Error: Unexpected server error

## 5. Data Flow

1. Receive PATCH request at `/api/tags/:id`
2. Authenticate user using Supabase Auth
3. Validate request body using Zod schema
4. Check if tag exists and belongs to the authenticated user
5. Check if the new tag name already exists for this user (excluding the current tag)
6. Update tag name in the database
7. Return updated tag information including prompt count

## 6. Security Considerations

- **Authentication**: Ensure request includes valid JWT token
- **Authorization**: Verify tag belongs to the authenticated user before updating
- **Input Validation**:
  - Use Zod schema to validate request body
  - Ensure tag name length matches database constraints (≤ 50 characters)
- **SQL Injection Prevention**: Use parameterized queries via Supabase SDK

## 7. Error Handling

- **Input Validation Errors** (400 Bad Request):
  - Missing tag name
  - Tag name exceeds maximum length
  - Invalid tag name format
- **Authentication Errors** (401 Unauthorized):
  - Missing or invalid authentication token
- **Resource Errors** (404 Not Found):
  - Tag ID doesn't exist
  - Tag belongs to a different user
- **Conflict Errors** (409 Conflict):
  - Tag name already exists for the authenticated user
- **Server Errors** (500 Internal Server Error):
  - Database connection issues
  - Unexpected exceptions during processing

## 8. Performance Considerations

- Use indexed queries for checking tag existence and uniqueness
- Combine database operations where possible to minimize round trips
- Use the Supabase PostgreSQL database's built-in constraints for enforcing uniqueness
- Consider adding appropriate caching headers for API responses

## 9. Implementation Steps

1. **Create Zod Schema for Request Validation**

   - Implement schema to validate UpdateTagCommand
   - Include rules for tag name length and format

2. **Implement Tag Repository Functions**

   - Create/update function to check if tag exists and belongs to user
   - Create/update function to check if tag name exists for user (excluding current tag)
   - Create/update function to update tag name

3. **Implement Tag Service**

   - Create updateTag service function that orchestrates:
     - Validation logic
     - Tag existence and ownership verification
     - Tag name uniqueness check
     - Database update operation

4. **Implement API Endpoint Handler**

   - Create PATCH method in /api/tags/[id].ts Astro endpoint
   - Extract and validate user authentication
   - Parse and validate request body
   - Call tag service
   - Handle and format response based on service result

5. **Add Error Handling**
   - Implement try/catch blocks with appropriate error responses
   - Map different error types to appropriate HTTP status codes
   - Log errors for debugging purposes
