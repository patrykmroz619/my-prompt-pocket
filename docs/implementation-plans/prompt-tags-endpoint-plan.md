# API Endpoint Implementation Plan: Prompt Tags Association Endpoint

1. Endpoint Overview
   This endpoint associates a tag with a prompt. It accepts a JSON payload containing a prompt_id and a tag_id, validates the input, ensures that both the prompt and tag exist and belong to the authenticated user, and creates a new record in the prompt_tags table. A successful operation returns the associated IDs along with the prompt and tag names.

2. Request Details
   **HTTP Method:** POST
   **URL:** /api/prompt-tags
   **Parameters:**

   - **Required:**
     - prompt_id (uuid)
     - tag_id (uuid)
       **Request Body:**

   ```json
   {
     "prompt_id": "uuid",
     "tag_id": "uuid"
   }
   ```

3. Types Used

   - **DTO / Command Model:**
     - AssignPromptToTagCommand (defined in types.ts)
     - PromptTagDto (response DTO defined in types.ts)

4. Response Details
   **Success:**

   - HTTP Status: 201 Created
   - Response Body:
     ```json
     {
       "prompt_id": "uuid",
       "tag_id": "uuid",
       "prompt_name": "Prompt Name",
       "tag_name": "Tag Name"
     }
     ```
     **Errors:**
   - 400 Bad Request: For invalid input payload
   - 404 Not Found: If either the prompt or tag does not exist
   - 409 Conflict: If the association already exists
   - 401 Unauthorized: If the user is not authenticated
   - 500 Internal Server Error: For unhandled server errors

5. Data Flow

   - Validate the incoming JSON payload against the AssignPromptToTagCommand schema.
   - Verify that the prompt exists and belongs to the authenticated user by querying the prompts table.
   - Verify that the tag exists and belongs to the authenticated user by querying the tags table.
   - Check if the association already exists in the prompt_tags table; if yes, return a 409 Conflict.
   - If validations pass, insert the new record into prompt_tags.
   - Retrieve additional information (prompt_name and tag_name) for the response.
   - Return a 201 Created response with the final DTO.

6. Security Considerations

   - Use authentication middleware to ensure the request is from an authenticated user.
   - Enforce authorization by ensuring that the prompt and tag being associated belong to the authenticated user.
   - Validate input strictly with Zod schemas according to backend rules.
   - Leverage existing Postgres RLS policies to prevent unauthorized access and modifications.

7. Error Handling

   - **400 Bad Request:** Return when input JSON is improperly formatted or missing required fields.
   - **404 Not Found:** Return if either the prompt or tag is not found in the database.
   - **409 Conflict:** Return if the prompt-tag association already exists.
   - **500 Internal Server Error:** Log unexpected errors and return a generic server error message.
   - Consider logging error details to an errors table if the project design includes server-side error tracking.

8. Performance Considerations

   - Use existing database indexes to optimize query performance (e.g., indexes on prompts.user_id and tags.user_id).
   - Ensure minimal database calls by efficiently querying and validating data.
   - Consider caching logic if this operation becomes a bottleneck.

9. Implementation Steps
   - Step 1: Define or update the Zod schema for the AssignPromptToTagCommand to validate the incoming request payload.
   - Step 2: In the endpoint handler, extract and validate the request body.
   - Step 3: Query the database to confirm that the prompt exists and that it belongs to the authenticated user.
   - Step 4: Query the tags table to confirm that the tag exists and that it belongs to the authenticated user.
   - Step 5: Check for an existing association in the prompt_tags table; if found, return a 409 Conflict error.
   - Step 6: Insert the new prompt-tag association into the prompt_tags table.
   - Step 7: Retrieve the prompt name and tag name to construct the response DTO.
   - Step 8: Return a 201 Created response with the association data.
   - Step 9: Implement error handling for each failure scenario and log unexpected issues.

Happy coding!
