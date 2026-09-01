-- Migration 002: Ensure unique index on bookings.reference for reference collision safety
-- Pre-seeded with unique default random strings; this ensures strict database uniqueness.

CREATE UNIQUE INDEX IF NOT EXISTS bookings_reference_key ON public.bookings (reference);
