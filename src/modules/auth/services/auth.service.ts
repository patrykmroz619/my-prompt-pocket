export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
}

export interface AuthResponse {
  message?: string;
  // Add other potential fields from your API response, e.g., user, token
  [key: string]: unknown; // Use unknown instead of any for better type safety
}

const handleApiResponse = async (response: Response): Promise<AuthResponse> => {
  const result = await response.json();
  if (!response.ok) {
    // Use a more specific error message if available from the API response
    throw new Error(result.error || result.message || `Request failed with status ${response.status}`);
  }
  return result; // Return result for potential use in components if needed
};

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(credentials),
    });
    return handleApiResponse(response);
  },

  loginWithGoogle(): void {
    window.location.href = "/api/auth/google";
  },

  async register(userData: RegisterData): Promise<AuthResponse> {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });
    return handleApiResponse(response);
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email }),
    });
    return handleApiResponse(response);
  },
};
