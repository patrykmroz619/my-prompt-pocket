import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";

// Schema for update password form validation
const updatePasswordSchema = z
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

type UpdatePasswordFormValues = z.infer<typeof updatePasswordSchema>;

export function UpdatePasswordForm() {
  const [isUpdateComplete, setIsUpdateComplete] = useState(false);

  const form = useForm<UpdatePasswordFormValues>({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function handleSubmit(data: UpdatePasswordFormValues) {
    try {
      const response = await fetch("/api/account/update-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          password: data.password,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast.error(
            result.error || "Your session is invalid or has expired. Please request a new password reset link."
          );
          return;
        }
        throw new Error(result.error || "Failed to update password");
      }

      setIsUpdateComplete(true);
      toast.success("Your password has been updated successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update password. Please try again.");
    }
  }

  if (isUpdateComplete) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-green-100 p-4 text-sm text-green-800">
          <h3 className="mb-2 font-medium">Password Updated</h3>
          <p>
            Your password has been successfully updated. You can continue to use your account with the new password.
          </p>
        </div>
        <div className="text-center text-sm">
          <a href="/" className="font-medium text-primary hover:underline">
            Go to Dashboard
          </a>
        </div>
      </div>
    );
  }

  return (
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
              <FormLabel>Confirm New Password</FormLabel>
              <FormControl>
                <Input placeholder="••••••••" type="password" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Password"}
        </Button>
      </form>
    </Form>
  );
}
