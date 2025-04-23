import { z } from "zod";
import type { APIRoute } from "astro";
import { MissingParameterDefinitionsError, PromptNameConflictError, UndefinedParametersError } from "@modules/prompts/server/exceptions/prompt.exceptions";
import { createPromptSchema } from "@modules/prompts/shared/schemas/create-prompt.schema";
import { promptService } from "@modules/prompts/server/services/prompt.service";
import type { IRequestContext } from "@shared/types/types";
import { ZodError } from "zod";
import { PromptFilterParamsSchema } from "@modules/prompts/shared/schemas/prompt.schemas";

export const POST: APIRoute = async ({ request, locals, cookies }) => {
  try {

    // Parse and validate request body
    const rawBody = await request.json();
    const body = createPromptSchema.parse(rawBody);

    // Create context object with headers and cookies
    const context: IRequestContext = {
      headers: request.headers,
      cookies
    };

    // Validate parameters
    await promptService.validatePromptParameters(body.content, body.parameters);

    // Create prompt
    const prompt = await promptService.createPrompt(
      context,
      body,
      locals.user.id
    );

    return new Response(JSON.stringify(prompt), {
      status: 201
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ error: error.errors }), {
        status: 400
      });
    }

    if (error instanceof MissingParameterDefinitionsError) {
      return new Response(JSON.stringify({
        error: error.message,
        parameters: error.parameters
      }), { status: 400 });
    }

    if (error instanceof UndefinedParametersError) {
      return new Response(JSON.stringify({
        error: error.message,
        missingParameters: error.missingParameters
      }), { status: 400 });
    }

    if (error instanceof PromptNameConflictError) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 409
      });
    }

    console.error("Error creating prompt:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
};

export const GET: APIRoute = async ({ request, locals, url, cookies }) => {
  // 1. Authentication Check
  const user = locals.user;
  if (!user) {
    return new Response(JSON.stringify({ message: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // 2. Extract and Validate Query Parameters
    const queryParams = Object.fromEntries(url.searchParams.entries());
    const validationResult = PromptFilterParamsSchema.safeParse(queryParams);

    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          message: "Validation failed",
          errors: validationResult.error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const validatedFilters = validationResult.data;

    // 3. Call Prompt Service
    const requestContext = { headers: request.headers, cookies };
    const paginatedPrompts = await promptService.getPrompts(
      requestContext,
      user.id,
      validatedFilters,
    );

    // 4. Return Success Response
    return new Response(JSON.stringify(paginatedPrompts), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // 5. Handle Errors
    console.error("Error fetching prompts:", error);

    // Specific handling for Zod errors just in case (though safeParse should catch them)
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          message: "Validation error during processing",
          errors: error.flatten().fieldErrors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Generic Server Error
    return new Response(
      JSON.stringify({ message: "Internal Server Error" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
};
