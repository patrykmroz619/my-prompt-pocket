import { MissingParameterDefinitionsError, PromptNameConflictError, UndefinedParametersError } from "@modules/prompts/exceptions/prompt.exceptions";
import { createPromptSchema } from "@modules/prompts/schemas/create-prompt.schema";
import { promptService } from "@modules/prompts/services/prompt.service";
import type { APIRoute } from "astro";
import { z } from "zod";


export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const session = await locals.supabase.auth.getSession();
    if (!session.data.session?.user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401
      });
    }

    // Parse and validate request body
    const rawBody = await request.json();
    const body = createPromptSchema.parse(rawBody);

    // Validate parameters
    await promptService.validatePromptParameters(body.content, body.parameters);

    // Create prompt
    const prompt = await promptService.createPrompt(body, session.data.session.user.id);

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
