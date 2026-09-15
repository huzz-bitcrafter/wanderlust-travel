import type { FlightData } from "./catalog.functions";

/**
 * Format minutes into "Xh Ym" or "Xh"
 */
export function formatFlightDuration(minutes: number): string {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs === 0) return `${mins}m`;
  if (mins === 0) return `${hrs}h`;
  return `${hrs}h ${mins}m`;
}

/**
 * Format ISO string to "08:45 PM" in UTC (as stored in DB)
 */
export function formatFlightTime(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "UTC",
    });
  } catch {
    return isoString;
  }
}

/**
 * Format ISO string to "Sat, 23 Aug 2025" or "Sat, Aug 23"
 */
export function formatFlightDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
  } catch {
    return isoString;
  }
}

/**
 * Format price using Wanderlust site currency convention
 */
export function formatPrice(amount: number): string {
  return `$${Number(amount || 0).toLocaleString()}`;
}

/**
 * Curated high-resolution Unsplash aviation and airplane wing images
 * matching the aesthetic of the reference dashboard.
 */
export const AVIATION_THUMBNAILS = [
  "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80", // Airplane over clouds
  "https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=600&q=80", // Wing over sunset clouds
  "https://images.unsplash.com/photo-1569154941061-e231b4725ef1?auto=format&fit=crop&w=600&q=80", // Jetliner in flight
  "https://images.unsplash.com/photo-1517479149777-5f3b1511d5ad?auto=format&fit=crop&w=600&q=80", // Wingtip at dusk
  "https://images.unsplash.com/photo-1506012787146-f92b2d7d6d96?auto=format&fit=crop&w=600&q=80", // Jet wing with blue sky
  "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80", // Climbing plane
  "https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=600&q=80", // Airplane banking over golden sky
  "https://images.unsplash.com/photo-1570710891163-6d3b5c47248b?auto=format&fit=crop&w=600&q=80", // Flying above cloud carpet
];

/**
 * Deterministically pick an aviation thumbnail based on flight ID or flight number
 */
export function getFlightThumbnail(
  flight: FlightData | { id: string; flight_number?: string },
): string {
  const seed = (flight.flight_number || "") + (flight.id || "");
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % AVIATION_THUMBNAILS.length;
  return AVIATION_THUMBNAILS[index];
}

/**
 * Airline brand accent & symbol details
 */
export interface AirlineBrand {
  name: string;
  shortName: string;
  code: string;
  color: string;
  bgLight: string;
}

export function getAirlineBrand(airlineName: string): AirlineBrand {
  const lower = (airlineName || "").toLowerCase();

  if (lower.includes("indigo")) {
    return {
      name: "IndiGo",
      shortName: "6E",
      code: "6E",
      color: "#004080",
      bgLight: "rgba(0, 64, 128, 0.12)",
    };
  }
  if (lower.includes("air india")) {
    return {
      name: "Air India",
      shortName: "AI",
      code: "AI",
      color: "#d1242b",
      bgLight: "rgba(209, 36, 43, 0.12)",
    };
  }
  if (lower.includes("vistara")) {
    return {
      name: "Vistara",
      shortName: "UK",
      code: "UK",
      color: "#502047",
      bgLight: "rgba(80, 32, 71, 0.12)",
    };
  }
  if (lower.includes("spicejet")) {
    return {
      name: "SpiceJet",
      shortName: "SG",
      code: "SG",
      color: "#ed1c24",
      bgLight: "rgba(237, 28, 36, 0.12)",
    };
  }
  if (lower.includes("emirates")) {
    return {
      name: "Emirates",
      shortName: "EK",
      code: "EK",
      color: "#d71921",
      bgLight: "rgba(215, 25, 33, 0.12)",
    };
  }
  if (lower.includes("qatar")) {
    return {
      name: "Qatar Airways",
      shortName: "QR",
      code: "QR",
      color: "#5c0632",
      bgLight: "rgba(92, 6, 50, 0.12)",
    };
  }
  if (lower.includes("british")) {
    return {
      name: "British Airways",
      shortName: "BA",
      code: "BA",
      color: "#075aaa",
      bgLight: "rgba(7, 90, 170, 0.12)",
    };
  }
  if (lower.includes("singapore")) {
    return {
      name: "Singapore Airlines",
      shortName: "SQ",
      code: "SQ",
      color: "#002855",
      bgLight: "rgba(0, 40, 85, 0.12)",
    };
  }

  return {
    name: airlineName || "Airline",
    shortName: airlineName ? airlineName.slice(0, 2).toUpperCase() : "FL",
    code: "FL",
    color: "#2d998f",
    bgLight: "rgba(45, 153, 143, 0.12)",
  };
}
