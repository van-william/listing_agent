import "server-only";

const DEFAULT_ZILLOW_API_URL = process.env.ZILLOW_API_URL || "https://api.hasdata.com/v1/zillow";

function buildHeaders(apiKey?: string) {
  const headers: Record<string, string> = {
    Accept: "application/json",
    "Content-Type": "application/json"
  };
  if (apiKey) {
    headers["X-API-Key"] = apiKey;
  }
  return headers;
}

export type ZillowPropertyData = {
  zpid?: string | null;
  zestimate?: number | null;
  rentZestimate?: number | null;
  priceHistory?: Array<{
    date: string;
    price: number;
    event?: string;
  }>;
  taxHistory?: Array<{
    year: number;
    tax: number;
  }>;
  homeType?: string | null;
  yearBuilt?: number | null;
  lotSize?: number | null;
  livingArea?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  description?: string | null;
  images?: string[];
  neighborhood?: string | null;
  schoolDistrict?: string | null;
  walkScore?: number | null;
  transitScore?: number | null;
  crimeScore?: number | null;
  raw?: Record<string, unknown>;
};

/**
 * Fetch Zillow property data by address
 * Supports HasData Zillow API or similar services
 */
export async function getZillowDataByAddress(address: string, city?: string, state?: string) {
  const apiKey = process.env.ZILLOW_API_KEY;
  const apiUrl = process.env.ZILLOW_API_URL || DEFAULT_ZILLOW_API_URL;

  // If no API key, return null (graceful degradation)
  if (!apiKey) {
    console.warn("ZILLOW_API_KEY not set, skipping Zillow data fetch");
    return null;
  }

  try {
    const query = new URLSearchParams();
    query.set("address", address);
    if (city) query.set("city", city);
    if (state) query.set("state", state || "IL");

    const res = await fetch(`${apiUrl}/property?${query.toString()}`, {
      headers: buildHeaders(apiKey),
      cache: "no-store"
    });

    if (!res.ok) {
      // Don't throw - gracefully degrade if Zillow is unavailable
      console.warn(`Zillow API returned ${res.status}`);
      return null;
    }

    const payload = (await res.json()) as Record<string, unknown>;
    return normalizeZillowData(payload);
  } catch (error) {
    // Graceful degradation - don't break the app if Zillow fails
    console.warn("Zillow data fetch failed:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

/**
 * Fetch Zillow property data by ZPID (Zillow Property ID)
 */
export async function getZillowDataByZpid(zpid: string) {
  const apiKey = process.env.ZILLOW_API_KEY;
  const apiUrl = process.env.ZILLOW_API_URL || DEFAULT_ZILLOW_API_URL;

  if (!apiKey) {
    console.warn("ZILLOW_API_KEY not set, skipping Zillow data fetch");
    return null;
  }

  try {
    const res = await fetch(`${apiUrl}/property/${encodeURIComponent(zpid)}`, {
      headers: buildHeaders(apiKey),
      cache: "no-store"
    });

    if (!res.ok) {
      console.warn(`Zillow API returned ${res.status}`);
      return null;
    }

    const payload = (await res.json()) as Record<string, unknown>;
    return normalizeZillowData(payload);
  } catch (error) {
    console.warn("Zillow data fetch failed:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

function readNumber(...values: unknown[]): number | null {
  for (const value of values) {
    if (value == null) continue;
    const num = Number(value);
    if (Number.isFinite(num)) return num;
  }
  return null;
}

function readString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === "number") return String(value);
  return null;
}

function normalizeZillowData(raw: Record<string, unknown>): ZillowPropertyData {
  const zpid = readString(raw.zpid || raw.zillowId || raw.propertyId);
  const zestimate = readNumber(raw.zestimate || raw.zestimateAmount || raw.estimatedValue);
  const rentZestimate = readNumber(raw.rentZestimate || raw.rentEstimate || raw.estimatedRent);

  // Price history
  const priceHistory: ZillowPropertyData["priceHistory"] = [];
  if (Array.isArray(raw.priceHistory)) {
    for (const item of raw.priceHistory) {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const date = readString(record.date || record.eventDate);
        const price = readNumber(record.price || record.value || record.amount);
        if (date && price != null) {
          priceHistory.push({
            date,
            price,
            event: readString(record.event || record.type) || undefined
          });
        }
      }
    }
  }

  // Tax history
  const taxHistory: ZillowPropertyData["taxHistory"] = [];
  if (Array.isArray(raw.taxHistory)) {
    for (const item of raw.taxHistory) {
      if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        const year = readNumber(record.year);
        const tax = readNumber(record.tax || record.amount || record.value);
        if (year != null && tax != null) {
          taxHistory.push({ year, tax });
        }
      }
    }
  }

  // Images
  const images: string[] = [];
  const imageArray = raw.images || raw.photos;
  if (Array.isArray(imageArray)) {
    for (const item of imageArray) {
      const url = readString(item);
      if (url) images.push(url);
    }
  }

  return {
    zpid,
    zestimate,
    rentZestimate,
    priceHistory: priceHistory.length ? priceHistory : undefined,
    taxHistory: taxHistory.length ? taxHistory : undefined,
    homeType: readString(raw.homeType || raw.propertyType || raw.type),
    yearBuilt: readNumber(raw.yearBuilt),
    lotSize: readNumber(raw.lotSize || raw.lotSizeSquareFeet),
    livingArea: readNumber(raw.livingArea || raw.squareFeet || raw.livingAreaSquareFeet),
    bedrooms: readNumber(raw.bedrooms || raw.beds),
    bathrooms: readNumber(raw.bathrooms || raw.baths),
    description: readString(raw.description || raw.remarks || raw.publicRemarks),
    images: images.length ? images : undefined,
    neighborhood: readString(raw.neighborhood || raw.community),
    schoolDistrict: readString(raw.schoolDistrict || raw.schools),
    walkScore: readNumber(raw.walkScore || raw.walkscore),
    transitScore: readNumber(raw.transitScore || raw.transitscore),
    crimeScore: readNumber(raw.crimeScore || raw.crimescore),
    raw
  };
}

