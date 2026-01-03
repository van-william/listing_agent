import "server-only";
import type { ListingSummary } from "@/lib/types";

const DEFAULT_API_URL = "https://api.repliers.io";

function getRequiredEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

function parseNumber(value: unknown) {
  if (value == null) return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function buildHeaders(apiKey: string) {
  return {
    "REPLIERS-API-KEY": apiKey,
    Accept: "application/json"
  };
}

async function readErrorBody(res: Response) {
  try {
    const text = await res.text();
    return text ? text.slice(0, 500) : "";
  } catch {
    return "";
  }
}

function formatAddress(raw: Record<string, unknown>) {
  const addressLine =
    (raw.address as string) ||
    (raw.addressLine1 as string) ||
    (raw.streetAddress as string) ||
    [
      raw.streetNumber,
      raw.streetName,
      raw.streetSuffix,
      raw.unitNumber
    ]
      .filter(Boolean)
      .join(" ");

  const city = (raw.city as string) || (raw.cityName as string);
  const state = (raw.state as string) || (raw.stateCode as string);
  const postal = (raw.postalCode as string) || (raw.zip as string);

  const parts = [addressLine, city, state, postal].filter(Boolean);
  return parts.join(", ");
}

function normalizeListing(raw: Record<string, unknown>): ListingSummary {
  const idCandidate =
    raw.mlsNumber ||
    raw.mlsId ||
    raw.listingId ||
    raw.id ||
    raw._id;

  const address = formatAddress(raw) || "Unknown address";

  const images = Array.isArray(raw.images)
    ? (raw.images as string[])
    : Array.isArray(raw.photos)
      ? (raw.photos as string[])
      : [];

  return {
    id: String(idCandidate ?? address),
    address,
    city: (raw.city as string) || (raw.cityName as string) || null,
    state: (raw.state as string) || (raw.stateCode as string) || null,
    postalCode: (raw.postalCode as string) || (raw.zip as string) || null,
    price: parseNumber(raw.price ?? raw.listPrice ?? raw.listingPrice ?? raw.askingPrice),
    beds: parseNumber(raw.beds ?? raw.bedrooms ?? raw.bedroomsTotal),
    baths: parseNumber(raw.baths ?? raw.bathrooms ?? raw.bathroomsTotal),
    sqft: parseNumber(raw.sqft ?? raw.squareFeet ?? raw.livingArea),
    status: (raw.status as string) || (raw.listingStatus as string) || null,
    neighborhood: (raw.neighborhood as string) || (raw.community as string) || null,
    images
  };
}

export type SearchListingsParams = {
  q?: string;
  city?: string;
  minPrice?: string | null;
  maxPrice?: string | null;
  minBeds?: string | null;
  maxBeds?: string | null;
  status?: string | null;
};

export async function searchListings(params: SearchListingsParams) {
  const apiUrl = process.env.REPLIERS_API_URL || DEFAULT_API_URL;
  const apiKey = getRequiredEnv("REPLIERS_API_KEY");

  const query = new URLSearchParams();
  if (params.q) query.set("text", params.q);
  if (params.city) query.set("city", params.city);
  if (params.minPrice) query.set("minPrice", params.minPrice);
  if (params.maxPrice) query.set("maxPrice", params.maxPrice);
  if (params.minBeds) query.set("minBedrooms", params.minBeds);
  if (params.maxBeds) query.set("maxBedrooms", params.maxBeds);
  if (params.status) query.set("status", params.status);

  const res = await fetch(`${apiUrl}/listings?${query.toString()}`, {
    headers: buildHeaders(apiKey),
    cache: "no-store"
  });

  if (!res.ok) {
    const details = await readErrorBody(res);
    throw new Error(`Repliers search failed (${res.status})${details ? `: ${details}` : ""}`);
  }

  const payload = (await res.json()) as Record<string, unknown> | Record<string, unknown>[];
  const rawListings = Array.isArray(payload)
    ? payload
    : Array.isArray(payload.listings)
      ? payload.listings
      : Array.isArray(payload.results)
        ? payload.results
        : [];

  const listings = rawListings.map((item) => normalizeListing(item));
  const total = !Array.isArray(payload) && typeof payload.total === "number" ? payload.total : null;

  return { listings, total };
}

export async function getListingById(listingId: string) {
  const apiUrl = process.env.REPLIERS_API_URL || DEFAULT_API_URL;
  const apiKey = getRequiredEnv("REPLIERS_API_KEY");

  const res = await fetch(`${apiUrl}/listings/${encodeURIComponent(listingId)}`, {
    headers: buildHeaders(apiKey),
    cache: "no-store"
  });

  if (!res.ok) {
    const details = await readErrorBody(res);
    throw new Error(`Repliers listing fetch failed (${res.status})${details ? `: ${details}` : ""}`);
  }

  const payload = (await res.json()) as Record<string, unknown>;
  return normalizeListing(payload);
}
