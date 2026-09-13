import React, { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  motion,
  AnimatePresence,
  useMotionValue,
  useTransform,
  useReducedMotion,
} from "motion/react";
import { Compass, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthCardWrapperProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footerContent?: React.ReactNode;
  className?: string;
}

/**
 * Reusable visual wrapper for authentication cards (Sign In / Sign Up)
 * Ported and adapted from 21st.dev/@jatin-yadav05/components/sign-in-card-2
 * Enhanced with Wanderlust design tokens, full-spectrum accessibility, and reduced-motion fallbacks.
 */
export function AuthCardWrapper({
  title,
  subtitle,
  children,
  footerContent,
  className,
}: AuthCardWrapperProps) {
  const shouldReduceMotion = useReducedMotion();

  // 3D card tilt values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Mapped tilt transforms: ±8 deg for controlled editorial depth
  const rotateX = useTransform(mouseY, [-300, 300], shouldReduceMotion ? [0, 0] : [8, -8]);
  const rotateY = useTransform(mouseX, [-300, 300], shouldReduceMotion ? [0, 0] : [-8, 8]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (shouldReduceMotion) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mouseX.set(e.clientX - rect.left - rect.width / 2);
    mouseY.set(e.clientY - rect.top - rect.height / 2);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div className="relative min-h-[calc(100vh-5rem)] w-full flex items-center justify-center overflow-hidden py-12 px-4 sm:px-6 lg:px-8">
      {/* Deep atmospheric backdrop layer */}
      <div className="absolute inset-0 bg-[#020917]/95" />

      {/* Atmospheric radial glows aligned to Wanderlust brand palette */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[120vw] max-w-5xl h-[50vh] rounded-b-[50%] bg-[oklch(0.24_0.066_256_/_0.35)] blur-[90px] pointer-events-none"
        aria-hidden="true"
      />
      <motion.div
        className="absolute top-4 left-1/2 -translate-x-1/2 w-[85vw] max-w-3xl h-[45vh] rounded-b-full bg-[oklch(0.62_0.096_186_/_0.15)] blur-[70px] pointer-events-none"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: [0.15, 0.3, 0.15],
                scale: [0.97, 1.03, 0.97],
              }
        }
        transition={{
          duration: 9,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-[70vw] max-w-2xl h-[40vh] rounded-t-full bg-[oklch(0.68_0.168_38_/_0.15)] blur-[80px] pointer-events-none"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                opacity: [0.2, 0.35, 0.2],
                scale: [1, 1.08, 1],
              }
        }
        transition={{
          duration: 7,
          repeat: Infinity,
          repeatType: "mirror",
          delay: 1,
          ease: "easeInOut",
        }}
        aria-hidden="true"
      />

      {/* Subtle organic noise texture overlay */}
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-soft-light pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundSize: "200px 200px",
        }}
        aria-hidden="true"
      />

      {/* 3D Card Container */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className={cn("w-full max-w-md relative z-10", className)}
        style={{ perspective: 1500 }}
      >
        <motion.div
          className="relative"
          style={{ rotateX, rotateY }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <div className="relative group">
            {/* Card perimeter ambient glow on hover */}
            <motion.div
              className="absolute -inset-[1px] rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-700 pointer-events-none"
              animate={
                shouldReduceMotion
                  ? undefined
                  : {
                      boxShadow: [
                        "0 0 10px 2px rgba(255,255,255,0.03)",
                        "0 0 18px 5px rgba(255,255,255,0.06)",
                        "0 0 10px 2px rgba(255,255,255,0.03)",
                      ],
                      opacity: [0.2, 0.45, 0.2],
                    }
              }
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                repeatType: "mirror",
              }}
              aria-hidden="true"
            />

            {/* Traveling border light beam effect */}
            {!shouldReduceMotion && (
              <div
                className="absolute -inset-[1px] rounded-2xl sm:rounded-3xl overflow-hidden pointer-events-none"
                aria-hidden="true"
              >
                {/* Top light beam */}
                <motion.div
                  className="absolute top-0 left-0 h-[2.5px] w-[50%] bg-gradient-to-r from-transparent via-white/80 to-transparent"
                  initial={{ filter: "blur(1.5px)" }}
                  animate={{
                    left: ["-50%", "100%"],
                    opacity: [0.3, 0.75, 0.3],
                    filter: ["blur(1px)", "blur(2px)", "blur(1px)"],
                  }}
                  transition={{
                    left: {
                      duration: 2.8,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1,
                    },
                    opacity: {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatType: "mirror",
                    },
                    filter: {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatType: "mirror",
                    },
                  }}
                />

                {/* Right light beam */}
                <motion.div
                  className="absolute top-0 right-0 h-[50%] w-[2.5px] bg-gradient-to-b from-transparent via-white/80 to-transparent"
                  initial={{ filter: "blur(1.5px)" }}
                  animate={{
                    top: ["-50%", "100%"],
                    opacity: [0.3, 0.75, 0.3],
                    filter: ["blur(1px)", "blur(2px)", "blur(1px)"],
                  }}
                  transition={{
                    top: {
                      duration: 2.8,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1,
                      delay: 0.7,
                    },
                    opacity: {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 0.7,
                    },
                    filter: {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 0.7,
                    },
                  }}
                />

                {/* Bottom light beam */}
                <motion.div
                  className="absolute bottom-0 right-0 h-[2.5px] w-[50%] bg-gradient-to-r from-transparent via-white/80 to-transparent"
                  initial={{ filter: "blur(1.5px)" }}
                  animate={{
                    right: ["-50%", "100%"],
                    opacity: [0.3, 0.75, 0.3],
                    filter: ["blur(1px)", "blur(2px)", "blur(1px)"],
                  }}
                  transition={{
                    right: {
                      duration: 2.8,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1,
                      delay: 1.4,
                    },
                    opacity: {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 1.4,
                    },
                    filter: {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 1.4,
                    },
                  }}
                />

                {/* Left light beam */}
                <motion.div
                  className="absolute bottom-0 left-0 h-[50%] w-[2.5px] bg-gradient-to-b from-transparent via-white/80 to-transparent"
                  initial={{ filter: "blur(1.5px)" }}
                  animate={{
                    bottom: ["-50%", "100%"],
                    opacity: [0.3, 0.75, 0.3],
                    filter: ["blur(1px)", "blur(2px)", "blur(1px)"],
                  }}
                  transition={{
                    bottom: {
                      duration: 2.8,
                      ease: "easeInOut",
                      repeat: Infinity,
                      repeatDelay: 1,
                      delay: 2.1,
                    },
                    opacity: {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 2.1,
                    },
                    filter: {
                      duration: 1.4,
                      repeat: Infinity,
                      repeatType: "mirror",
                      delay: 2.1,
                    },
                  }}
                />

                {/* Corner highlight points */}
                <div className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-white/50 blur-[1px]" />
                <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-white/60 blur-[1.5px]" />
                <div className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-white/60 blur-[1.5px]" />
                <div className="absolute bottom-0 left-0 h-1.5 w-1.5 rounded-full bg-white/50 blur-[1px]" />
              </div>
            )}

            {/* Translucent glass card background */}
            <div className="relative bg-[#071425]/90 backdrop-blur-2xl rounded-2xl sm:rounded-3xl p-6 sm:p-8 border border-white/10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.75),0_0_0_1px_rgba(255,255,255,0.08)] overflow-hidden">
              {/* Subtle card inner micro-grid pattern */}
              <div
                className="absolute inset-0 opacity-[0.035] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                  backgroundSize: "28px 28px",
                }}
                aria-hidden="true"
              />

              {/* Brand Logo & Header */}
              <div className="text-center space-y-1.5 mb-6 sm:mb-8">
                <motion.div
                  initial={
                    shouldReduceMotion ? { scale: 1, opacity: 1 } : { scale: 0.8, opacity: 0 }
                  }
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", duration: 0.6 }}
                  className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-accent/15 text-accent shadow-sm relative overflow-hidden"
                >
                  <Compass className="h-6 w-6 relative z-10" aria-hidden="true" />
                  <div
                    className="absolute inset-0 bg-gradient-to-br from-white/15 to-transparent opacity-60 pointer-events-none"
                    aria-hidden="true"
                  />
                </motion.div>

                <motion.h1
                  initial={shouldReduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, duration: 0.5 }}
                  className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white pt-2"
                >
                  {title}
                </motion.h1>

                {subtitle ? (
                  <motion.p
                    initial={shouldReduceMotion ? { opacity: 1 } : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.5 }}
                    className="text-xs sm:text-sm text-slate-400 max-w-xs mx-auto leading-relaxed"
                  >
                    {subtitle}
                  </motion.p>
                ) : null}
              </div>

              {/* Form Body */}
              <div className="relative z-10">{children}</div>

              {/* Footer link separator & navigation */}
              {footerContent ? (
                <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs sm:text-sm text-slate-400 relative z-10">
                  {footerContent}
                </div>
              ) : null}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/**
 * Standalone demo component matching the 21st.dev signature
 */
export function Component() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <AuthCardWrapper
      title="Welcome back"
      subtitle="Sign in to continue your travel journey with Wanderlust."
      footerContent={
        <p>
          Don't have an account?{" "}
          <Link to="/register" className="font-medium text-accent hover:underline">
            Create account
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
        <div className="space-y-1.5">
          <label htmlFor="demo-email" className="text-sm font-medium text-white/90">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3.5 h-4 w-4 text-white/40 pointer-events-none" />
            <input
              id="demo-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="h-11 w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-3.5 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 outline-none transition-all"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="demo-password" className="text-sm font-medium text-white/90">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs font-medium text-accent underline-offset-4 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative flex items-center">
            <Lock className="absolute left-3.5 h-4 w-4 text-white/40 pointer-events-none" />
            <input
              id="demo-password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="h-11 w-full rounded-xl bg-white/5 border border-white/10 pl-10 pr-10 text-sm text-white placeholder:text-white/30 focus:border-accent/60 focus:ring-1 focus:ring-accent/40 outline-none transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 text-white/40 hover:text-white transition-colors p-1"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          disabled={isLoading}
          className="w-full relative group/button mt-6"
        >
          <div className="relative h-11 w-full rounded-xl bg-accent text-accent-foreground font-medium text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all disabled:opacity-50">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-accent-foreground border-t-transparent rounded-full animate-spin" />
                  <span>Signing in...</span>
                </motion.div>
              ) : (
                <motion.span
                  key="ready"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center justify-center gap-1.5"
                >
                  Sign In
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/button:translate-x-0.5" />
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </motion.button>
      </form>
    </AuthCardWrapper>
  );
}

export default AuthCardWrapper;
