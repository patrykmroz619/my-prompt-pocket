# API Endpoint Implementation Plan: DELETE /api/tags/:id

## 1. Endpoint Overview

This endpoint allows users to delete a specific tag from their collection. When a tag is deleted, any associations with prompts (in the prompt_tags table) will also be removed due to the ON DELETE CASCADE constraint on the tag_id foreign key.

## 2. Request Details

- **HTTP Method**: DELETE
- **URL Structure**: `/api/tags/:id`
- **Parameters**:
  - **id** (path parameter): UUID of the tag to delete
- **Headers**:
  - **Authorization**: Bearer token for user authentication

## 3. Types Used

```typescript
// No specific command/request DTO needed for this endpoint
// We'll use the existing TagDto for error handling contexts

interface IRequestContext {
  headers: Headers;
  cookies: AstroCookies;
}
```

## 4. Response Details

- **Success Response**:
  - **Status Code**: 204 No Content
  - **Body**: None
- **Error Responses**:
  - 401 Unauthorized: User is not authenticated
  - 404 Not Found: Tag not found or doesn't belong to the user
  - 500 Internal Server Error: Database operation failed

## 5. Data Flow

1. Extract the tag ID from the request path parameter
2. Validate the tag ID format (must be a valid UUID)
3. Authenticate the user using the request context
4. Query the database to check if the tag exists and belongs to the authenticated user
5. If tag exists and belongs to the user, delete it from the database
6. Return 204 No Content response
7. If tag does not exist or doesn't belong to the user, return 404 Not Found

## 6. Security Considerations

- **Authentication**: Verify the user is authenticated via Supabase authentication
- **Authorization**: Verify tag ownership by checking the tag's user_id against the authenticated user's ID
- **Validation**: Validate the tag ID parameter as a valid UUID
- **Database Protection**: Leverage Supabase Row Level Security (RLS) policies for an additional layer of protection

## 7. Error Handling

- **404 Not Found**:
  - Tag with specified ID doesn't exist
  - Tag exists but doesn't belong to the authenticated user
- **401 Unauthorized**:
  - Missing or invalid authentication token
- **400 Bad Request**:
  - Invalid tag ID format
- **500 Internal Server Error**:
  - Database operation failure
  - Other unexpected server errors

## 8. Performance Considerations

- The operation is relatively lightweight as it affects a single record
- Consider potential constraints:
  - If a tag is associated with many prompts, the cascade delete might impact performance
  - Monitor deletion times for tags with large numbers of associated prompts

## 9. Implementation Steps

### 9.1 Create Tag Validation Schema

```typescript
// src/modules/tags/shared/schemas/tag-schema.ts
import { z } from "zod";

export const tagIdSchema = z.string().uuid("Tag ID must be a valid UUID");
```

### 9.2 Create Tag Repository

```typescript
// src/modules/tags/server/repositories/tag-repository.ts
import { supabase } from "@/lib/supabase-server";
import type { IUser } from "@/shared/types/types";

export const deleteTag = async (tagId: string, user: IUser): Promise<boolean> => {
  const { error, count } = await supabase
    .from("tags")
    .delete()
    .match({ id: tagId, user_id: user.id })
    .select("id", { count: "exact", head: true });

  if (error) {
    console.error("Error deleting tag:", error);
    throw new Error(`Failed to delete tag: ${error.message}`);
  }

  return count === 1;
};
```

### 9.3 Create Tag Service

```typescript
// src/modules/tags/server/services/tag-service.ts
import { deleteTag } from "../repositories/tag-repository";
import type { IUser } from "@/shared/types/types";
import { tagIdSchema } from "../../shared/schemas/tag-schema";
import { TagNotFoundError } from "../exceptions/tag-exceptions";

export const deleteTagService = async (tagId: string, user: IUser): Promise<void> => {
  // Validate tag ID
  try {
    tagIdSchema.parse(tagId);
  } catch (error) {
    throw new Error("Invalid tag ID format");
  }

  // Attempt to delete the tag
  const deleted = await deleteTag(tagId, user);

  // If tag wasn't deleted (not found or not owned by user)
  if (!deleted) {
    throw new TagNotFoundError("Tag not found");
  }
};
```

### 9.4 Create Tag Exception

```typescript
// src/modules/tags/server/exceptions/tag-exceptions.ts
export class TagNotFoundError extends Error {
  constructor(message: string = "Tag not found") {
    super(message);
    this.name = "TagNotFoundError";
  }
}
```

### 9.5 Create API Route Handler

```typescript
// src/pages/api/tags/[id].ts
import type { APIRoute } from "astro";
import { deleteTagService } from "@/modules/tags/server/services/tag-service";
import { getUserFromContext } from "@/shared/utils/auth-utils";
import { TagNotFoundError } from "@/modules/tags/server/exceptions/tag-exceptions";

export const del: APIRoute = async ({ params, request }) => {
  try {
    // Get authenticated user
    const user = await getUserFromContext({ headers: request.headers, cookies: Astro.cookies });

    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract tag ID from URL
    const tagId = params.id;

    if (!tagId) {
      return new Response(JSON.stringify({ error: "Tag ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete the tag
    await deleteTagService(tagId, user);

    // Return 204 No Content for successful deletion
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof TagNotFoundError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error instanceof Error) {
      if (error.message === "Invalid tag ID format") {
        return new Response(JSON.stringify({ error: error.message }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }

      console.error("Error deleting tag:", error);
      return new Response(JSON.stringify({ error: "Internal server error" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};
```
