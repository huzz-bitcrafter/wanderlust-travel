import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function Rating({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-sm", className)}>
      <Star className="h-4 w-4 fill-accent text-accent" aria-hidden="true" />
      <span className="font-semibold text-foreground">{value.toFixed(1)}</span>
      {typeof count === "number" ? <span className="text-muted-foreground">({count})</span> : null}
      <span className="sr-only">out of 5</span>
    </span>
  );
}

/** Five-star row. `value` may be fractional; the last lit star is partially filled. */
export function StarRating({
  value,
  showValue = false,
  className,
}: {
  value: number;
  showValue?: boolean;
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(5, value));

  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className="inline-flex items-center gap-0.5" aria-hidden="true">
        {Array.from({ length: 5 }).map((_, index) => {
          const fill = Math.max(0, Math.min(1, clamped - index));
          return (
            <span key={index} className="relative inline-block h-4 w-4">
              <Star className="absolute inset-0 h-4 w-4 text-accent/30" />
              <span
                className="absolute inset-0 overflow-hidden"
                style={{ width: `${fill * 100}%` }}
              >
                <Star className="h-4 w-4 fill-accent text-accent" />
              </span>
            </span>
          );
        })}
      </span>
      {showValue ? (
        <span className="text-sm font-semibold text-foreground">{clamped.toFixed(1)}</span>
      ) : null}
      <span className="sr-only">{clamped.toFixed(1)} out of 5 stars</span>
    </span>
  );
}
