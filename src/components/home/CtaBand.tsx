import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";

export function CtaBand() {
  return (
    <section className="bg-accent">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div className="max-w-2xl text-accent-foreground">
          <h2 className="text-3xl sm:text-4xl">Ready when you are</h2>
          <p className="mt-3 text-accent-foreground/85">
            Create a free account to save trips, build itineraries and keep every booking in one
            dashboard.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button
            asChild
            size="lg"
            className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Link to="/register">Create free account</Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="rounded-full border-accent-foreground/40 bg-transparent text-accent-foreground hover:bg-accent-foreground/10 hover:text-accent-foreground"
          >
            <Link to="/packages">Browse tours</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
