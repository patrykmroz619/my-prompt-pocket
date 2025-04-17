import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../shared/db/supabase.client";
import * as z from "zod";

// Server-side validation schema
const registerSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
});

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const body = await request.json();

    // Validate input data
    const validationResult = registerSchema.safeParse(body);

    if (!validationResult.success) {
      const formattedErrors = validationResult.error.format();
      return new Response(
        JSON.stringify({
          error: "Validation failed",
          details: formattedErrors
        }),
        { status: 400 }
      );
    }

    const { email, password } = validationResult.data;

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    // Return user data for automatic login
    return new Response(JSON.stringify({ user: data.user }), {
      status: 200,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return new Response(
      JSON.stringify({ error: "An unexpected error occurred during registration" }),
      { status: 500 }
    );
  }
};
