import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { LoginForm, type LoginFormProps } from "./LoginForm";
import { toast } from "sonner";

// Mock sonner toast with vi.mock() factory pattern at the top level
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Setup test data
const validUser = {
  email: "test@example.com",
  password: "password123",
};

describe("LoginForm", () => {
  // Setup reusable test helpers following the structure for maintainability rule
  const renderLoginForm = (props: Partial<LoginFormProps> = {}) => {
    return render(<LoginForm {...props} />);
  };

  const fillAndSubmitForm = async (email = validUser.email, password = validUser.password) => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: password } });
    fireEvent.click(screen.getByRole("button", { name: /log in$/i }));
  };

  // Mock location and fetch for each test
  const mockLocation = {
    href: "",
    assign: vi.fn((url: string | URL) => {
      mockLocation.href = url.toString();
    }),
    replace: vi.fn((url: string | URL) => {
      mockLocation.href = url.toString();
    }),
  };

  // Use vi.fn() for function mock
  const mockFetch = vi.fn();

  beforeEach(() => {
    // Reset mocks and restore window objects before each test
    vi.clearAllMocks();

    // Use vi.stubGlobal for global mocks
    vi.stubGlobal("location", mockLocation);
    vi.stubGlobal("fetch", mockFetch);

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
      mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
      renderLoginForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
      });

      expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument();
      expect(screen.queryByText("Password is required")).not.toBeInTheDocument();
    });
  });

  describe("Email/Password Login", () => {
    it("should call fetch with correct data and redirect on successful login", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      });
      renderLoginForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: validUser.email, password: validUser.password }),
        });
        expect(mockLocation.href).toBe("/");
      });
      expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
    });

    it("should show error toast when fetch returns an error", async () => {
      // Arrange
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: "Invalid credentials" }),
      });
      renderLoginForm();

      // Act
      await fillAndSubmitForm(validUser.email, "wrongpassword");

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Invalid credentials");
      });
      expect(mockLocation.href).toBe("");
    });

    it("should show generic error toast when fetch throws an exception", async () => {
      // Arrange
      const networkError = new Error("Network Error");
      mockFetch.mockRejectedValueOnce(networkError);
      renderLoginForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(networkError.message);
      });
      expect(mockLocation.href).toBe("");
    });
  });

  describe("Custom onSubmit Handling", () => {
    it("should call onSubmit prop with correct data when provided", async () => {
      // Arrange
      const mockOnSubmit = vi.fn().mockResolvedValue(undefined);
      renderLoginForm({ onSubmit: mockOnSubmit });

      // Act
      await fillAndSubmitForm("prop@example.com", "propPass123");

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith("prop@example.com", "propPass123");
      });
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockLocation.href).toBe("");
    });

    it("should show error toast if onSubmit prop throws an error", async () => {
      // Arrange
      const errorMessage = "Custom submit failed";
      const mockOnSubmit = vi.fn().mockRejectedValue(new Error(errorMessage));
      renderLoginForm({ onSubmit: mockOnSubmit });

      // Act
      await fillAndSubmitForm("prop@example.com", "propPass123");

      // Assert
      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(errorMessage);
      });
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("Google Login", () => {
    it("should redirect to Google auth endpoint when Google button is clicked", () => {
      // Arrange
      renderLoginForm();

      // Act
      fireEvent.click(screen.getByRole("button", { name: /google/i }));

      // Assert - redirect happens synchronously
      expect(mockLocation.href).toBe("/api/auth/google");
      expect(vi.mocked(toast.error)).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should disable form elements during email/password login submission", async () => {
      // Arrange
      mockFetch.mockReturnValue(new Promise(() => {})); // Never resolving promise
      renderLoginForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /logging in.../i })).toBeDisabled();
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/password/i)).toBeDisabled();
        expect(screen.getByRole("button", { name: /google/i })).toBeDisabled();
      });
    });

    it("should disable buttons during Google login attempt", () => {
      // Arrange
      renderLoginForm();
      const googleButton = screen.getByRole("button", { name: /google/i });
      const loginButton = screen.getByRole("button", { name: /log in$/i });

      // Act
      fireEvent.click(googleButton);

      // Assert
      expect(googleButton).toBeDisabled();
      expect(loginButton).toBeDisabled();
      expect(mockLocation.href).toBe("/api/auth/google");
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
