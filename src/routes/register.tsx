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

  return (
    <SiteLayout>
      <AuthCardWrapper
        title="Create your account"
        subtitle="Start planning unforgettable journeys with Wanderlust."
        footerContent={
          <p>
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-accent hover:underline transition-colors">
              Sign in
            </Link>
          </p>
        }
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-5" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="fullName" className="text-sm font-medium text-white/90">
              Full Name
            </Label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              placeholder="Alex Morgan"
              disabled={isSubmitting}
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? "fullName-error" : undefined}
              className="h-11 w-full rounded-xl bg-white/5 border border-white/10 px-3.5 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              {...formRegister("fullName")}
            />
            {errors.fullName ? (
              <p id="fullName-error" className="text-xs font-medium text-destructive mt-1">
                {errors.fullName.message}
              </p>
            ) : null}
          </div>

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
              {...formRegister("email")}
            />
            {errors.email ? (
              <p id="email-error" className="text-xs font-medium text-destructive mt-1">
                {errors.email.message}
              </p>
            ) : null}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm font-medium text-white/90">
              Password
            </Label>
            <div className="relative flex items-center">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.password)}
                aria-describedby={errors.password ? "password-error" : undefined}
                className="h-11 w-full rounded-xl bg-white/5 border border-white/10 pl-3.5 pr-10 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                {...formRegister("password")}
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
            ) : (
              <p className="text-xs text-slate-400 mt-1">Must be at least 8 characters long.</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword" className="text-sm font-medium text-white/90">
              Confirm Password
            </Label>
            <div className="relative flex items-center">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="••••••••"
                disabled={isSubmitting}
                aria-invalid={Boolean(errors.confirmPassword)}
                aria-describedby={errors.confirmPassword ? "confirmPassword-error" : undefined}
                className="h-11 w-full rounded-xl bg-white/5 border border-white/10 pl-3.5 pr-10 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                {...formRegister("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 flex items-center text-white/40 hover:text-white transition-colors p-1"
                aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Eye className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
            {errors.confirmPassword ? (
              <p id="confirmPassword-error" className="text-xs font-medium text-destructive mt-1">
                {errors.confirmPassword.message}
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
                  <span>Creating account...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center gap-1.5">
                  <span>Create Account</span>
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
