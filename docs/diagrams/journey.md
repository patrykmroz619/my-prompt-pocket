# User Journey Flow Diagram

This diagram illustrates the user journey flow for authentication in MyPromptPocket, including registration, login, password recovery, and protected route access.

## User Journey Analysis

1. Main user paths:

   - New user registration
   - Email/password login
   - Google OAuth login
   - Password recovery
   - Protected route access
   - Logout process

2. Main states:

   - Unauthenticated: Landing page, Login form, Registration form, Password recovery
   - Authentication process: Form validation, Credentials verification, OAuth flow
   - Authenticated: Main application (prompt library), User settings, Logout

3. Decision points:
   - Registration form validation
   - Login credentials verification
   - Password reset token validation
   - Session validation for protected routes

```mermaid
stateDiagram-v2
    [*] --> LandingPage

    state "Unauthenticated" as Unauth {
        LandingPage --> LoginPage: Access protected resource
        LoginPage --> RegistrationPage: Sign up link
        LoginPage --> ForgotPasswordPage: Forgot password link
        RegistrationPage --> LoginPage: Registration complete
        ForgotPasswordPage --> LoginPage: Reset email sent
    }

    state "Authentication Process" as AuthProcess {
        state LoginPage {
            [*] --> LoginForm
            LoginForm --> CredentialsValidation: Submit form
            LoginForm --> GoogleOAuth: Click Google login

            state CredentialsValidation <<choice>>
            CredentialsValidation --> LoginFailed: Invalid credentials
            CredentialsValidation --> LoginSuccess: Valid credentials

            LoginFailed --> LoginForm: Error message
            GoogleOAuth --> OAuthCallback
            OAuthCallback --> LoginSuccess: OAuth successful
            OAuthCallback --> LoginForm: OAuth failed
        }

        state RegistrationPage {
            [*] --> RegistrationForm
            RegistrationForm --> FormValidation: Submit form

            state FormValidation <<choice>>
            FormValidation --> RegisterFailed: Invalid data
            FormValidation --> RegisterSuccess: Valid data

            RegisterFailed --> RegistrationForm: Show errors
            RegisterSuccess --> RegistrationComplete: Account created
        }

        state ForgotPasswordPage {
            [*] --> EmailRequestForm
            EmailRequestForm --> EmailValidation: Submit email

            state EmailValidation <<choice>>
            EmailValidation --> EmailSent: Valid email
            EmailValidation --> EmailError: Invalid email

            EmailError --> EmailRequestForm: Show error
        }

        state "Password Reset" as PasswordReset {
            EmailSent --> ResetLink: Email with link
            ResetLink --> ResetPasswordPage: Click link in email
            ResetPasswordPage --> NewPasswordForm
            NewPasswordForm --> PasswordValidation: Submit new password

            state PasswordValidation <<choice>>
            PasswordValidation --> PasswordError: Invalid password
            PasswordValidation --> PasswordSuccess: Valid password

            PasswordError --> NewPasswordForm: Show error
            PasswordSuccess --> LoginPage: Password updated
        }
    }

    state "Authenticated" as Auth {
        LoginSuccess --> PromptLibrary: Redirect to app

        state if_protected <<choice>>
        [*] --> if_protected: Access any route
        if_protected --> LoginPage: No valid session
        if_protected --> PromptLibrary: Valid session

        PromptLibrary --> UserSettings: Access profile
        UserSettings --> PromptLibrary: Save settings

        PromptLibrary --> LogoutRequest: Click logout
        UserSettings --> LogoutRequest: Click logout
        LogoutRequest --> LogoutConfirmation: Confirm logout
        LogoutConfirmation --> LoginPage: Session terminated
    }

    note right of LandingPage
        Entry point for all users
    end note

    note right of PromptLibrary
        Main application functionality
        with prompt management
    end note

    note right of LoginPage
        Users can login with email/password
        or Google account
    end note

    note right of RegistrationPage
        New user account creation with
        email and password
    end note

    note right of PasswordReset
        Secure process for recovering
        account access
    end note
```

## Journey Flow Details

### Unauthenticated User Flow

1. User lands on the application landing page
2. When trying to access protected resources, user is redirected to login page
3. From login page, user can:
   - Login with email and password
   - Login with Google account
   - Navigate to registration page
   - Request password reset

### Registration Process

1. User fills registration form with email and password
2. System validates input data (email format, password strength)
3. On successful validation, account is created
4. User is redirected to login page with success message

### Login Process

1. User provides credentials (email/password or Google account)
2. System verifies credentials
3. On successful authentication, user is redirected to main application
4. On failed authentication, error message is displayed

### Password Recovery

1. User requests password reset by providing email
2. System sends email with reset link
3. User clicks link and accesses reset password page
4. User enters and confirms new password
5. On successful password change, user is redirected to login page

### Protected Route Access

1. System checks for valid session on each request to protected routes
2. Users with valid session access requested resources
3. Users without valid session are redirected to login page

### Logout Process

1. User initiates logout from any authenticated page
2. System confirms logout action
3. Session is terminated
4. User is redirected to login page
