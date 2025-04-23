import type { APIRoute } from "astro";
import {
  AssignPromptToTagCommandSchema,
  RemoveTagFromPromptCommandSchema
} from "@modules/prompts/shared/schemas/prompt-tags.schema";
import { promptTagsService } from "@modules/prompts/server/services/prompt-tags.service";
import {
  AssociationNotFoundError,
  DuplicateAssociationError,
  PromptNotFoundError,
  TagNotFoundError,
  UnauthorizedAssociationError
} from "@modules/prompts/server/exceptions/prompt-tag.exceptions";

export const POST: APIRoute = async ({ request, cookies, locals }) => {
  const requestContext = { headers: request.headers, cookies };
  let body;

  try {
    // Get the authenticated user from Astro.locals
    const user = locals.user;

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "You must be logged in" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate the request body
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate with Zod schema
    const result = AssignPromptToTagCommandSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid input data",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call service function to associate tag with prompt
    const promptTagAssociation = await promptTagsService.assignTagToPrompt(
      result.data,
      requestContext
    );

    // Return successful response
    return new Response(
      JSON.stringify(promptTagAssociation),
      {
        status: 201,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    // Handle specific error cases with appropriate status codes
    if (error instanceof PromptNotFoundError || error instanceof TagNotFoundError) {
      return new Response(
        JSON.stringify({ error: "Not Found", message: error instanceof Error ? error.message : "Resource not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof DuplicateAssociationError) {
      return new Response(
        JSON.stringify({ error: "Conflict", message: error instanceof Error ? error.message : "Duplicate association" }),
        { status: 409, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof UnauthorizedAssociationError) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: error instanceof Error ? error.message : "Unauthorized operation" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log the unhandled error
    console.error("Error associating prompt with tag:", error);

    // Return a generic server error for unhandled cases
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while processing your request",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};

export const DELETE: APIRoute = async ({ request, cookies, locals }) => {
  const requestContext = { headers: request.headers, cookies };
  let body;

  try {
    // Get the authenticated user from Astro.locals
    const user = locals.user;

    if (!user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized", message: "You must be logged in" }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Parse and validate the request body
    try {
      body = await request.json();
    } catch (error) {
      return new Response(
        JSON.stringify({ error: "Bad Request", message: "Invalid JSON in request body" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Validate with Zod schema
    const result = RemoveTagFromPromptCommandSchema.safeParse(body);
    if (!result.success) {
      return new Response(
        JSON.stringify({
          error: "Validation Error",
          message: "Invalid input data",
          details: result.error.format(),
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Call service function to remove tag from prompt
    await promptTagsService.removeTagFromPrompt(
      result.data,
      requestContext
    );

    // Return successful response
    return new Response(
      null,
      {
        status: 204,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    // Handle specific error cases
    if (error instanceof PromptNotFoundError || error instanceof TagNotFoundError) {
      return new Response(
        JSON.stringify({ error: "Not Found", message: error instanceof Error ? error.message : "Resource not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof AssociationNotFoundError) {
      return new Response(
        JSON.stringify({ error: "Not Found", message: error instanceof Error ? error.message : "Association not found" }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    if (error instanceof UnauthorizedAssociationError) {
      return new Response(
        JSON.stringify({ error: "Forbidden", message: error instanceof Error ? error.message : "Unauthorized operation" }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }

    // Log the unhandled error
    console.error("Error removing tag from prompt:", error);

    // Return a generic server error for unhandled cases
    return new Response(
      JSON.stringify({
        error: "Internal Server Error",
        message: "An unexpected error occurred while processing your request",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};
