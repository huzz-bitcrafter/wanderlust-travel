/**
 * Airline Logo Resolver
 * Maps normalized airline names to local, self-hosted IATA-coded PNG brand marks in /airlines/{CODE}.png
 */

const AIRLINE_LOGOS: Record<string, string> = {
  // Indian Domestic Carriers
  indigo: "/airlines/6E.png",
  "air india": "/airlines/AI.png",
  "air india express": "/airlines/IX.png",
  vistara: "/airlines/UK.png",
  "akasa air": "/airlines/QP.png",
  spicejet: "/airlines/SG.png",

  // International Major Carriers
  emirates: "/airlines/EK.png",
  "qatar airways": "/airlines/QR.png",
  "british airways": "/airlines/BA.png",
  "singapore airlines": "/airlines/SQ.png",
  ana: "/airlines/NH.png",
  "all nippon airways": "/airlines/NH.png",
  "aegean airlines": "/airlines/A3.png",
  aegean: "/airlines/A3.png",
  "air canada": "/airlines/AC.png",
  "air new zealand": "/airlines/NZ.png",
  "garuda indonesia": "/airlines/GA.png",
  "ita airways": "/airlines/AZ.png",
  icelandair: "/airlines/FI.png",
  "japan airlines": "/airlines/JL.png",
  klm: "/airlines/KL.png",
  latam: "/airlines/LA.png",
  "latam airlines": "/airlines/LA.png",
  "royal air maroc": "/airlines/AT.png",
  "tap air portugal": "/airlines/TP.png",
  "united airlines": "/airlines/UA.png",
  united: "/airlines/UA.png",
};

/**
 * Returns the relative public path to the self-hosted airline logo, or null if unknown.
 */
export function getAirlineLogo(airlineName?: string | null): string | null {
  if (!airlineName) return null;
  const normalized = airlineName.trim().toLowerCase();
  return AIRLINE_LOGOS[normalized] ?? null;
}
