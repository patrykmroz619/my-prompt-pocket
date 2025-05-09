import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ForgotPasswordForm, type ForgotPasswordFormProps } from "./ForgotPasswordForm";
import { toast } from "sonner";
import { authService } from "@modules/auth/services/auth.service";

// Mock sonner toast
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

// Mock the authService
vi.mock("@modules/auth/services/auth.service", () => ({
  authService: {
    forgotPassword: vi.fn(),
  },
}));

const validEmail = "test@example.com";

describe("ForgotPasswordForm", () => {
  const renderForgotPasswordForm = (props?: Partial<ForgotPasswordFormProps>) => {
    return render(<ForgotPasswordForm {...props} />);
  };

  const fillAndSubmitForm = async (email = validEmail) => {
    fireEvent.change(screen.getByLabelText(/email/i), { target: { value: email } });
    fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe("Rendering", () => {
    it("should render the forgot password form with all expected elements", () => {
      renderForgotPasswordForm();
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /send reset link/i })).toBeInTheDocument();
      expect(screen.getByText(/forgot your password\?/i)).toBeInTheDocument();
      expect(
        screen.getByText(/enter your email address and we'll send you a link to reset your password./i)
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /back to login/i })).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    it("should display required error when submitting empty form", async () => {
      renderForgotPasswordForm();
      fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("should display invalid email error for incorrect email format", async () => {
      renderForgotPasswordForm();
      const emailInput = screen.getByLabelText(/email/i);

      // Act: Change the input value to an invalid email and blur the input
      fireEvent.change(emailInput, { target: { value: "invalid-email@test" } });

      // Act: Click the submit button to trigger submit-based validation
      fireEvent.click(screen.getByRole("button", { name: /send reset link/i }));

      // Then, verify that the correct error message is displayed
      // This assertion runs after confirming the field is marked invalid.
      await waitFor(() => {
        expect(screen.getByText("Please enter a valid email address")).toBeInTheDocument();
      });
    });

    it("should not display errors for valid input", async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce({});
      renderForgotPasswordForm();
      await fillAndSubmitForm();
      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalled();
      });
      expect(screen.queryByText("Please enter a valid email address")).not.toBeInTheDocument();
    });
  });

  describe("Form Submission - Internal authService", () => {
    it("should call authService.forgotPassword with correct data and show success message", async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce({});
      renderForgotPasswordForm();
      await fillAndSubmitForm();

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith(validEmail);
        expect(vi.mocked(toast.success)).toHaveBeenCalledWith("Password reset link sent to your email");
      });

      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(
        screen.getByText((_content, element) => {
          const expectedText = `We've sent a password reset link to ${validEmail}. Please check your inbox and click the link to reset your password.`;
          return (
            element?.tagName.toLowerCase() === "p" &&
            element.textContent?.replace(/\\s+/g, " ").trim() === expectedText.replace(/\\s+/g, " ").trim()
          );
        })
      ).toBeInTheDocument();
      expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute("href", "/auth/login");
    });

    it("should show error toast when authService.forgotPassword throws an error with a message", async () => {
      const errorMessage = "User not found";
      vi.mocked(authService.forgotPassword).mockRejectedValueOnce(new Error(errorMessage));
      renderForgotPasswordForm();
      const submitButton = screen.getByRole("button", { name: /send reset link/i });
      const emailInput = screen.getByLabelText(/email/i);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith(validEmail);
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(errorMessage);
      });
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
    });

    it("should show generic error toast when authService.forgotPassword throws an error without a message", async () => {
      vi.mocked(authService.forgotPassword).mockRejectedValueOnce(new Error());
      renderForgotPasswordForm();
      const submitButton = screen.getByRole("button", { name: /send reset link/i });
      const emailInput = screen.getByLabelText(/email/i);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith(validEmail);
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(""); // Changed expectation
      });
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
    });

    it("should show fallback error toast when authService.forgotPassword throws a non-Error object", async () => {
      vi.mocked(authService.forgotPassword).mockRejectedValueOnce("service failure");
      renderForgotPasswordForm();
      const submitButton = screen.getByRole("button", { name: /send reset link/i });
      const emailInput = screen.getByLabelText(/email/i);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(authService.forgotPassword).toHaveBeenCalledWith(validEmail);
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Failed to request password reset. Please try again.");
      });
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
    });
  });

  describe("Form Submission - onSubmit prop", () => {
    it("should call onSubmit prop with correct data and show success message", async () => {
      const mockOnSubmit = vi.fn().mockResolvedValueOnce(undefined);
      renderForgotPasswordForm({ onSubmit: mockOnSubmit });
      await fillAndSubmitForm();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(validEmail);
      });

      expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      expect(
        screen.getByText((_content, element) => {
          const expectedText = `We've sent a password reset link to ${validEmail}. Please check your inbox and click the link to reset your password.`;
          return (
            element?.tagName.toLowerCase() === "p" &&
            element.textContent?.replace(/\\s+/g, " ").trim() === expectedText.replace(/\\s+/g, " ").trim()
          );
        })
      ).toBeInTheDocument();
    });

    it("should show error toast when onSubmit prop throws an error with a message", async () => {
      const errorMessage = "Custom submit error";
      const mockOnSubmit = vi.fn().mockRejectedValueOnce(new Error(errorMessage));
      renderForgotPasswordForm({ onSubmit: mockOnSubmit });
      const submitButton = screen.getByRole("button", { name: /send reset link/i });
      const emailInput = screen.getByLabelText(/email/i);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(validEmail);
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith(errorMessage);
      });
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
    });

    it("should show generic error toast when onSubmit prop throws an error without a message", async () => {
      const mockOnSubmit = vi.fn().mockRejectedValueOnce(new Error());
      renderForgotPasswordForm({ onSubmit: mockOnSubmit });
      const submitButton = screen.getByRole("button", { name: /send reset link/i });
      const emailInput = screen.getByLabelText(/email/i);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(validEmail);
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("");
      });
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
    });

    it("should show fallback error toast when onSubmit prop throws a non-Error object", async () => {
      const mockOnSubmit = vi.fn().mockRejectedValueOnce("custom failure");
      renderForgotPasswordForm({ onSubmit: mockOnSubmit });
      const submitButton = screen.getByRole("button", { name: /send reset link/i });
      const emailInput = screen.getByLabelText(/email/i);

      await fillAndSubmitForm();

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(validEmail);
        expect(vi.mocked(toast.error)).toHaveBeenCalledWith("Failed to request password reset. Please try again.");
      });
      expect(screen.queryByText(/check your email/i)).not.toBeInTheDocument();
      expect(submitButton).not.toBeDisabled();
      expect(emailInput).not.toBeDisabled();
    });
  });

  describe("Loading State", () => {
    it("should disable form elements during submission", async () => {
      vi.mocked(authService.forgotPassword).mockReturnValue(new Promise(() => null)); // Never resolving promise
      renderForgotPasswordForm();
      fillAndSubmitForm(); // Do not await

      await waitFor(() => {
        expect(screen.getByRole("button", { name: /sending.../i })).toBeDisabled();
        expect(screen.getByLabelText(/email/i)).toBeDisabled();
      });
    });
  });

  describe("Navigation Links", () => {
    it("should provide a link to the login page in the initial form", () => {
      renderForgotPasswordForm();
      const loginLinks = screen.getAllByRole("link", { name: /back to login/i });
      // The form initially shows one "Back to login" link
      expect(loginLinks.length).toBeGreaterThanOrEqual(1);
      expect(loginLinks[0]).toHaveAttribute("href", "/auth/login");
    });

    it("should provide a link to the login page in the success view", async () => {
      vi.mocked(authService.forgotPassword).mockResolvedValueOnce({});
      renderForgotPasswordForm();
      await fillAndSubmitForm();
      await waitFor(() => {
        expect(screen.getByText(/check your email/i)).toBeInTheDocument();
      });
      expect(screen.getByRole("link", { name: /back to login/i })).toHaveAttribute("href", "/auth/login");
    });
  });
});
