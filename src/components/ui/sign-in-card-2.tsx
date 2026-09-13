import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform, useReducedMotion } from "motion/react";
import { Compass } from "lucide-react";
import { cn } from "@/lib/utils";

export interface AuthCardWrapperProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  className?: string;
  badgeContent?: React.ReactNode;
}

export function AuthCardWrapper({
  children,
  title,
  subtitle,
  className,
  badgeContent,
}: AuthCardWrapperProps) {
  const shouldReduceMotion = useReducedMotion();
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // 3D perspective tilt transforms
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
    <div className={cn("w-full max-w-md relative z-10 mx-auto", className)} style={{ perspective: 1500 }}>
      <motion.div
        className="relative"
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        whileHover={shouldReduceMotion ? undefined : { z: 8 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
      >
        <div className="relative group">
          {/* Card ambient border glow on hover */}
          <motion.div
            className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
            animate={{
              boxShadow: [
                "0 0 12px 1px var(--color-accent, oklch(0.68 0.168 38 / 0.15))",
                "0 0 20px 3px var(--color-accent, oklch(0.68 0.168 38 / 0.25))",
                "0 0 12px 1px var(--color-accent, oklch(0.68 0.168 38 / 0.15))",
              ],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              ease: "easeInOut",
              repeatType: "mirror",
            }}
          />

          {/* Traveling perimeter light beams */}
          <div className="absolute -inset-[1px] rounded-2xl overflow-hidden pointer-events-none">
            {/* Top light beam */}
            <motion.div
              className="absolute top-0 left-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
              initial={{ filter: "blur(1px)" }}
              animate={{
                left: ["-50%", "100%"],
                opacity: [0.4, 0.9, 0.4],
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
                  duration: 1.6,
                  repeat: Infinity,
                  repeatType: "mirror",
                },
              }}
            />

            {/* Right light beam */}
            <motion.div
              className="absolute top-0 right-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-accent to-transparent opacity-80"
              initial={{ filter: "blur(1px)" }}
              animate={{
                top: ["-50%", "100%"],
                opacity: [0.4, 0.9, 0.4],
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
                  duration: 1.6,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 0.7,
                },
              }}
            />

            {/* Bottom light beam */}
            <motion.div
              className="absolute bottom-0 right-0 h-[2px] w-[50%] bg-gradient-to-r from-transparent via-accent to-transparent opacity-80"
              initial={{ filter: "blur(1px)" }}
              animate={{
                right: ["-50%", "100%"],
                opacity: [0.4, 0.9, 0.4],
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
                  duration: 1.6,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 1.4,
                },
              }}
            />

            {/* Left light beam */}
            <motion.div
              className="absolute bottom-0 left-0 h-[50%] w-[2px] bg-gradient-to-b from-transparent via-accent to-transparent opacity-80"
              initial={{ filter: "blur(1px)" }}
              animate={{
                bottom: ["-50%", "100%"],
                opacity: [0.4, 0.9, 0.4],
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
                  duration: 1.6,
                  repeat: Infinity,
                  repeatType: "mirror",
                  delay: 2.1,
                },
              }}
            />

            {/* Subtle corner glow spots */}
            <motion.div
              className="absolute top-0 left-0 h-1.5 w-1.5 rounded-full bg-accent/60 blur-[1px]"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
              className="absolute top-0 right-0 h-2 w-2 rounded-full bg-accent/80 blur-[1.5px]"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2.4, repeat: Infinity, repeatType: "mirror", delay: 0.5 }}
            />
            <motion.div
              className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-accent/80 blur-[1.5px]"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2.2, repeat: Infinity, repeatType: "mirror", delay: 1 }}
            />
            <motion.div
              className="absolute bottom-0 left-0 h-1.5 w-1.5 rounded-full bg-accent/60 blur-[1px]"
              animate={{ opacity: [0.2, 0.6, 0.2] }}
              transition={{ duration: 2.3, repeat: Infinity, repeatType: "mirror", delay: 1.5 }}
            />
          </div>

          {/* Glass card container */}
          <div className="relative rounded-2xl p-6 sm:p-8 bg-card/95 dark:bg-[#090f1d]/90 backdrop-blur-xl border border-border/70 dark:border-white/10 shadow-2xl overflow-hidden">
            {/* Subtle card interior grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.025] dark:opacity-[0.04] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(135deg, currentColor 0.5px, transparent 0.5px), linear-gradient(45deg, currentColor 0.5px, transparent 0.5px)`,
                backgroundSize: "28px 28px",
              }}
            />

            {/* Header with Wanderlust Logo Medallion */}
            <div className="text-center space-y-2 mb-6">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", duration: 0.8 }}
                className="mx-auto w-14 h-14 rounded-full border border-accent/30 bg-accent/10 flex items-center justify-center relative overflow-hidden shadow-inner p-2.5"
              >
                {badgeContent ? (
                  badgeContent
                ) : (
                  <img
                    src="/Bookify_W_logo_transparent_2048px.png"
                    alt="Wanderlust Logo"
                    className="w-full h-full object-contain drop-shadow-sm select-none"
                  />
                )}
                {/* Inner lighting effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-transparent pointer-events-none" />
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl"
              >
                {title}
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="text-xs sm:text-sm text-muted-foreground max-w-xs mx-auto"
              >
                {subtitle}
              </motion.p>
            </div>

            {/* Form Slot */}
            <div className="relative z-10">{children}</div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export function AnimatedSubmitButton({
  isLoading,
  loadingText,
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  isLoading?: boolean;
  loadingText?: string;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      disabled={isLoading || props.disabled}
      className={cn(
        "w-full relative group/button overflow-hidden rounded-lg font-medium text-sm h-11 transition-all duration-200",
        "bg-accent text-accent-foreground shadow-md hover:shadow-lg hover:bg-accent/95 disabled:opacity-70 disabled:cursor-not-allowed",
        className,
      )}
      {...(props as any)}
    >
      {/* Light sweep animation */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
        animate={{
          x: ["-100%", "100%"],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatDelay: 1,
        }}
      />
      <div className="relative flex items-center justify-center gap-2">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-4 h-4 border-2 border-accent-foreground/70 border-t-transparent rounded-full animate-spin" />
              <span>{loadingText || "Processing..."}</span>
            </motion.div>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex items-center justify-center gap-2"
            >
              {children}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.button>
  );
}

export function GoogleSignInButton({
  onClick,
  disabled,
}: {
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.015 }}
      whileTap={{ scale: 0.985 }}
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="w-full relative group/google overflow-hidden rounded-lg border border-border/80 dark:border-white/10 bg-muted/40 dark:bg-white/[0.04] hover:bg-muted/80 dark:hover:bg-white/[0.08] text-foreground font-medium h-10 transition-all duration-200 flex items-center justify-center gap-2.5 text-xs sm:text-sm"
    >
      {/* Google SVG Logo */}
      <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        />
        <path
          fill="#34A853"
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        />
        <path
          fill="#EA4335"
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        />
      </svg>
      <span>Sign in with Google</span>
    </motion.button>
  );
}
