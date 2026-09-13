import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
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

const title = "Sign In — Wanderlust";
const description = "Sign in to manage your bookings, itineraries, and reviews.";

const searchSchema = z.object({
  redirect: z.string().optional(),
});

export const Route = createFileRoute("/login")({
  validateSearch: (search) => searchSchema.parse(search),
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
  component: LoginPage,
});

const loginSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginPage() {
  const { user, loading, login } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      const destination = search.redirect || "/";
      navigate({ to: destination, replace: true });
    }
  }, [user, loading, navigate, search.redirect]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginFormValues) => {
    setIsSubmitting(true);
    try {
      const result = await login(values.email, values.password);

      if (result.error) {
        if (result.error.toLowerCase().includes("invalid login credentials")) {
          toast.error("Incorrect email or password. Please try again.");
        } else if (result.error.toLowerCase().includes("email not confirmed")) {
          toast.error("Please verify your email before logging in.");
        } else {
          toast.error(result.error);
        }
        return;
      }

      toast.success("Welcome back to Wanderlust!");
      const destination = search.redirect || "/";
      navigate({ to: destination });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to sign in. Please check your credentials.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const origin = typeof window !== "undefined" ? window.location.origin : "";
      const redirectTo = `${origin}${search.redirect || "/"}`;
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
      const message = err instanceof Error ? err.message : "Google sign in failed";
      toast.error(message);
    }
  };

  return (
    <SiteLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8">
        <AuthCardWrapper
          title="Welcome back"
          subtitle="Sign in to access your saved trips and travel bookings."
        >
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Email field */}
            <div className="space-y-1.5">
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
                  {...register("email")}
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

            {/* Password field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label
                  htmlFor="password"
                  className="text-xs sm:text-sm font-medium text-foreground"
                >
                  Password
                </Label>
                <Link
                  to="/forgot-password"
                  className="text-xs font-medium text-accent-text underline-offset-4 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
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
                  autoComplete="current-password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-invalid={Boolean(errors.password)}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  className="h-11 pl-10 pr-10 bg-background/50 border-input transition-all duration-200 focus-visible:ring-accent/40"
                  {...register("password")}
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
              ) : null}
            </div>

            {/* Remember me */}
            <div className="flex items-center justify-between pt-0.5">
              <div className="flex items-center space-x-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-accent focus:ring-accent/40 cursor-pointer"
                />
                <label
                  htmlFor="remember-me"
                  className="text-xs text-muted-foreground hover:text-foreground cursor-pointer transition-colors"
                >
                  Remember me
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <AnimatedSubmitButton
                type="submit"
                isLoading={isSubmitting}
                loadingText="Signing in..."
              >
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </AnimatedSubmitButton>
            </div>

            {/* Divider */}
            <div className="relative my-4 flex items-center">
              <div className="flex-grow border-t border-border/70" />
              <span className="mx-3 text-xs text-muted-foreground uppercase tracking-wider">
                or
              </span>
              <div className="flex-grow border-t border-border/70" />
            </div>

            {/* Google Sign In */}
            <GoogleSignInButton onClick={handleGoogleSignIn} disabled={isSubmitting} />

            {/* Link to Register */}
            <div className="mt-5 border-t border-border/60 pt-4 text-center text-xs sm:text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="font-medium text-accent-text underline-offset-4 hover:underline"
              >
                Create account
              </Link>
            </div>
          </form>
        </AuthCardWrapper>
      </div>
    </SiteLayout>
  );
}
