import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState, useEffect } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";

// Schema for reset password form validation
const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters" })
      .regex(/[a-z]/, { message: "Password must contain at least one lowercase letter" })
      .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
      .regex(/[0-9]/, { message: "Password must contain at least one number" }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [isResetComplete, setIsResetComplete] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Extract the token from the URL on the client side
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    setToken(params.get("access_token") || null);
  }, []);

  const form = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function handleSubmit(data: ResetPasswordFormValues) {
    try {
      if (!token) {
        toast.error("Reset token is missing. Please try the reset link from your email again.");
        return;
      }

      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
          token,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to reset password");
      }

      setIsResetComplete(true);
      toast.success("Your password has been reset successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to reset password. Please try again.");
    }
  }

  if (!token) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-yellow-100 p-4 text-sm text-yellow-800">
          <h3 className="mb-2 font-medium">Invalid or expired reset link</h3>
          <p>The password reset link appears to be invalid or has expired. Please request a new password reset link.</p>
        </div>
        <div className="text-center text-sm">
          <a href="/auth/forgot-password" className="font-medium text-primary hover:underline">
            Request new reset link
          </a>
        </div>
      </div>
    );
  }

  if (isResetComplete) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-100 p-4 text-sm text-green-800">
          <h3 className="mb-2 font-medium">Password reset complete</h3>
          <p>Your password has been reset successfully. You can now log in using your new password.</p>
        </div>
        <div className="text-center text-sm">
          <a href="/auth/login" className="font-medium text-primary hover:underline">
            Go to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Reset your password</h2>
        <p className="text-sm text-muted-foreground">Enter a new password for your account</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <Input placeholder="••••••••" type="password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Resetting..." : "Reset Password"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
