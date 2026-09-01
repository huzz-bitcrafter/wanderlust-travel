import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ComingSoon({ section }: { section: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6">
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 text-secondary">
        <Compass className="h-6 w-6" aria-hidden="true" />
      </span>
      <h2 className="mt-6 font-display text-2xl">{section} is being built</h2>
      <p className="mt-3 text-muted-foreground">
        This section arrives in the next build phase. In the meantime, explore the featured trips on
        the home page.
      </p>
      <Button
        asChild
        className="mt-6 rounded-full bg-accent text-accent-foreground hover:bg-accent/90"
      >
        <Link to="/">Back to home</Link>
      </Button>
    </div>
  );
}
