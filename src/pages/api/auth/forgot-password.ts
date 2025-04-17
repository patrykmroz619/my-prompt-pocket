import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@shared/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${new URL(request.url).origin}/auth/reset-password`,
    });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: "Password reset email sent successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in forgot-password endpoint:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
    });
  }
};
