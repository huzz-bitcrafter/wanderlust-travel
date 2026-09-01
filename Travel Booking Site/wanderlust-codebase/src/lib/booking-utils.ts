import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

/**
 * Generate a booking reference with format: WL-XXXXXX
 * Uses unambiguous uppercase characters (excluding 0, O, 1, I).
 */
export function generateBookingReference(): string {
  let result = "WL-";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * ALPHABET.length);
    result += ALPHABET[randomIndex];
  }
  return result;
}

type BookingInsert = Database["public"]["Tables"]["bookings"]["Insert"];

/**
 * Insert a booking with automatic collision retry (max 3 attempts).
 */
export async function insertBookingWithRetry(
  bookingData: Omit<BookingInsert, "reference">,
  maxAttempts = 3,
): Promise<{ id: string; reference: string }> {
  let lastError: Error | null = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const reference = generateBookingReference();
    const { data, error } = await supabase
      .from("bookings")
      .insert({
        ...bookingData,
        reference,
      })
      .select("id, reference")
      .single();

    if (!error && data) {
      return data;
    }

    // Check if error is unique constraint violation on reference
    if (
      error &&
      (error.code === "23505" ||
        error.message.includes("unique") ||
        error.message.includes("reference"))
    ) {
      lastError = new Error(`Collision on reference ${reference}: ${error.message}`);
      console.warn(`Booking reference collision on attempt ${attempt}, retrying...`);
      continue;
    }

    // Other errors should fail immediately
    throw error;
  }

  throw lastError || new Error("Failed to generate a unique booking reference after 3 attempts.");
}
