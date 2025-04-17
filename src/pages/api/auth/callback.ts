import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../shared/db/supabase.client";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (!code) {
    return redirect('/auth/login?error=Missing+code+parameter');
  }

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("Auth callback error:", error.message);
    return redirect(`/auth/login?error=${encodeURIComponent(error.message)}`);
  }

  return redirect('/');
};
