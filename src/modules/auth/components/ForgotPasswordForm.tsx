import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";

// Schema for forgot password form validation
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export interface ForgotPasswordFormProps {
  onSubmit?: (email: string) => Promise<void>;
}

export function ForgotPasswordForm({ onSubmit }: ForgotPasswordFormProps) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const isLoading = form.formState.isSubmitting;

  async function handleSubmit(data: ForgotPasswordFormValues) {
    try {
      // Simulate password reset request
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSubmit) {
        await onSubmit(data.email);
      }

      setSubmittedEmail(data.email);
      setIsSubmitted(true);
      toast.success("Password reset link sent to your email");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to request password reset. Please try again.");
    }
  }

  if (isSubmitted) {
    return (
      <div className="space-y-4">
        <div className="rounded-md bg-primary/15 p-4 text-sm">
          <h3 className="mb-2 font-medium text-primary">Check your email</h3>
          <p className="text-muted-foreground">
            We've sent a password reset link to <span className="font-medium">{submittedEmail}</span>. Please check your
            inbox and click the link to reset your password.
          </p>
        </div>
        <div className="text-center text-sm">
          <a href="/auth/login" className="font-medium text-primary hover:underline">
            Back to login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h2 className="text-lg font-medium">Forgot your password?</h2>
        <p className="text-sm text-muted-foreground">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="you@example.com" type="email" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send reset link"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        <a href="/auth/login" className="font-medium text-primary hover:underline">
          Back to login
        </a>
      </div>
    </div>
  );
}
