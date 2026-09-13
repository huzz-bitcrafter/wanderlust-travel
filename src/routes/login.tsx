import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import { motion } from "motion/react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { AuthCardWrapper } from "@/components/ui/sign-in-card-2";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

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
        // Standardize Supabase error messages into clean user-friendly phrasing
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

  return (
    <SiteLayout>
      <AuthCardWrapper
        title="Welcome back"
        subtitle="Sign in to access your saved trips and travel bookings."
        footerContent={
          <p>
            Don&apos;t have an account?{" "}
            <Link
              to="/register"
              className="font-medium text-accent hover:underline transition-colors"
            >
              Create account
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm font-medium text-white/90">
              Email Address
            </Label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="alex@example.com"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? "email-error" : undefined}
              className="h-11 w-full rounded-xl bg-white/5 border border-white/10 px-3.5 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              {...register("email")}
            />
            {errors.email ? (
              <p id="email-error" className="text-xs font-medium text-destructive mt-1">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-sm font-medium text-white/90">
                Password
              </Label>
              <Link
                to="/forgot-password"
                className="text-xs font-medium text-accent hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="h-11 w-full rounded-xl bg-white/5 border border-white/10 pl-3.5 pr-10 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 flex items-center text-white/40 hover:text-white transition-colors p-1"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.password ? (
              <p id="password-error" className="text-xs font-medium text-destructive mt-1">
                {errors.password.message}
              </p>
            ) : null}
          </div>

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isSubmitting}
            className="w-full relative group/button mt-5"
          >
            <div className="relative h-11 w-full rounded-xl bg-accent text-accent-foreground font-medium text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all disabled:opacity-50 disabled:pointer-events-none">
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <Loader2
                    className="h-4 w-4 animate-spin text-accent-foreground"
                    aria-hidden="true"
                  />
                  <span>Signing in...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span>Sign In</span>
                  <ArrowRight
                    className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5"
                    aria-hidden="true"
                  />
                </div>
              )}
            </div>
          </motion.button>
        </form>
      </AuthCardWrapper>
    </SiteLayout>
  );
}
