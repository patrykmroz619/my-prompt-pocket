import type { APIRoute } from "astro";
import { NotFoundException, PromptNameConflictError } from "@modules/prompts/server/exceptions/prompt.exceptions";
import { promptService } from "@modules/prompts/server/services/prompt.service";
import type { IRequestContext } from "@shared/types/types";
import { ZodError } from "zod";
import { promptIdSchema } from "@modules/prompts/shared/schemas/get-prompt-by-id.schema";
import { updatePromptSchema } from "@modules/prompts/shared/schemas/update-prompt.schema";

export const GET: APIRoute = async ({ params, request, locals, cookies }) => {
  // 1. Authentication Check
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Extract and Validate promptId from URL params
    const { id } = params;

    // Validate the prompt ID
    try {
      promptIdSchema.parse(id);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          message: "Invalid prompt ID format",
          error: validationError instanceof ZodError ? validationError.errors : "Validation failed",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Create request context and call Prompt Service
    const requestContext: IRequestContext = {
      headers: request.headers,
      cookies
    };

    const prompt = await promptService.getPromptById(requestContext, id as string);

    // 4. Return Success Response
    return new Response(JSON.stringify(prompt), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 5. Handle Errors
    console.error("Error fetching prompt by ID:", error);

    // Specific handling for Not Found errors
    if (error instanceof NotFoundException) {
      return new Response(
        JSON.stringify({ message: error.message }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic Server Error
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const PATCH: APIRoute = async ({ params, request, locals, cookies }) => {
  // 1. Authentication Check
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Extract and Validate promptId from URL params
    const { id } = params;

    // Validate the prompt ID
    try {
      promptIdSchema.parse(id);
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          message: "Invalid prompt ID format",
          error: validationError instanceof ZodError ? validationError.errors : "Validation failed",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Parse and validate request body
    let updateData;
    try {
      const requestBody = await request.json();
      updateData = updatePromptSchema.parse(requestBody);
    } catch (error) {
      return new Response(
        JSON.stringify({
          message: "Invalid input",
          error: error instanceof ZodError ? error.errors : "Validation failed",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 4. Create request context and call Prompt Service
    const requestContext: IRequestContext = {
      headers: request.headers,
      cookies
    };

    const updatedPrompt = await promptService.updatePrompt(
      requestContext,
      id as string,
      user.id,
      updateData
    );

    // 5. Return Success Response
    return new Response(JSON.stringify(updatedPrompt), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 6. Handle Errors
    console.error("Error updating prompt:", error);

    // Handle specific error types
    if (error instanceof NotFoundException) {
      return new Response(
        JSON.stringify({ message: "Prompt not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (error instanceof PromptNameConflictError) {
      return new Response(
        JSON.stringify({ message: "A prompt with this name already exists for your account" }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic Server Error
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};

export const DELETE: APIRoute = async ({ params, request, locals, cookies }) => {
  // 1. Authentication Check
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Extract and Validate promptId from URL params
    const { id } = params;

    // Validate the prompt ID
    try {
      promptIdSchema.parse({ id });
    } catch (validationError) {
      return new Response(
        JSON.stringify({
          message: "Invalid prompt ID format",
          error: validationError instanceof ZodError ? validationError.errors : "Validation failed",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // 3. Create request context and call Prompt Service
    const requestContext: IRequestContext = {
      headers: request.headers,
      cookies
    };

    // Attempt to delete the prompt
    await promptService.deletePrompt(requestContext, id as string, user.id);

    // 4. Return Success Response (204 No Content)
    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // 5. Handle Errors
    console.error("Error deleting prompt:", error);

    // Specific handling for Not Found errors
    if (error instanceof NotFoundException) {
      return new Response(
        JSON.stringify({ message: "Prompt not found" }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Generic Server Error
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
