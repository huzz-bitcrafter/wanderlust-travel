import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Compass, Mail, Loader2, ArrowLeft, CheckCircle2 } from "lucide-react";

import { SiteLayout } from "@/components/layout/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

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
        <div className="w-full max-w-md space-y-8 rounded-2xl border border-border bg-card p-6 shadow-card sm:p-8">
          <div className="text-center">
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-full bg-accent/15 text-accent">
              <Compass className="h-6 w-6" aria-hidden="true" />
            </div>
            <h1 className="mt-4 font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
              Reset your password
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Enter the email address associated with your account and we&apos;ll send you a link to
              reset your password.
            </p>
          </div>

          {submittedEmail ? (
            <div className="space-y-6 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
                <CheckCircle2 className="h-8 w-8" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h2 className="text-lg font-semibold text-foreground">Check your email</h2>
                <p className="text-sm text-muted-foreground">
                  We have sent password reset instructions to:
                </p>
                <p className="font-medium text-foreground">{submittedEmail}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                If you don&apos;t see the email within a few minutes, please check your spam or junk
                folder.
              </p>
              <div className="pt-2">
                <Button asChild variant="outline" className="w-full rounded-lg">
                  <Link to="/login">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    Back to Sign In
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5" noValidate>
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-sm font-medium text-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="alex@example.com"
                    disabled={isSubmitting}
                    aria-invalid={Boolean(errors.email)}
                    aria-describedby={errors.email ? "email-error" : undefined}
                    className="h-11 pl-10"
                    {...register("email")}
                  />
                  <Mail
                    className="absolute left-3 top-3.5 h-4 w-4 text-muted-foreground"
                    aria-hidden="true"
                  />
                </div>
                {errors.email ? (
                  <p id="email-error" className="text-xs font-medium text-destructive">
                    {errors.email.message}
                  </p>
                ) : null}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-11 w-full rounded-lg bg-accent text-accent-foreground shadow-sm hover:bg-accent/90"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Sending reset link...
                  </>
                ) : (
                  "Send Reset Link"
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </SiteLayout>
  );
}
