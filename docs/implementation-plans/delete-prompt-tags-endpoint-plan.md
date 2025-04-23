# API Endpoint Implementation Plan: DELETE /api/prompt-tags

1. Endpoint Overview

   - Purpose: Remove an association between a prompt and a tag for a specific user.
   - Functionality: Validates user permissions and deletes the prompt_tags record.

2. Request Details
   HTTP Method: DELETE
   URL Structure: `/api/prompt-tags`
   Parameters:

   - Required:
     - `prompt_id` (uuid)
     - `tag_id` (uuid)
   - Optional: None
     Request Body:

   ```json
   {
     "prompt_id": "uuid",
     "tag_id": "uuid"
   }
   ```

3. Types Used

   - DTOs/Commands:
     - `AssignPromptToTagCommand` (reuse for input): `{ prompt_id: string; tag_id: string }`
     - Validation Schema: Zod schema matching `{ prompt_id: uuid, tag_id: uuid }`

4. Response Details

   - Success: `204 No Content`
   - Errors:
     - `400 Bad Request`: invalid input
     - `401 Unauthorized`: missing or invalid auth
     - `404 Not Found`: association not found
     - `500 Internal Server Error`: database or server error

5. Data Flow

   1. Client sends DELETE request with body and auth token.
   2. API endpoint middleware extracts and verifies user session via Supabase Auth.
   3. Body is validated against Zod schema.
   4. Service layer calls repository to delete the record from `prompt_tags` using Supabase client.
      - Query: `.delete().eq('prompt_id', promptId).eq('tag_id', tagId)`
   5. Supabase RLS ensures user owns the prompt.
   6. If deletion count is 0, throw 404.
   7. Return 204.

6. Security Considerations

   - Authentication: require valid Supabase session.
   - Authorization: RLS policies enforce user ownership of prompt.
   - Input validation with Zod prevents injection.

7. Error Handling

   - Validation errors: catch Zod errors, return 400 with details.
   - Auth errors: if no session, return 401.
   - Not found: if delete count is 0, return 404.
   - Unexpected errors: log and return 500.
   - Error Logging: insert into `errors` table with context (endpoint, user_id, error).

8. Performance Considerations

   - Deletion is single-row operation with index on `prompt_id, tag_id`.
   - RLS adds negligible overhead.
   - No additional joins or scans.

9. Implementation Steps
   1. Define Zod schema in `src/shared/schemas/prompt-schemas.ts` for delete request.
   2. Add `removePromptTag` function in `src/modules/prompts/server/repositories/prompt-tags-repo.ts`:
      - Use Supabase client to delete record.
      - Return deleteCount.
   3. Create service `src/modules/prompts/server/services/prompt-tags-service.ts`:
      - Function `deletePromptTag(cmd: RemovePromptTagCommand, ctx: IRequestContext)` calls repo and handles not found.
   4. Implement endpoint in `src/pages/api/prompt-tags.ts`:
      - Handler for DELETE: parse JSON, validate, get user from context, call service, send 204.
   5. Ensure middleware authenticates via Supabase, injects `IRequestContext`.
   6. Add error logging util in `src/shared/utils/error-logger.ts`, and call in catch blocks.
   7. Write unit tests for validation, service, and repository.
   8. Write E2E test in `e2e/delete-prompt-tags.spec.ts` to cover success and failures.
