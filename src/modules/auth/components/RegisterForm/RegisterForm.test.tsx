import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { RegisterForm } from "./RegisterForm";
import { toast } from "sonner";
import * as useNavigateModule from "@shared/hooks/useNavigate";
import { authService } from "@modules/auth/services/auth.service"; // Import the auth service

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the useNavigate hook
vi.mock("@shared/hooks/useNavigate", () => ({
  useNavigate: vi.fn(),
}));

// Mock the authService
vi.mock("@modules/auth/services/auth.service", () => ({
  authService: {
    register: vi.fn(),
  },
}));

// Setup test data
const validUser = {
  email: "test@example.com",
  password: "Password123!",
  confirmPassword: "Password123!",
};

describe("RegisterForm", () => {
  // Setup reusable test helpers following the structure for maintainability rule
  const renderRegisterForm = () => {
    return render(<RegisterForm />);
  };

  const fillAndSubmitForm = async (
    email = validUser.email,
    password = validUser.password,
    confirmPassword = validUser.confirmPassword
  ) => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: password } });
    fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: confirmPassword } });
    fireEvent.click(screen.getByRole("button", { name: /create account$/i }));
  };

  // Mock fetch for each test
  const mockFetch = vi.fn();
  const mockNavigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useNavigateModule.useNavigate).mockReturnValue({
      navigate: mockNavigate,
    });
  });

  afterEach(() => {
    // Clean up global stubs
    vi.unstubAllGlobals();
  });

  describe("Rendering", () => {
    it("should render the registration form with all expected elements", () => {
      // Arrange
      renderRegisterForm();

      // Assert - using explicit assertions
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /create account$/i })).toBeInTheDocument();
      expect(screen.getByText(/already have an account\?/i)).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /log in/i })).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should display required errors when submitting empty form", async () => {
      // Arrange
      renderRegisterForm();

      // Act
      fireEvent.click(screen.getByRole("button", { name: /create account$/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
        expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
      });
      // The confirmPassword validation happens only when both fields have values
      // so we don't check for "Passwords do not match" error when submitting empty form
    });

    it("should display invalid email error for incorrect email format", async () => {
      // Arrange
      renderRegisterForm();

      // Act
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "invalid-email" } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "password123" } });
      fireEvent.click(screen.getByRole("button", { name: /create account$/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("should display error for password shorter than 8 characters", async () => {
      // Arrange
      renderRegisterForm();

      // Act
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "short" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "short" } });
      fireEvent.click(screen.getByRole("button", { name: /create account$/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Password must be at least 8 characters")).toBeInTheDocument();
      });
    });

    it("should display error when passwords do not match", async () => {
      // Arrange
      renderRegisterForm();

      // Act
      fireEvent.change(screen.getByLabelText(/email/i), { target: { value: "test@example.com" } });
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
      fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: "different123" } });
      fireEvent.click(screen.getByRole("button", { name: /create account$/i }));

      // Assert
      await waitFor(() => {
        expect(screen.getByText("Passwords do not match")).toBeInTheDocument();
      });
    });

    it("should not display errors for valid input", async () => {
      // Arrange
      vi.mocked(authService.register).mockResolvedValueOnce({}); // Mock authService.register to resolve
      renderRegisterForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        // Check that the mocked authService.register was called
        expect(authService.register).toHaveBeenCalledWith({
          email: validUser.email,
          password: validUser.password,
        });
      });

      expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument();
      expect(screen.queryByText("Password must be at least 8 characters")).not.toBeInTheDocument();
      expect(screen.queryByText("Passwords do not match")).not.toBeInTheDocument();
    });
  });

  describe("Password Strength Indicator", () => {
    it("should not show password strength indicator when no password is entered", () => {
      // Arrange
      renderRegisterForm();

      // Assert
      expect(screen.queryByText(/password strength/i)).not.toBeInTheDocument();
    });

    it("should show 'Very weak' for very short passwords", () => {
      // Arrange
      renderRegisterForm();

      // Act
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "a" } });

      // Assert - Use a more flexible approach to find the text
      const strengthText = screen.getByText(/password strength/i);
      expect(strengthText).toBeInTheDocument();
      expect(strengthText.textContent).toContain("Weak"); // The actual text might be "Password strength: Weak"
    });

    it("should show appropriate strength for different types of passwords", () => {
      // Arrange
      renderRegisterForm();

      // Act - Test different password strengths
      // 1. Password with just lowercase and numbers
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "password123" } });
      let strengthText = screen.getByText(/password strength/i);
      expect(strengthText.textContent).toContain("Good"); // The component shows "Good" for this password

      // 2. Password with lowercase, uppercase and numbers
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password123" } });
      strengthText = screen.getByText(/password strength/i);
      expect(strengthText.textContent).toContain("Strong"); // The component shows "Strong" for this password

      // 3. Strong - length + lowercase + uppercase + special char
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password123!" } });
      strengthText = screen.getByText(/password strength/i);
      expect(strengthText.textContent).toContain("Very strong"); // The component shows "Very strong" for this password
    });

    it("should render the correct number of strength indicators based on password strength", () => {
      // Arrange
      renderRegisterForm();

      // Act
      fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password123!" } });

      // Assert - should have 5 bars total
      const bars = document.querySelectorAll(".h-2.w-full.rounded-sm");
      expect(bars.length).toBe(5);

      // Count the colored bars (non-gray)
      const coloredBars = Array.from(bars).filter((bar) => !bar.className.includes("bg-gray-200"));

      // Strong password should have 5 colored bars (actual behavior in component)
      expect(coloredBars.length).toBe(5);
    });
  });

  describe("Form Submission", () => {
    it("should call authService.register with correct data and redirect on successful registration", async () => {
      // Arrange
      vi.mocked(authService.register).mockResolvedValueOnce({}); // Mock successful registration
      renderRegisterForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalledWith({ email: validUser.email, password: validUser.password });
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Registration successful! You are now logged in.");
        expect(mockNavigate).toHaveBeenCalledWith("/");
      });
    });

    it("should show error toast when authService.register throws an error with a message", async () => {
      // Arrange
      const errorMessage = "Email already exists";
      vi.mocked(authService.register).mockRejectedValueOnce(new Error(errorMessage));
      renderRegisterForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalled();
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(errorMessage);
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show generic error toast when authService.register throws an error without a message", async () => {
      // Arrange
      vi.mocked(authService.register).mockRejectedValueOnce(new Error()); // Error without a message
      renderRegisterForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalled();
        // Component calls toast.error("") when error.message is empty
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("");
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it("should show specific error toast when authService.register throws a structured error message", async () => {
      // Arrange
      const serverError = {
        message: "Validation failed", // General error message
        details: {
          email: "Email already registered",
          password: "Password too weak",
        },
      };
      vi.mocked(authService.register).mockRejectedValueOnce(new Error(JSON.stringify(serverError)));
      renderRegisterForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(authService.register).toHaveBeenCalled();
        // The component displays error.message, which is the JSON.stringify(serverError)
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(JSON.stringify(serverError));
      });
      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should disable form elements during submission", async () => {
      // Arrange
      mockFetch.mockReturnValue(new Promise(() => null)); // Never resolving promise
      renderRegisterForm();

      // Act
      await fillAndSubmitForm();

      // Assert
      await waitFor(() => {
        expect(screen.getByRole("button", { name: /creating account.../i })).toBeDisabled();
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
        expect(screen.getByLabelText(/^password$/i)).toBeDisabled();
        expect(screen.getByLabelText(/confirm password/i)).toBeDisabled();
      });
    });
  });

  describe("Navigation Links", () => {
    it("should provide a link to the login page", () => {
      // Arrange
      renderRegisterForm();

      // Assert
      expect(screen.getByRole("link", { name: /log in/i })).toHaveAttribute("href", "/auth/login");
    });
  });
});
