// filepath: c:\Users\patry\Documents\Projekty\my-prompt-pocket\src\pages\api\tags\[id].ts
import type { APIRoute } from "astro";
import { tagService } from "@modules/tags/server/services/tags.service";
import type { IRequestContext, UpdateTagCommand } from "@shared/types/types";
import { TagNotFoundError } from "@modules/tags/server/exceptions/tags.exceptions";

export const PATCH: APIRoute = async ({ request, cookies, locals, params }) => {
  try {
    // Get user ID from locals (provided by auth middleware)
    const userId = locals.user?.id;
    const tagId = params.id;

    if (!userId) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!tagId) {
      return new Response(JSON.stringify({ error: "Tag ID is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create request context to pass to service
    const context: IRequestContext = {
      headers: request.headers,
      cookies,
    };

    // Parse and validate the request body
    const body = await request.json();

    try {
      const command: UpdateTagCommand = tagService.validateUpdateTagCommand(body);

      // Call service to update the tag
      const updatedTag = await tagService.updateTag(tagId, command, userId, context);

      // Return successful response with the updated tag
      return new Response(JSON.stringify(updatedTag), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (validationError: any) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          message: validationError.message,
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    // Handle specific error types
    if (error.name === "TagAlreadyExistsError") {
      return new Response(JSON.stringify({ error: "Tag name already exists" }), {
        status: 409,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (error.name === "TagNotFoundError") {
      return new Response(JSON.stringify({ error: "Tag not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Handle unexpected errors
    console.error("Error updating tag:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};

export const DELETE: APIRoute = async ({ params, request, cookies, locals }) => {
  try {
    // Get authenticated user from locals
    const user = locals.user;
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

    // Create request context to pass to service
    const context: IRequestContext = {
      headers: request.headers,
      cookies,
    };

    // Delete the tag
    await tagService.deleteTagService(tagId, user, context);
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
