import { z } from "zod";
import type { APIRoute } from "astro";
import { MissingParameterDefinitionsError, PromptNameConflictError, UndefinedParametersError } from "@modules/prompts/server/exceptions/prompt.exceptions";
import { createPromptSchema } from "@modules/prompts/shared/schemas/create-prompt.schema";
import { promptService } from "@modules/prompts/server/services/prompt.service";
import type { IRequestContext } from "@shared/types/types";


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
