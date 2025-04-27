import type { APIContext } from "astro";
import { ZodError } from "zod";
import { promptImprovementSchema } from "@modules/prompts/server/schemas/prompt-improvement.schema";
import { promptImprovementService } from "@modules/prompts/server/services/prompt-improvement.service";

export async function POST({ request }: APIContext) {
  try {
    // Parse and validate request body
    const requestBody = await request.json();
    const validatedData = promptImprovementSchema.parse(requestBody);

    // Call the AI service to improve the prompt
    const improvedPrompt = await promptImprovementService.improve({
      content: validatedData.content,
      instruction: validatedData.instruction,
    });

    // Return the improved prompt
    return new Response(JSON.stringify(improvedPrompt), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle validation errors
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid request data",
          details: error.errors,
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Handle AI service errors
    if (error instanceof Error) {
      const errorMessage = error.message;

      // Determine if it's a rate limit error
      if (errorMessage.includes("rate limit") || errorMessage.includes("quota")) {
        return new Response(
          JSON.stringify({
            error: "AI request rate limit exceeded. Please try again later.",
          }),
          {
            status: 429,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Handle other known errors
      if (errorMessage.includes("service") && errorMessage.includes("unavailable")) {
        return new Response(
          JSON.stringify({
            error: "AI service is currently unavailable. Please try again later.",
          }),
          {
            status: 503,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Log the error for debugging
      console.error("Error improving prompt:", errorMessage);

      return new Response(
        JSON.stringify({
          error: "Failed to improve prompt. Please try again later.",
        }),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Handle unknown errors
    return new Response(
      JSON.stringify({
        error: "An unexpected error occurred",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
