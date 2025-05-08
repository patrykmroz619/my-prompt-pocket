import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@shared/db/supabase.client";

export const POST: APIRoute = async ({ request, cookies }) => {
  try {
    const { password } = await request.json();

    if (!password) {
      return new Response(JSON.stringify({ error: "Password is required" }), {
        status: 400,
      });
    }

    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      // Log the specific error for debugging, but return a generic message to the client
      console.error("Error updating user password:", updateError.message);
      return new Response(JSON.stringify({ error: "Failed to update password. " + updateError.message }), {
        status: 400,
      });
    }

    return new Response(JSON.stringify({ message: "Password updated successfully" }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error in update-password endpoint:", error);
    return new Response(JSON.stringify({ error: "An unexpected error occurred" }), {
      status: 500,
    });
  }
};
