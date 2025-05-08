import { type EmailOtpType } from "@supabase/supabase-js";
import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "@shared/db/supabase.client";

export const GET: APIRoute = async ({ request, cookies, redirect }) => {
  const requestUrl = new URL(request.url);
  console.log("Request URL:", requestUrl);
  const token_hash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type") as EmailOtpType | null;
  const next = requestUrl.searchParams.get("next") || "/";

  if (token_hash && type) {
    const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    if (!error) {
      // Securely store the session
      // The verifyOtp call with a server client should handle setting the session cookie automatically.
      return redirect(next);
    }
    console.error("Error verifying OTP:", error.message);
  } else {
    console.error("Missing token_hash or type in confirm endpoint");
  }

  return redirect("/auth/login?error=invalid_token");
};
