import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@shared/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { password, token } = await request.json();

    if (!password || !token) {
      return new Response(JSON.stringify({ error: "Password and token are required" }), {
        status: 400,
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    // First, we need to exchange the token for a session
    const { data: sessionData, error: sessionError } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });

    if (sessionError) {
      return new Response(JSON.stringify({ error: sessionError.message }), {
        status: 400,
      });
    }

    // Then update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      return new Response(JSON.stringify({ error: updateError.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: "Password updated successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in reset-password endpoint:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
    });
  }
};
