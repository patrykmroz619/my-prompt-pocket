import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LoginForm } from "./LoginForm";
import { toast } from "sonner";
import { authService } from "@modules/auth/services/auth.service";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock the authService
vi.mock("@modules/auth/services/auth.service", () => ({
  authService: {
    login: vi.fn(),
    loginWithGoogle: vi.fn(),
  },
}));

// Setup test data
const validUser = {
  email: "test@example.com",
  password: "password123",
};

describe("LoginForm", () => {
  // Setup reusable test helpers following the structure for maintainability rule
  const renderLoginForm = () => {
    return render(<LoginForm />);
  };

  const fillAndSubmitForm = async (email = validUser.email, password = validUser.password) => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
    fireEvent.click(screen.getByRole("button", { name: /log in$/i }));
  };

  // Mock location for each test
  const mockLocation = {
    href: "",
    assign: vi.fn((url: string | URL) => {
      mockLocation.href = url.toString();
    }),
    replace: vi.fn((url: string | URL) => {
      mockLocation.href = url.toString();
    }),
  };

  beforeEach(() => {
    // Reset mocks and restore window objects before each test
    vi.clearAllMocks();
    vi.stubGlobal("location", mockLocation);
    // Reset state
    mockLocation.href = "";
  });

  afterEach(() => {
    // Clean up global stubs
    vi.unstubAllGlobals();
  });

  describe("Rendering", () => {
    it("should render the login form with all expected elements", () => {
      // Arrange
      renderLoginForm();

      // Assert - using explicit assertions
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /log in$/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /google/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /forgot password\?/i })).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /register/i })).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should display required errors when submitting empty form", async () => {
      // Arrange
      renderLoginForm();

      // Act
      fireEvent.click(screen.getByRole("button", { name: /log in$/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
        expect(screen.getByText("Password is required")).toBeInTheDocument();
      });
    });

    it("should display invalid email error for incorrect email format", async () => {
      // Arrange
      renderLoginForm();

      // Act
      await fillAndSubmitForm("test@invalid", "password123");

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("should not display errors for valid input", async () => {
      // Arrange
      vi.mocked(authService.login).mockResolvedValueOnce({}); // Mock successful login
      renderLoginForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
      });

      expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument();
      expect(screen.queryByText("Password is required")).not.toBeInTheDocument();
    });
  });

  describe("Email/Password Login", () => {
    it("should call authService.login with correct data and redirect on successful login", async () => {
      // Arrange
      vi.mocked(authService.login).mockResolvedValueOnce({}); // Mock successful login
      renderLoginForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalledWith({ email: validUser.email, password: validUser.password });
        expect(mockLocation.href).toBe("/");
      });
      expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
    });

    it("should show error toast when authService.login throws an error with a message", async () => {
      // Arrange
      const errorMessage = "Invalid credentials";
      vi.mocked(authService.login).mockRejectedValueOnce(new Error(errorMessage));
      renderLoginForm();
      const loginButton = screen.getByRole("button", { name: /log in$/i });
      const googleButton = screen.getByRole("button", { name: /google/i });

      // Act
      await fillAndSubmitForm(validUser.email, "wrongpassword");

      // Assert
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(errorMessage);
      });
      expect(mockLocation.href).toBe("");
      expect(loginButton).not.toBeDisabled();
      expect(googleButton).not.toBeDisabled();
    });

    it("should show generic error toast when authService.login throws an error without a message", async () => {
      // Arrange
      vi.mocked(authService.login).mockRejectedValueOnce(new Error()); // Error without a message
      renderLoginForm();
      const loginButton = screen.getByRole("button", { name: /log in$/i });
      const googleButton = screen.getByRole("button", { name: /google/i });

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
        // Consistent with RegisterForm, if error.message is empty, toast.error("") is expected
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("");
      });
      expect(mockLocation.href).toBe("");
      expect(loginButton).not.toBeDisabled();
      expect(googleButton).not.toBeDisabled();
    });

    it("should show fallback error toast when authService.login throws a non-Error object", async () => {
      // Arrange
      vi.mocked(authService.login).mockRejectedValueOnce("some string error"); // Non-Error object
      renderLoginForm();
      const loginButton = screen.getByRole("button", { name: /log in$/i });
      const googleButton = screen.getByRole("button", { name: /google/i });

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(authService.login).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Failed to log in. Please try again.");
      });
      expect(mockLocation.href).toBe("");
      expect(loginButton).not.toBeDisabled();
      expect(googleButton).not.toBeDisabled();
    });
  });

  describe("Google Login", () => {
    it("should call authService.loginWithGoogle when Google button is clicked", () => {
      // Arrange
      renderLoginForm();

      // Act
      fireEvent.click(screen.getByRole("button", { name: /google/i }));

      // Assert
      expect(authService.loginWithGoogle).toHaveBeenCalled();
      expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
    });

    it("should show error toast when authService.loginWithGoogle throws an error with a message", async () => {
      // Arrange
      const errorMessage = "Google login failed";
      vi.mocked(authService.loginWithGoogle).mockImplementation(() => {
        throw new Error(errorMessage);
      });
      renderLoginForm();
      const googleButton = screen.getByRole("button", { name: /google/i });
      const loginButton = screen.getByRole("button", { name: /log in$/i });

      // Act
      fireEvent.click(googleButton);

      // Assert
      await waitFor(() => {
        expect(authService.loginWithGoogle).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(errorMessage);
      });
      expect(googleButton).not.toBeDisabled();
      expect(loginButton).not.toBeDisabled();
    });

    it("should show generic error toast when authService.loginWithGoogle throws an error without a message", async () => {
      // Arrange
      vi.mocked(authService.loginWithGoogle).mockImplementation(() => {
        throw new Error(); // Error without a message
      });
      renderLoginForm();
      const googleButton = screen.getByRole("button", { name: /google/i });
      const loginButton = screen.getByRole("button", { name: /log in$/i });

      // Act
      fireEvent.click(googleButton);

      // Assert
      await waitFor(() => {
        expect(authService.loginWithGoogle).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("");
      });
      expect(googleButton).not.toBeDisabled();
      expect(loginButton).not.toBeDisabled();
    });

    it("should show fallback error toast when authService.loginWithGoogle throws a non-Error object", async () => {
      // Arrange
      vi.mocked(authService.loginWithGoogle).mockImplementation(() => {
        throw "google string error"; // Non-Error object
      });
      renderLoginForm();
      const googleButton = screen.getByRole("button", { name: /google/i });
      const loginButton = screen.getByRole("button", { name: /log in$/i });

      // Act
      fireEvent.click(googleButton);

      // Assert
      await waitFor(() => {
        expect(authService.loginWithGoogle).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Failed to log in with Google. Please try again.");
      });
      expect(googleButton).not.toBeDisabled();
      expect(loginButton).not.toBeDisabled();
    });
  });

  describe("Loading State", () => {
    it("should disable form elements during email/password login submission", async () => {
      // Arrange
      vi.mocked(authService.login).mockReturnValue(new Promise(() => null)); // Never resolving promise
      renderLoginForm();

      // Act
      await fillAndSubmitForm(); // No need to await here as we are testing the loading state

      // Assert
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logging in.../i })).toBeDisabled();
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/password/i)).toBeDisabled();
        expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
      });
    });

    it("should disable buttons during Google login attempt", async () => {
      // Arrange
      vi.mocked(authService.loginWithGoogle).mockImplementation(() => new Promise(() => null)); // Never resolving promise
      renderLoginForm();
      const googleButton = screen.getByRole("button", { name: /google/i });
      const loginButton = screen.getByRole("button", { name: /log in$/i });

      // Act
      fireEvent.click(googleButton);

      // Assert
      await waitFor(() => {
        expect(googleButton).toBeDisabled();
        expect(loginButton).toBeDisabled();
      });
      expect(authService.loginWithGoogle).toHaveBeenCalled();
    });
  });

  describe("Navigation Links", () => {
    it("should provide correct navigation links to other auth pages", () => {
      // Arrange
      renderLoginForm();

      // Assert
      expect(screen.getByRole("link", { name: /forgot password\?/i })).toHaveAttribute("href", "/auth/forgot-password");

      expect(screen.getByRole("link", { name: /register/i })).toHaveAttribute("href", "/auth/register");
    });
  });
});
