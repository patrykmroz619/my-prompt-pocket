import type { APIRoute } from "astro";
import { NotFoundException } from "@modules/prompts/server/exceptions/prompt.exceptions";
import { promptService } from "@modules/prompts/server/services/prompt.service";
import type { IRequestContext } from "@shared/types/types";
import { ZodError } from "zod";
import { promptIdSchema } from "@modules/prompts/shared/schemas/get-prompt-by-id.schema";

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
