import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import {
  AuthCardWrapper,
  AnimatedSubmitButton,
} from "@/components/ui/sign-in-card-2";

const title = "Reset Password — Wanderlust";
const description = "Reset your Wanderlust account password.";

export const Route = createFileRoute("/forgot-password")({
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
  component: ForgotPasswordPage,
});

const forgotPasswordSchema = z.object({
  email: z.string().trim().min(1, "Email is required").email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

function ForgotPasswordPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    setIsSubmitting(true);
    try {
      const redirectUrl =
        typeof window !== "undefined" ? `${window.location.origin}/login` : undefined;

      const { error } = await supabase.auth.resetPasswordForEmail(values.email, {
        redirectTo: redirectUrl,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      setSubmittedEmail(values.email);
      toast.success("Password reset instructions sent to your email.");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to request password reset. Please try again.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-muted/20 px-4 py-12 sm:px-6 lg:px-8">
        {submittedEmail ? (
          <AuthCardWrapper
            title="Check your email"
            subtitle="Password reset instructions have been sent."
          >
            <div className="space-y-5 text-center py-1">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs sm:text-sm text-muted-foreground">
                  We have sent password reset instructions to:
                </p>
                <p className="font-semibold text-foreground text-sm bg-muted/40 py-1 px-3 rounded-lg inline-block border border-border/50">
                  {submittedEmail}
                </p>
              </div>
              <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                If you don&apos;t see the email within a few minutes, please check your spam or junk folder.
              </p>
              <div className="pt-2">
                <Button
                  asChild
                  variant="outline"
                  className="w-full h-11 rounded-xl border-border/80 hover:bg-accent/10 hover:text-accent font-medium text-sm transition-all"
                >
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </div>
          </AuthCardWrapper>
        ) : (
          <AuthCardWrapper
            title="Reset your password"
            subtitle="Enter the email address associated with your account and we'll send you a link to reset your password."
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
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

              <div className="pt-2">
                <AnimatedSubmitButton
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Sending reset link..."
                >
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </AnimatedSubmitButton>
              </div>

              <div className="mt-5 border-t border-border/60 pt-4 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-xs sm:text-sm font-medium text-accent-text underline-offset-4 hover:underline"
                >
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          </AuthCardWrapper>
        )}
      </div>
    </SiteLayout>
  );
}

