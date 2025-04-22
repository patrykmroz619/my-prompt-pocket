import type { APIRoute } from "astro";
import { tagService } from "../../../modules/tags/server/services/tagService";
import type { CreateTagCommand, IRequestContext } from "../../../shared/types/types";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  try {
    // Get user ID from locals (provided by auth middleware)
    const userId = locals.user?.id;

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create request context to pass to service
    const context: IRequestContext = {
      headers: request.headers,
      cookies
    };

    // Parse and validate the request body
    const body = await request.json();

    try {
      const command: CreateTagCommand = tagService.validateCreateTagCommand(body);

      // Call service to create the tag
      const newTag = await tagService.createTag(command, userId, context);

      // Return successful response with the created tag
      return new Response(JSON.stringify(newTag), {
        status: 201,
        headers: { "Content-Type": "application/json" }
      });
    } catch (validationError: any) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          message: validationError.message
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  } catch (error: any) {
    // Handle specific error types
    if (error.name === "TagAlreadyExistsError") {
      return new Response(
        JSON.stringify({ error: "Tag already exists" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    // Handle unexpected errors
    console.error("Error creating tag:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
