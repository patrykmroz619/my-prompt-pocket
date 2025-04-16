# Authentication Architecture Specification - MyPromptPocket

This document outlines the authentication architecture for MyPromptPocket, based on the requirements specified in the PRD and the established technology stack.

## 1. User Interface Architecture

### 1.1 Pages Structure

The authentication system requires the following Astro pages:

- `/src/pages/auth/login.astro` - Login page with email/password and Google login options
- `/src/pages/auth/register.astro` - User registration page
- `/src/pages/auth/forgot-password.astro` - Password recovery request page
- `/src/pages/auth/reset-password.astro` - Page for setting a new password
- `/src/pages/auth/callback.astro` - OAuth callback handler for Google login

### 1.2 Layouts

Two primary layouts are needed:

- `/src/shared/components/layout/AuthLayout.astro` - Minimal layout for auth pages (login, register)

  - Clean, focused design for authentication
  - Logo and product name

- `/src/shared/components/layout/AppLayout.astro` - Main layout with authenticated user context
  - Full navigation
  - User menu with profile info and logout
  - Integration with the rest of the application

### 1.3 Components

#### Authentication Module Components

The authentication module will be structured as follows:

```
/src/modules/auth/
├── components/
│   ├── LoginForm.tsx - Email/password login form
│   ├── RegisterForm.tsx - Registration form
│   ├── ForgotPasswordForm.tsx - Request password reset
│   ├── ResetPasswordForm.tsx - Set new password
│   ├── GoogleAuthButton.tsx - Google OAuth button
├── services/
│   ├── login-service.ts - Login service
│   ├── register-service.ts - Registration service
│   └── reset-password-service.ts - Password reset service
└── utils/
    └── validation.ts - Form validation utilities (e.g., using Zod)
```

The application will use `Astro.locals.user` (populated by middleware) for server-side authentication state. This user data can be passed down as props to client-side React components as needed. Client components will interact with auth API endpoints for actions like login, logout, etc.

### 1.4 Form Validation and Error Handling

#### Registration Form Validation

- Email: Format validation with regex
- Password: Minimum 8 characters, uppercase, lowercase, and numbers
- Password: Strength validation
- Password confirmation: Match validation

#### Login Form Validation

- Email: Format validation
- Password: Non-empty validation

#### Password Reset Form Validation

- Email: Format validation (forgot password)
- Password: Strength validation (reset password)
- Password confirmation: Match validation (reset password)

#### Error Handling Strategy

- Form-level errors for authentication failures
- Field-level validation errors with inline feedback
- Toast notifications for successful operations
- Clear error messages with recovery suggestions

### 1.5 Key User Flows

#### Registration Flow

1. User navigates to `/auth/register`
2. Completes form with email and password
3. Client-side validation runs on submit
4. On success, API call to `/api/auth/register` endpoint
5. User receives success notification
6. Redirect to login page

#### Login Flow

1. User navigates to `/auth/login`
2. Enters credentials or selects Google login
3. For email/password, API call to `/api/auth/login` endpoint
4. For Google, redirect to Google OAuth flow
5. On successful auth, redirect to main application page

#### Password Recovery Flow

1. User clicks "Forgot Password" on login page
2. Enters email address
3. System sends password reset link via email
4. User clicks link in email
5. User enters new password
6. On successful reset, redirect to login page

#### Logout Flow

1. User clicks logout in user menu
2. API call to `/api/auth/logout` endpoint
3. User is redirected to login page
4. Application state is cleared

## 2. Backend Logic

### 2.1 Supabase Integration

MyPromptPocket will use the `@supabase/ssr` package (NOT auth-helpers) for Astro integration:

#### Server-side Utilities

```
/src/shared/db/supabase.client.ts - Server-side Supabase client utility
```

#### API Integration

- Create dedicated API endpoints for auth operations
- Implement endpoints for login, register, logout, forgot-password, and reset-password in `/src/pages/api/auth/`

### 2.2 Authentication Middleware

Authentication will be implemented using Astro middleware (`src/middleware/index.ts`) rather than in layout components. This approach provides several benefits:

1. Centralized authentication logic
2. Clear separation between public and protected routes
3. Simplified route protection mechanism
4. Better control over redirects and error handling

The middleware will:

- Check if the current path is a public path (auth pages, API endpoints)
- Verify user session for protected routes
- Redirect unauthenticated users to login page
- Make user data available to all components via `Astro.locals`

### 2.3 Data Models

Leverage Supabase Auth's built-in data models:

- `auth.users` - Core user information
- `auth.identities` - OAuth provider associations
- `auth.sessions` - Active sessions

### 2.4 Error Handling

- Map Supabase error codes to user-friendly messages
- Implement consistent error display across auth forms
- Log authentication errors for monitoring and analytics
- Handle edge cases (account exists, invalid credentials, etc.)

## 3. Authentication System

### 3.1 Supabase Auth Configuration

Configure Supabase project with:

- Email/password authentication
- Google OAuth provider
- Email templates for:
  - Verification emails
  - Password reset emails
- Security settings:
  - Session duration (default 1 week)
  - Password policy enforcement

### 3.2 Supabase Server Client Implementation

Create a proper Supabase server client that follows recommended practices:

```typescript
// src/shared/db/supabase.client.ts
import type { AstroCookies } from "astro";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";
import type { Database } from "../db/database.types.ts";

export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: true,
  httpOnly: true,
  sameSite: "lax",
};

function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(import.meta.env.SUPABASE_URL, import.meta.env.SUPABASE_KEY, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};
```

### 3.3 Auth API Endpoints

Implement dedicated API endpoints for authentication operations under `/src/pages/api/auth/`:

- `POST /api/auth/login`: Handles email/password login.
- `POST /api/auth/register`: Handles user registration.
- `POST /api/auth/logout`: Handles user logout.
- `POST /api/auth/forgot-password`: Handles requests to send a password reset email. (Requires Supabase email template configuration).
- `POST /api/auth/reset-password`: Handles setting a new password using a token from the reset email. (Often handled via Supabase UI or requires custom token handling).
- `/api/auth/callback`: Handles the OAuth callback from providers like Google. (Supabase handles much of this internally when using `signInWithOAuth`).

Example implementation for login:

```typescript
// src/pages/api/auth/login.ts
import type { APIRoute } from "astro";
import { createSupabaseServerInstance } from "../../../shared/db/supabase.client.ts";

export const POST: APIRoute = async ({ request, cookies }) => {
  const { email, password } = await request.json();

  const supabase = createSupabaseServerInstance({ cookies, headers: request.headers });

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400, // Use 401 for Unauthorized specifically
    });
  }

  // Avoid sending back the full user object unless necessary.
  // Successful sign-in sets the cookie, which is the primary goal.
  return new Response(JSON.stringify({ message: "Login successful" }), {
    status: 200,
  });
};
```

Similar endpoints will be implemented for register, logout, and password reset operations, interacting with the corresponding Supabase Auth methods (`signUp`, `signOut`, `resetPasswordForEmail`, `updateUser`).

### 3.4 Protected Routes with Middleware

Implement route protection directly in the middleware:

```typescript
// src/middleware/index.ts
import { createSupabaseServerInstance } from "../shared/db/supabase.client.ts";
import { defineMiddleware } from "astro:middleware";

// Public paths - Auth UI pages & API endpoints
const PUBLIC_PATHS = [
  // Auth UI Pages (Server-Rendered Astro Pages)
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password", // Page where user sets new password after clicking email link
  "/auth/callback", // OAuth callback URL
  // Auth API endpoints
  "/api/auth/login",
  "/api/auth/register",
  "/api/auth/logout",
  "/api/auth/forgot-password",
  "/api/auth/reset-password", // API endpoint to handle the password update
  "/api/auth/callback", // API endpoint for OAuth callback handling if needed separately
];

export const onRequest = defineMiddleware(async ({ locals, cookies, url, request, redirect }, next) => {
  const currentPath = url.pathname;

  // Allow access to explicitly public paths
  if (PUBLIC_PATHS.some((path) => currentPath === path || (path.endsWith("/") && currentPath.startsWith(path)))) {
    return next();
  }

  // Allow access to static assets (adjust pattern if needed)
  if (currentPath.startsWith("/_astro/") || currentPath.match(/\.(css|js|png|jpg|jpeg|svg|gif|webp|ico)$/)) {
    return next();
  }

  const supabase = createSupabaseServerInstance({
    cookies,
    headers: request.headers,
  });

  // IMPORTANT: Always get user session first before any other operations
  const {
    data: { user },
    error, // Check for errors during session retrieval
  } = await supabase.auth.getUser();

  // Log potential errors during session check
  if (error) {
    console.error("Error fetching user session:", error.message);
    // Decide how to handle session fetch errors, e.g., redirect to login or show error page
    // For simplicity here, we'll redirect to login
    return redirect("/auth/login");
  }

  if (user) {
    locals.user = {
      email: user.email,
      id: user.id,
      // Add any other user properties needed globally
    };
  } else {
    // Redirect to login for any other path that is not public and has no user
    return redirect("/auth/login");
  }

  // User is authenticated, proceed to the requested page
  return next();
});
```

### 3.5 Session Management

- Initialize auth state on application load
- Subscribe to auth state changes
- Handle session expiration
- Implement secure session storage via cookies
- Refresh tokens mechanism managed by Supabase

## 4. Integration Strategy

### 4.1 Astro-Supabase Integration

For server-side authentication:

- Use `createSupabaseServerInstance()` utility for all server operations
- Implement middleware for authentication checks
- Store user data in `Astro.locals` for access across components
- Handle auth redirects in middleware
- Ensure all cookie operations use the recommended pattern

### 4.2 React-Supabase Integration

For client-side interactions:

- Create client-side hooks for auth operations
- Implement React components for auth forms
- Handle form submissions via API endpoints
- Provide appropriate UI feedback for auth operations

### 4.3 Authentication State Flow

1. Initial load: Middleware checks auth state
2. Client hydration: Auth state synchronized
3. Auth changes: State updated via API calls
4. Route protection: Based on middleware checks
5. UI updates: Components react to auth state

## 5. Security Considerations

- Implement CSRF protection for auth forms
- Use proper Content Security Policy headers
- Store tokens securely in HTTP-only cookies
- Implement rate limiting for auth attempts
- Enforce strong password policy
- Set appropriate cookie security attributes (secure, httpOnly, sameSite)

This architecture provides a comprehensive approach to implementing authentication in MyPromptPocket, leveraging Astro's middleware capabilities and Supabase's authentication system while following the recommended practices for server-side rendering.
