import React from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingCTAProps {
  label?: string;
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  disabledMessage?: string;
  itemType?: "tour" | "hotel" | "flight";
  itemId?: string;
}

export function BookingCTA({
  label = "Book Now",
  className,
  size = "lg",
  variant = "default",
  disabledMessage = "Booking opens soon — Phase 10 wires up the checkout flow",
}: BookingCTAProps) {
  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block w-full">
            <Button
              type="button"
              disabled
              variant={variant}
              size={size}
              className={cn(
                "w-full rounded-full font-semibold cursor-not-allowed opacity-80 shadow-sm",
                variant === "default" && "bg-accent text-accent-foreground hover:bg-accent",
                className,
              )}
            >
              <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
              {label}
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs text-center">
          <p>{disabledMessage}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
