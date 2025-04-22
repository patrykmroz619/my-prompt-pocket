# API Endpoint Implementation Plan: GET /api/tags

## 1. Endpoint Overview

This endpoint retrieves a list of all tags created by the currently authenticated user. For each tag, it also includes a count of how many prompts are associated with that tag.

## 2. Request Details

- **HTTP Method:** GET
- **URL Structure:** `/api/tags`
- **Parameters:**
  - Required: None (Authentication token is implicitly required via request context/headers).
  - Optional: None
- **Request Body:** None

## 3. Types Used

- `TagDto` (from `src/shared/types/types.ts`): Used for structuring the response data for each tag.
  ```typescript
  export interface TagDto {
    id: string;
    name: string;
    prompt_count?: number; // Will be included in this endpoint's response
    created_at: string;
  }
  ```
  _Note: The current `tags` table schema in `db-plan.md` does not include an `updated_at` column. This plan assumes we either add `updated_at` to the `tags` table or adjust the `TagDto` (or response mapping) to omit it for this endpoint._

## 4. Response Details

- **Success (200 OK):**
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "Tag Name 1",
        "prompt_count": 5,
        "created_at": "iso_timestamp",
        "updated_at": "iso_timestamp" // Or omitted if not added to DB
      },
      {
        "id": "uuid",
        "name": "Tag Name 2",
        "prompt_count": 0,
        "created_at": "iso_timestamp",
        "updated_at": "iso_timestamp" // Or omitted if not added to DB
      }
      // ... other tags
    ]
  }
  ```
- **Error (401 Unauthorized):** Returned if the user is not authenticated.
- **Error (500 Internal Server Error):** Returned for database errors or other unexpected server issues.

## 5. Data Flow

1.  An authenticated GET request is made to `/api/tags`.
2.  Astro's API route handler receives the request.
3.  Authentication middleware (or context logic) verifies the user's session and extracts the `user_id`. If authentication fails, return 401.
4.  The route handler calls the `TagsService.getTagsForUser(userId)` method.
5.  The `TagsService` calls the `TagsRepository.findTagsByUserIdWithPromptCount(userId)` method.
6.  The `TagsRepository` executes a SQL query against the Supabase (PostgreSQL) database. This query:
    - Selects `id`, `name`, `created_at` from the `tags` table.
    - Filters tags where `user_id` matches the authenticated user's ID.
    - Performs a LEFT JOIN with the `prompt_tags` table on `tags.id = prompt_tags.tag_id`.
    - Groups the results by tag (`tags.id`, `tags.name`, `tags.created_at`).
    - Counts the number of associated prompts (`COUNT(prompt_tags.prompt_id)`) for each tag, aliased as `prompt_count`.
    - Orders the results (e.g., by name or created_at, default could be name ascending).
7.  The repository maps the raw database results into an array of objects matching the required data structure (including `prompt_count`).
8.  The `TagsService` receives the data array from the repository. It might perform additional mapping if needed (e.g., formatting dates) to align with `TagDto`.
9.  The API route handler receives the `TagDto[]` array from the service.
10. The handler formats the final JSON response `{ "data": tagsArray }` and sends it back with a 200 OK status.

## 6. Security Considerations

- **Authentication:** The endpoint must be protected, accessible only to authenticated users. This will be handled by Supabase Auth integration within the Astro application context/middleware.
- **Authorization:** The database query _must_ filter tags based on the `auth.uid()` or the `user_id` passed from the authenticated context. Supabase Row Level Security (RLS) policies (`select_own_tags` on `tags` and `select_own_prompt_tags` on `prompt_tags`) provide an additional layer of defense, ensuring users can only query data they own.
- **Data Validation:** No user input parameters require validation beyond authentication.

## 7. Error Handling

- **Unauthenticated Access:** Middleware/context handler should return a 401 Unauthorized response.
- **Database Errors:** Any errors during the database query (connection issues, syntax errors, RLS violations if misconfigured) should be caught in the repository or service layer. Log the detailed error internally and return a generic 500 Internal Server Error response to the client.
- **Unexpected Server Errors:** Any other unexpected errors in the service or route handler should also result in internal logging and a 500 Internal Server Error response.

## 8. Performance Considerations

- **Database Indexing:** Ensure indexes exist on `tags.user_id` (already planned) and potentially `prompt_tags.tag_id` (already planned) to optimize the filtering and join operations.
- **Query Optimization:** The query involves a join and aggregation (COUNT). For users with a very large number of tags or prompts, this could become slow. Monitor performance. If necessary, consider denormalizing the `prompt_count` onto the `tags` table (updated via triggers), although this adds complexity. For now, the join/count approach is standard.
- **Pagination:** The current specification doesn't require pagination. If users are expected to have thousands of tags, pagination should be added later using query parameters (`page`, `page_size`).

## 9. Implementation Steps

1.  **(Optional but Recommended):** Add an `updated_at` column with `DEFAULT now()` and an update trigger to the `tags` table in `db-plan.md` and the actual database schema if consistency with `PromptDto` is desired.
2.  **Create/Update Repository (`src/modules/tags/server/repositories/tagsRepository.ts`):**
    - Define a method `findTagsByUserIdWithPromptCount(userId: string): Promise<TagDto[]>`.
    - Implement the SQL query using the Supabase client, incorporating the join with `prompt_tags` and the `COUNT` aggregation.
    - Handle potential database errors.
    - Map the query results to the `TagDto` structure (or an intermediate type).
3.  **Create/Update Service (`src/modules/tags/server/services/TagsService.ts`):**
    - Define a method `getTagsForUser(userId: string): Promise<TagDto[]>`.
    - Inject or instantiate `TagsRepository`.
    - Call `tagsRepository.findTagsByUserIdWithPromptCount(userId)`.
    - Perform any necessary data transformations (e.g., date formatting if not handled by the DB/client).
    - Return the list of `TagDto`.
4.  **Create API Route Handler (`src/pages/api/tags/index.ts`):**
    - Define the `GET` handler function.
    - Access the authenticated user's ID from the Astro API context (`Astro.locals.user.id` or similar, depending on auth setup). If no user, return a 401 response.
    - Instantiate `TagsService`.
    - Call `tagsService.getTagsForUser(userId)`.
    - Wrap the result in the `{ "data": ... }` structure.
    - Return a JSON response with status 200.
    - Include try/catch blocks to handle errors from the service layer, log them, and return a 500 response.
