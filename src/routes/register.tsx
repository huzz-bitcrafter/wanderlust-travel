import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  AuthCardWrapper,
  AnimatedSubmitButton,
  GoogleSignInButton,
} from "@/components/ui/sign-in-card-2";

const title = "Create Account — Wanderlust";
const description =
  "Join Wanderlust to discover luxury destinations, book tours, and manage your travel itineraries.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: RegisterPage,
});

const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(2, "Full name must be at least 2 characters")
      .max(100, "Full name is too long"),
    email: z
      .string()
      .trim()
      .email("Please enter a valid email address")
      .max(255, "Email is too long"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

function RegisterPage() {
  const { user, loading, register } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && user) {
      navigate({ to: "/", replace: true });
    }
  }, [user, loading, navigate]);

  const {
    register: formRegister,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await register(values.fullName, values.email, values.password);

      if (result.error) {
        toast.error(result.error);
        return;
      }

      if (result.needsEmailConfirmation) {
        toast.success("Account created! Please check your email to confirm your account.");
        navigate({ to: "/login" });
      } else {
        toast.success("Welcome to Wanderlust! Your account has been created.");
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to create account. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}/`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });
      if (error) {
        toast.error(error.message);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Google sign up failed";
      toast.error(message);
    }
  };

  return (
    <SiteLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8">
        <AuthCardWrapper
          title="Create your account"
          subtitle="Start planning unforgettable journeys with Wanderlust."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5" noValidate>
            {/* Full Name */}
            <div className="space-y-1">
              <Label htmlFor="fullName" className="text-xs sm:text-sm font-medium text-foreground">
                Full Name
              </Label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.01 }}
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <User
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none ${
                    focusedInput === "fullName" ? "text-accent" : "text-muted-foreground"
                  }`}
                />
                <Input
                  id="fullName"
                  type="text"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={errors.fullName ? "fullName-error" : undefined}
                  className="h-11 pl-10 pr-3 bg-background/50 border-input transition-all duration-200 focus-visible:ring-accent/40"
                  {...formRegister("fullName")}
                  onFocus={() => setFocusedInput("fullName")}
                  onBlur={() => setFocusedInput(null)}
                />
              </motion.div>
              {errors.fullName ? (
                <p id="fullName-error" className="text-xs font-medium text-destructive">
                  {errors.fullName.message}
                </p>
              ) : null}
            </div>

            {/* Email Address */}
            <div className="space-y-1">
              <Label htmlFor="email" className="text-xs sm:text-sm font-medium text-foreground">
                Email Address
              </Label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.01 }}
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Mail
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none ${
                    focusedInput === "email" ? "text-accent" : "text-muted-foreground"
                  }`}
                />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="alex@example.com"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? "email-error" : undefined}
                  className="h-11 pl-10 pr-3 bg-background/50 border-input transition-all duration-200 focus-visible:ring-accent/40"
                  {...formRegister("email")}
                  onFocus={() => setFocusedInput("email")}
                  onBlur={() => setFocusedInput(null)}
                />
              </motion.div>
              {errors.email ? (
                <p id="email-error" className="text-xs font-medium text-destructive">
                  {errors.email.message}
                </p>
              ) : null}
            </div>

            {/* Password */}
            <div className="space-y-1">
              <Label htmlFor="password" className="text-xs sm:text-sm font-medium text-foreground">
                Password
              </Label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.01 }}
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none ${
                    focusedInput === "password" ? "text-accent" : "text-muted-foreground"
                  }`}
                />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="h-11 pl-10 pr-10 bg-background/50 border-input transition-all duration-200 focus-visible:ring-accent/40"
                  {...formRegister("password")}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </motion.div>
              {errors.password ? (
                <p id="password-error" className="text-xs font-medium text-destructive">
                  {errors.password.message}
                </p>
              ) : (
                <p className="text-[11px] text-muted-foreground">
                  Must be at least 8 characters long.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-1">
              <Label
                htmlFor="confirmPassword"
                className="text-xs sm:text-sm font-medium text-foreground"
              >
                Confirm Password
              </Label>
              <motion.div
                className="relative"
                whileFocus={{ scale: 1.01 }}
                whileHover={{ scale: 1.005 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
              >
                <Lock
                  className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-200 pointer-events-none ${
                    focusedInput === "confirmPassword" ? "text-accent" : "text-muted-foreground"
                  }`}
                />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                  className="h-11 pl-10 pr-10 bg-background/50 border-input transition-all duration-200 focus-visible:ring-accent/40"
                  {...formRegister("confirmPassword")}
                  onFocus={() => setFocusedInput("confirmPassword")}
                  onBlur={() => setFocusedInput(null)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={
                    showConfirmPassword ? "Hide confirm password" : "Show confirm password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  )}
                </button>
              </motion.div>
              {errors.confirmPassword ? (
                <p id="confirmPassword-error" className="text-xs font-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              ) : null}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <AnimatedSubmitButton
                type="submit"
                isLoading={isSubmitting}
                loadingText="Creating account..."
              >
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </AnimatedSubmitButton>
            </div>

            {/* Divider */}
            <div className="relative my-3 flex items-center">
              <div className="flex-grow border-t border-border/70" />
              <span className="mx-3 text-xs text-muted-foreground uppercase tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-border/70" />
            </div>

            {/* Google Sign In */}
            <GoogleSignInButton onClick={handleGoogleSignUp} disabled={isSubmitting} />

            {/* Link to Sign In */}
            <div className="mt-4 border-t border-border/60 pt-3 text-center text-xs sm:text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                to="/login"
                className="font-medium text-accent-text underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </div>
          </form>
        </AuthCardWrapper>
      </div>
    </SiteLayout>
  );
}
