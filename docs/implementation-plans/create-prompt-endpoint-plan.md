# API Endpoint Implementation Plan: POST /api/prompts

## 1. Endpoint Overview

This endpoint allows users to create a new prompt in their personal prompt library. It handles validation of the prompt data, extraction of parameters from the content, and association with specified tags.

## 2. Request Details

- **HTTP Method**: POST
- **URL**: /api/prompts

- **Parameters**:

  - **Required**:
    - `name`: String (1-100 characters)
    - `content`: String (non-empty)
  - **Optional**:
    - `description`: String or null (0-1000 characters)
    - `parameters`: Array of parameter objects with name and type
    - `tags`: Array of tag UUIDs

- **Request Body**:

  ```json
  {
    "name": "Prompt Name",
    "description": "Optional description",
    "content": "Prompt content with {{parameters}}",
    "tags": ["uuid-1", "uuid-2"],
    "parameters": [{ "name": "parameters", "type": "short-text" }]
  }
  ```

## 3. Types Used

The endpoint will utilize the following types from the existing type definitions:

```typescript
// CreatePromptCommand - For request validation and handling
interface CreatePromptCommand {
  name: string;
  description?: string | null;
  content: string;
  parameters?: PromptParameter[];
  tags?: string[];
}

// PromptDto - For response formatting
interface PromptDto {
  id: string;
  name: string;
  description: string | null;
  content: string;
  parameters: PromptParameter[];
  created_at: string;
  updated_at: string;
  tags: TagDto[];
}

// PromptParameter - For parameter validation
interface PromptParameter {
  name: string;
  type: PromptParameterType;
}
```

## 4. Response Details

- **Success Response**:

  - Status: 201 Created
  - Body: PromptDto object including the created prompt with its ID, timestamps, and associated tag details

- **Error Responses**:
  - 400 Bad Request: Invalid input (validation failed)
  - 400 Bad Request: Missing parameter types
  - 409 Conflict: Prompt name already exists for user
  - 401 Unauthorized: User not authenticated
  - 500 Internal Server Error: Server-side errors

## 5. Data Flow

1. Request arrives at the Astro API route
2. Request body is validated using Zod schema
3. Parameters in content are extracted and compared with provided parameter definitions
4. Extract parameters from content and validate against provided definitions in the request body
5. Existence of specified tags is verified (all should belong to the user)
6. Check for name uniqueness for the current user
7. Database transaction is started:
   - Insert new prompt into the `prompts` table
   - Associate prompt with tags in the `prompt_tags` table
8. Format and return response with detailed prompt information

## 6. Security Considerations

- **Authentication**: Ensure user is authenticated via Supabase auth
- **Input Validation**: Thorough validation of all input fields using Zod
- **Parameter Extraction**: Safely parse and extract parameters from content

## 7. Error Handling

- **Validation Errors**: Return 400 with specific validation error messages
- **Missing Parameters**: If parameters appear in content without type definitions, return 400
- **Name Conflict**: If prompt name already exists for user, return 409
- **Database Errors**: Catch and log database exceptions, return 500 with generic error message
- **Auth Errors**: Middleware will handle 401 responses for unauthenticated requests

## 8. Performance Considerations

- **Parameter Extraction**: Use efficient regex for parameter extraction
- **Query Optimization**: Retrieve tag details in a single query after prompt creation

## 9. Implementation Steps

1. **Create API Route File**:
   Create `src/pages/api/prompts/index.ts` for handling POST requests

2. **Define Zod Schema**:

   ```typescript
   const createPromptSchema = z.object({
     name: z.string().min(1).max(100),
     description: z.string().max(1000).nullable().optional(),
     content: z.string().min(1),
     parameters: z
       .array(
         z.object({
           name: z.string().min(1),
           type: z.enum(["short-text", "long-text"]),
         })
       )
       .optional(),
     tags: z.array(z.string().uuid()).optional(),
   });
   ```

3. **Implement Parameter Extraction**:
   Create a utility function to extract parameters from content using regex

4. **Create POST Handler**:

   - Validate request body against schema
   - Extract parameters from content
   - Check for missing parameter definitions
   - Validate tag existence
   - Check for name uniqueness
   - Insert prompt record
   - Associate with tags
   - Return formatted response

5. **Error Handling Implementation**:
   Add try/catch blocks with appropriate error responses
