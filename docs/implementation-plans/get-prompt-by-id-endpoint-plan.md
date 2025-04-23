# API Endpoint Implementation Plan: GET /api/prompts/:id

## 1. Endpoint Overview

This endpoint retrieves a specific prompt belonging to the authenticated user, identified by its unique ID. It returns the prompt's details along with any associated tags.

## 2. Request Details

- **HTTP Method:** `GET`
- **URL Structure:** `/api/prompts/:id`
- **Parameters:**
  - **Required:**
    - `id` (URL path parameter): The UUID of the prompt to retrieve.
  - **Optional:** None
- **Request Body:** None

## 3. Types Used

- `PromptDto` (from `src/shared/types/types.ts`): Defines the structure of the response body.
- `TagDto` (from `src/shared/types/types.ts`): Defines the structure of tags within the `PromptDto`.
- `z.string().uuid()` (from Zod): Used for validating the `id` path parameter.

## 4. Response Details

- **Success (200 OK):**
  - **Body:** `PromptDto`
  ```json
  {
    "id": "uuid",
    "name": "Prompt Name",
    "description": "Optional description",
    "content": "Prompt content with {{parameters}}",
    "parameters": [{ "name": "parameter_name", "type": "short-text" }],
    "created_at": "ISO8601 Timestamp",
    "updated_at": "ISO8601 Timestamp",
    "tags": [{ "id": "uuid", "name": "Tag Name" }]
  }
  ```
- **Error:**
  - `400 Bad Request`: If the provided `id` is not a valid UUID.
  - `401 Unauthorized`: If the request lacks valid authentication credentials. (Handled by Supabase Auth middleware).
  - `404 Not Found`: If no prompt with the specified `id` exists for the authenticated user.
  - `500 Internal Server Error`: If a database error or other unexpected server error occurs.

## 5. Data Flow

1.  An authenticated `GET` request is made to `/api/prompts/:id`.
2.  The Astro API route handler extracts the `id` parameter from the URL.
3.  The handler validates that `id` is a valid UUID using Zod. If invalid, return 400.
4.  The handler retrieves the authenticated user's ID from the Supabase context. If no user, return 401 (typically handled by middleware).
5.  The handler calls the `PromptService.getPromptById(userId, promptId)` method.
6.  The `PromptService` calls the `PromptRepository.findById(userId, promptId)` method.
7.  The `PromptRepository` executes a Supabase query to fetch the prompt with the given `id` and `user_id`. This query should join `prompts` with `prompt_tags` and `tags` to retrieve associated tag information (`id`, `name`). RLS policies automatically enforce the `user_id` check.
    ```sql
    -- Example SQL (Conceptual - Supabase client handles this)
    SELECT
        p.id, p.name, p.description, p.content, p.parameters, p.created_at, p.updated_at,
        COALESCE(
            json_agg(json_build_object('id', t.id, 'name', t.name)) FILTER (WHERE t.id IS NOT NULL),
            '[]'::json
        ) as tags
    FROM prompts p
    LEFT JOIN prompt_tags pt ON p.id = pt.prompt_id
    LEFT JOIN tags t ON pt.tag_id = t.id
    WHERE p.id = $1 -- promptId parameter
      AND p.user_id = $2 -- userId parameter (implicitly handled by RLS)
    GROUP BY p.id;
    ```
8.  If the query returns no result (due to not found or RLS), the repository returns `null`.
9.  The `PromptService` checks the result. If `null`, it throws a `NotFoundException`.
10. If a prompt is found, the `PromptService` formats the data into a `PromptDto` (ensuring `parameters` and `tags` are correctly structured, potentially handling nulls/empty arrays) and returns it.
11. The API route handler catches potential exceptions:
    - `NotFoundException` -> Return 404.
    - Other unexpected errors -> Log the error and return 500.
12. If successful, the handler returns a 200 OK response with the `PromptDto` in the body.

## 6. Security Considerations

- **Authentication:** Handled by Supabase Auth. The API route must ensure it's accessed only by authenticated users.
- **Authorization:** Primarily handled by PostgreSQL Row Level Security (RLS) policies on the `prompts`, `tags`, and `prompt_tags` tables. These policies ensure users can only query data they own (`auth.uid() = user_id`).
- **Input Validation:** The `id` path parameter must be validated as a UUID to prevent potential issues or malformed queries.
- **Data Exposure:** The `PromptDto` should only include fields intended for the client, excluding sensitive information.

## 7. Error Handling

- **Invalid UUID:** Validate `id` using Zod. Return 400 Bad Request with a descriptive error message.
- **Not Found:** If the `PromptRepository` returns `null` (prompt doesn't exist or RLS prevents access), the `PromptService` should signal this (e.g., throw a custom `NotFoundException`), and the handler should return 404 Not Found.
- **Database/Server Errors:** Catch unexpected errors during database interaction or processing. Log the error details server-side and return a generic 500 Internal Server Error response.
- **Authentication Errors:** Rely on Supabase middleware/integration to handle unauthenticated requests (usually resulting in a 401 Unauthorized).

## 8. Performance Considerations

- **Database Indexing:** Ensure indexes exist on `prompts.id`, `prompts.user_id`, `prompt_tags.prompt_id`, `prompt_tags.tag_id`, and `tags.id` to optimize the join query performance. The existing indexes seem sufficient.
- **Query Optimization:** The SQL query should be efficient, joining only necessary tables and selecting required columns. Using `LEFT JOIN` for tags ensures prompts without tags are still returned. The `COALESCE` and `FILTER` handle the aggregation correctly for prompts with no tags.
- **Payload Size:** The response payload size should be reasonable. If descriptions or content become extremely large, consider if pagination or selective field loading is needed in other contexts (not applicable for fetching a single item by ID).

## 9. Implementation Steps

1.  **API Route:** Create/update the Astro API route file (e.g., `src/pages/api/prompts/[id].ts`).
2.  **Authentication:** Ensure Supabase authentication is checked (likely via Astro middleware or Supabase helper functions).
3.  **Validation:** Implement Zod validation for the `id` path parameter within the API route handler.
4.  **Repository Method:**
    - Define `findById(userId: string, promptId: string): Promise<DbPromptWithTags | null>` in `PromptRepository` (where `DbPromptWithTags` is an internal type representing the raw DB result including joined tags).
    - Implement the Supabase query using the client library, performing the necessary joins and selections as described in Data Flow. RLS handles the `userId` filtering implicitly.
5.  **Service Method:**
    - Define `getPromptById(userId: string, promptId: string): Promise<PromptDto>` in `PromptService`.
    - Call `promptRepository.findById(userId, promptId)`.
    - If the result is `null`, throw a `NotFoundException`.
    - Map the `DbPromptWithTags` result to the `PromptDto`, ensuring correct formatting for `parameters` (parsing from JSONB) and `tags`.
    - Return the `PromptDto`.
6.  **Route Handler Logic:**
    - Extract and validate `id`.
    - Get `userId` from context.
    - Wrap the call to `promptService.getPromptById` in a try/catch block.
    - Handle `NotFoundException` by returning a 404 response.
    - Handle other errors by logging and returning a 500 response.
    - If successful, return a 200 response with the `PromptDto`.
