import React from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Calendar, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingCTAProps {
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  itemType?: "tour" | "hotel" | "flight";
  itemId?: string;
  startDate?: string;
  endDate?: string;
  guests?: number;
  rooms?: number;
  cabinClass?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export function BookingCTA({
  label = "Book Now",
  className,
  size = "lg",
  variant = "default",
  itemType = "tour",
  itemId,
  startDate,
  endDate,
  guests = 1,
  rooms = 1,
  cabinClass,
  disabled = false,
  onClick,
}: BookingCTAProps) {
  if (onClick || disabled || !itemId) {
    return (
      <Button
        type="button"
        disabled={disabled}
        onClick={onClick}
        variant={variant}
        size={size}
        className={cn(
          "w-full rounded-full font-semibold shadow-md transition-all",
          variant === "default" && "bg-accent text-accent-foreground hover:bg-accent/90",
          className,
        )}
      >
        <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
        {label}
      </Button>
    );
  }

  return (
    <Button
      asChild
      variant={variant}
      size={size}
      className={cn(
        "w-full rounded-full font-semibold shadow-md transition-all",
        variant === "default" && "bg-accent text-accent-foreground hover:bg-accent/90",
        className,
      )}
    >
      <Link
        to="/checkout"
        search={{
          itemType,
          itemId,
          startDate,
          endDate,
          guests,
          rooms,
          cabinClass,
        }}
      >
        <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
        {label}
      </Link>
    </Button>
  );
}
