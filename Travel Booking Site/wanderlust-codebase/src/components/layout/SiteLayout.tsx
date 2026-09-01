import type { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { cn } from "@/lib/utils";

export function SiteLayout({
  children,
  transparentNav = false,
}: {
  children: ReactNode;
  transparentNav?: boolean;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar transparentOverHero={transparentNav} />
      <main className={cn("flex-1", transparentNav ? "" : "pt-16")}>{children}</main>
      <Footer />
    </div>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="bg-primary py-14 text-primary-foreground sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {eyebrow ? <p className="eyebrow text-accent">{eyebrow}</p> : null}
        <h1 className="mt-3 text-4xl sm:text-5xl">{title}</h1>
        {description ? (
          <p className="mt-4 max-w-2xl text-primary-foreground/70">{description}</p>
        ) : null}
      </div>
    </section>
  );
}
