import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { useState } from "react";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import { Button } from "@shared/components/ui/button";

// Password validation schema with strength requirements
const passwordSchema = z
  .string()
  .min(8, { message: "Password must be at least 8 characters" })
  .refine((password) => /[A-Z]/.test(password), { message: "Password must contain at least one uppercase letter" })
  .refine((password) => /[a-z]/.test(password), { message: "Password must contain at least one lowercase letter" })
  .refine((password) => /[0-9]/.test(password), { message: "Password must contain at least one number" });

// Schema for registration form validation
const registerSchema = z
  .object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export interface RegisterFormProps {
  onSubmit?: (email: string, password: string) => Promise<void>;
}

export function RegisterForm({ onSubmit }: RegisterFormProps) {
  const [passwordStrength, setPasswordStrength] = useState(0);

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    mode: "onChange",
  });

  const isLoading = form.formState.isSubmitting;

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    if (!password) return 0;

    let strength = 0;

    // Length check
    if (password.length >= 8) strength += 1;

    // Contains lowercase
    if (/[a-z]/.test(password)) strength += 1;

    // Contains uppercase
    if (/[A-Z]/.test(password)) strength += 1;

    // Contains number
    if (/[0-9]/.test(password)) strength += 1;

    // Contains special char
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;

    return strength;
  };

  const getPasswordStrengthText = (): string => {
    switch (passwordStrength) {
      case 0:
        return "Very weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      case 5:
        return "Very strong";
      default:
        return "";
    }
  };

  const getPasswordStrengthColor = (): string => {
    switch (passwordStrength) {
      case 0:
      case 1:
        return "bg-red-500";
      case 2:
        return "bg-orange-500";
      case 3:
        return "bg-yellow-500";
      case 4:
        return "bg-green-500";
      case 5:
        return "bg-emerald-500";
      default:
        return "bg-gray-200";
    }
  };

  async function handleSubmit(data: RegisterFormValues) {
    try {
      // Simulate registration for now
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (onSubmit) {
        await onSubmit(data.email, data.password);
      }

      toast.success("Registration successful! Please check your email for verification.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to register. Please try again.");
    }
  }

  return (
    <div className="space-y-6">
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

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    disabled={isLoading}
                    onChange={(e) => {
                      field.onChange(e);
                      setPasswordStrength(calculatePasswordStrength(e.target.value));
                    }}
                    value={field.value}
                    onBlur={field.onBlur}
                    name={field.name}
                    ref={field.ref}
                  />
                </FormControl>
                {field.value && (
                  <div className="space-y-1">
                    <div className="flex h-2 items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-2 w-full rounded-sm ${
                            i < passwordStrength ? getPasswordStrengthColor() : "bg-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">Password strength: {getPasswordStrengthText()}</p>
                  </div>
                )}
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
                  <Input type="password" disabled={isLoading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Creating account..." : "Create account"}
          </Button>
        </form>
      </Form>

      <div className="text-center text-sm">
        Already have an account?{" "}
        <a href="/auth/login" className="font-medium text-primary hover:underline">
          Log in
        </a>
      </div>
    </div>
  );
}
