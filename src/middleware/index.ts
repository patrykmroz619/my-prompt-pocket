import { defineMiddleware } from "astro:middleware";
import { createSupabaseServerInstance } from "@shared/db/supabase.client";
import type { IRequestContext } from "@shared/types/types";

// Public paths - Auth UI pages & API endpoints
const PUBLIC_PATHS = [
  // Auth UI Pages
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/callback", // OAuth callback URL
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/google",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/confirm",
  "/api/auth/callback", // OAuth callback handling
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const currentPath = url.pathname;

  // Allow access to explicitly public paths
  if (PUBLIC_PATHS.some((path) => currentPath === path || currentPath.startsWith(path + "/"))) {
    return next();
  }

  // Allow access to static assets
  if (currentPath.startsWith("/_astro/") || currentPath.match(/\.(css|js|png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    return next();
  }

  const requestContext: IRequestContext = {
    cookies,
    headers: request.headers,
  };

  const supabase = createSupabaseServerInstance(requestContext);

  // Get user session
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    console.error("Error fetching user session:", error.message);
    return redirect("/auth/login");
  }

  if (user) {
    locals.user = {
      email: user.email,
      id: user.id,
    };

    locals.requestContext = requestContext;

    // Make supabase instance available to all routes
    locals.supabase = supabase;
  } else {
    // Redirect to login for protected routes
    return redirect("/auth/login");
  }

  return next();
});
