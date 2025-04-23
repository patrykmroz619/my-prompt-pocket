# API Endpoint Implementation Plan: GET /api/prompts

## 1. Endpoint Overview

This endpoint retrieves a paginated, filterable, and sortable list of prompts belonging to the currently authenticated user. It allows filtering by prompt name and associated tags.

## 2. Request Details

- **HTTP Method:** GET
- **URL Structure:** `/api/prompts`
- **Query Parameters:**
  - **Optional:**
    - `search` (string): Filters prompts where the name contains the provided string (case-insensitive).
    - `tags` (string): Comma-separated list of tag UUIDs. Returns prompts associated with _all_ specified tags.
    - `page` (number): The page number for pagination. Default: `1`. Must be >= 1.
    - `page_size` (number): The number of prompts per page. Default: `20`. Must be > 0, Max: `100`.
    - `sort_by` (string): Field to sort prompts by. Allowed values: `name`, `created_at`, `updated_at`. Default: `updated_at`.
    - `sort_dir` (string): Sort direction. Allowed values: `asc`, `desc`. Default: `desc`.
- **Request Body:** None

## 3. Types Used

- `PromptFilterParams` (Input validation schema based on this type)
- `PromptDto` (Response data structure)
- `TagDto` (Nested within `PromptDto`)
- `PaginatedResponse<PromptDto>` (Overall response structure)
- `PaginationInfo` (Pagination metadata within the response)

## 4. Data Flow

1. The API route handler receives the GET request.
2. Authentication is verified (handled by Supabase middleware/RLS).
3. Query parameters are extracted from the URL.
4. A Zod schema based on `PromptFilterParams` validates the query parameters (types, ranges, allowed values). Default values are applied if parameters are missing.
5. If validation fails, a 400 Bad Request response is returned with error details.
6. The validated `PromptFilterParams` and the authenticated `user_id` are passed to the `PromptService`.
7. The `PromptService` calls the `PromptRepository`'s `findMany` method (or similar) with the filter, pagination, sorting criteria, and `user_id`.
8. The `PromptRepository` constructs a Supabase query:
   - Selects prompts matching the `user_id`.
   - Applies `ILIKE` filter for `search` on the `name` column.
   - Filters prompts based on `tag_ids` using joins with `prompt_tags` and `tags` tables (ensuring the prompt has _all_ specified tags).
   - Applies sorting based on `sort_by` and `sort_dir`.
   - Applies pagination using `limit` (`page_size`) and `offset` (`(page - 1) * page_size`).
   - Fetches associated tags for each prompt.
   - Executes a separate query to get the `total_items` count matching the filters (without pagination).
9. The `PromptRepository` returns the list of prompts (with their tags) and the total count to the `PromptService`.
10. The `PromptService` calculates pagination details (`total_pages`, `current_page`, etc.).
11. The `PromptService` formats the data into the `PaginatedResponse<PromptDto>` structure.
12. The API route handler sends the `PaginatedResponse` with a 200 OK status code.

## 5. Security Considerations

- **Authentication:** Ensure requests are authenticated. Supabase Auth handles this.
- **Authorization:** Supabase Row Level Security (RLS) policies on `prompts`, `tags`, and `prompt_tags` tables _must_ be active and correctly configured to ensure users can only access their own data. The existing policies seem appropriate.
- **Input Validation:** Rigorously validate all query parameters (`page`, `page_size`, `sort_by`, `sort_dir`, `search`, `tags`) using Zod to prevent invalid data types, ranges, or potential injection vectors (though Supabase client handles parameterization). Sanitize the `search` string if necessary, although parameterized queries are the primary defense. Validate `tags` are valid UUIDs.
- **Rate Limiting:** Consider implementing rate limiting on the API gateway or middleware level to prevent abuse.
- **Data Exposure:** Ensure only necessary fields defined in `PromptDto` and `TagDto` are returned.

## 6. Error Handling

- **400 Bad Request:**
  - Invalid `page` or `page_size` (e.g., non-integer, <= 0, `page_size` > max limit).
  - Invalid `sort_by` value (not one of the allowed fields).
  - Invalid `sort_dir` value (not `asc` or `desc`).
  - Invalid format for `tags` (e.g., not comma-separated, contains non-UUID values).
  - Response body should detail the validation errors.
- **401 Unauthorized:** If the request lacks valid authentication credentials (handled by Supabase/middleware).
- **500 Internal Server Error:**
  - Database connection errors.
  - Unexpected errors during query execution in the repository.
  - Errors in the service layer during data processing.
  - Log these errors server-side for debugging. Return a generic error message to the client.

## 7. Performance Considerations

- **Database Indexing:** Ensure indexes exist on `prompts(user_id)`, `prompts(user_id, name)`, `prompts(user_id, created_at)`, `prompts(user_id, updated_at)`, `prompt_tags(prompt_id)`, `prompt_tags(tag_id)`, and `tags(id)`. The `db-plan.md` indicates appropriate indexes are planned.
- **Query Optimization:** The query to fetch prompts with tags and filtering by multiple tags can become complex. Analyze the generated SQL query for efficiency, especially the join conditions for tag filtering. Consider if fetching tags separately per prompt is more efficient than a complex join, depending on the expected number of tags per prompt.
- **Pagination:** Always use database-level pagination (`LIMIT`/`OFFSET`) to avoid loading large datasets into memory.
- **Total Count Query:** The query to get the `total_items` count should be optimized to only count rows matching the filters, without fetching the actual data.
- **Payload Size:** Limit `page_size` to a reasonable maximum (e.g., 100) to keep response payloads manageable.

## 8. Implementation Steps

1. **Define Zod Schema:** Create a Zod schema in `/src/modules/prompts/shared/schemas/prompt.schemas.ts` (or similar) to validate the `PromptFilterParams` (query parameters `search`, `tags`, `page`, `page_size`, `sort_by`, `sort_dir`), including default values and constraints (min/max for pagination, enum for sort fields/directions, regex/UUID validation for tags).
2. **Update `PromptRepository`:**
   - Located in `/src/modules/prompts/server/repositories/PromptRepository.ts`.
   - Implement a method like `findMany(userId: string, filters: ValidatedPromptFilterParams): Promise<{ prompts: PromptWithTags[], totalCount: number }>`.
   - This method will use the Supabase client to build and execute the database query based on the provided filters, sorting, and pagination.
   - Handle joining `prompts` with `prompt_tags` and `tags` to filter by `tag_ids` and retrieve associated tag names. Ensure the logic correctly filters for prompts having _all_ specified tags.
   - Execute a separate `count` query with the same filters (excluding pagination and sorting specifics irrelevant to count) to get `totalCount`.
   - Map the database results to an internal representation (e.g., `PromptWithTags`).
3. **Update `PromptService`:**
   - Located in `/src/modules/prompts/server/services/PromptService.ts`.
   - Implement a method like `getPrompts(userId: string, filters: ValidatedPromptFilterParams): Promise<PaginatedResponse<PromptDto>>`.
   - Call the `PromptRepository.findMany` method.
   - Calculate pagination metadata (`total_pages`, `current_page`, etc.) based on `totalCount`, `page`, and `page_size`.
   - Map the repository results (e.g., `PromptWithTags[]`) to `PromptDto[]`.
   - Construct and return the `PaginatedResponse<PromptDto>` object.
4. **Create API Route Handler:**
   - Create the Astro API route file at `/src/pages/api/prompts/index.ts`.
   - Define the `GET` handler function.
   - Retrieve the authenticated user's ID (e.g., from `Astro.locals.user.id`). If no user, return 401.
   - Extract query parameters from `Astro.url.searchParams`.
   - Use the Zod schema defined in Step 1 to parse and validate the query parameters. Handle potential validation errors by returning a 400 response.
   - Instantiate `PromptService`.
   - Call `promptService.getPrompts` with the `userId` and validated filter parameters.
   - Handle potential errors from the service (e.g., database errors) by returning a 500 response.
   - Return the `PaginatedResponse` from the service as a JSON response with a 200 status code.
5. **Unit/Integration Tests:**

   - Write tests for the Zod schema validation.
   - Write tests for the `PromptRepository` (potentially mocking the Supabase client) to verify query construction for different filter combinations.
   - Write tests for the `PromptService` to verify data mapping and pagination calculation.
   - Write integration tests for the API endpoint using tools like Vitest or MSW to mock dependencies and verify request handling, validation, and response structure.

6. **Documentation:** Update any relevant API documentation (e.g., Swagger/OpenAPI specs if used) to reflect the implemented endpoint.
