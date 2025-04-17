import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../shared/db/supabase.client";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${new URL(request.url).origin}/auth/callback`,
    },
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
    });
  }

  return redirect(data.url);
};
