import "server-only";
import type { ListingDetail, ListingSummary } from "@/lib/types";

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

function readString(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === "number") return String(value);
  if (Array.isArray(value)) {
    const parts = value
      .map((item) => {
        if (typeof item === "string" || typeof item === "number") return String(item);
        if (item && typeof item === "object") {
          const record = item as Record<string, unknown>;
          return readString(record.label) || readString(record.name) || readString(record.value);
        }
        return null;
      })
      .filter(Boolean) as string[];
    return parts.length ? parts.join(", ") : null;
  }
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return readString(record.label) || readString(record.name) || readString(record.value);
  }
  return null;
}

function readNumber(...values: unknown[]) {
  for (const value of values) {
    const parsed = parseNumber(value);
    if (parsed != null) return parsed;
  }
  return null;
}

function normalizeStringArray(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => readString(item))
      .filter(Boolean) as string[];
  }
  const single = readString(value);
  return single ? [single] : [];
}

function normalizeImages(value: unknown): string[] {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => normalizeImages(item))
      .filter(Boolean);
  }
  if (typeof value === "string") return [value];
  if (typeof value === "object") {
    const record = value as Record<string, unknown>;
    const url =
      readString(record.url) ||
      readString(record.href) ||
      readString(record.src) ||
      readString(record.imageUrl) ||
      readString(record.mediaUrl) ||
      readString(record.thumbnail) ||
      null;
    return url ? [url] : [];
  }
  return [];
}

function shouldLogRawPayload() {
  const value = process.env.REPLIERS_DEBUG;
  return value === "1" || value === "true";
}

function formatAddressFromObject(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const record = value as Record<string, unknown>;
  const full =
    readString(record.full) ||
    readString(record.fullAddress) ||
    readString(record.address) ||
    readString(record.formatted) ||
    null;
  if (full) return full;

  const line1 =
    readString(record.line1) ||
    readString(record.addressLine1) ||
    readString(record.streetAddress) ||
    readString(record.street) ||
    readString(record.street1) ||
    null;
  const line2 =
    readString(record.line2) ||
    readString(record.addressLine2) ||
    readString(record.unit) ||
    readString(record.unitNumber) ||
    null;
  const city = readString(record.city) || readString(record.cityName);
  const state = readString(record.state) || readString(record.stateCode);
  const postal = readString(record.postalCode) || readString(record.zip);

  const street = [line1, line2].filter(Boolean).join(" ");
  const tail = [city, state, postal].filter(Boolean).join(" ");
  return [street, tail].filter(Boolean).join(", ");
}

function formatAddress(raw: Record<string, unknown>) {
  const addressFromObject = formatAddressFromObject(raw.address);
  const addressLine =
    addressFromObject ||
    readString(raw.address) ||
    readString(raw.addressLine1) ||
    readString(raw.streetAddress) ||
    [
      readString(raw.streetNumber),
      readString(raw.streetName),
      readString(raw.streetSuffix),
      readString(raw.unitNumber)
    ]
      .filter(Boolean)
      .join(" ");

  const city = readString(raw.city) || readString(raw.cityName);
  const state = readString(raw.state) || readString(raw.stateCode);
  const postal = readString(raw.postalCode) || readString(raw.zip);

  const parts = [addressLine, city, state, postal].filter(Boolean);
  return parts.join(", ");
}

function normalizeStatus(value: unknown) {
  const status = readString(value);
  if (!status) return null;
  const normalized = status.toUpperCase();
  if (normalized === "A") return "Active";
  if (normalized === "U") return "Under Contract";
  if (normalized === "P") return "Pending";
  if (normalized === "C") return "Closed";
  return status;
}

function computeBaths(raw: Record<string, unknown>) {
  const direct = readNumber(
    raw.baths,
    raw.bathrooms,
    raw.bathroomsTotal,
    raw.bathroomsTotalInteger,
    raw.bathsTotal,
    raw.totalBathrooms
  );
  if (direct != null) return direct;

  const full = readNumber(raw.bathroomsFull, raw.fullBathrooms);
  const half = readNumber(raw.bathroomsHalf, raw.halfBathrooms);
  const threeQuarter = readNumber(raw.bathroomsThreeQuarter, raw.threeQuarterBathrooms);

  if (full != null || half != null || threeQuarter != null) {
    return (full ?? 0) + (half ?? 0) * 0.5 + (threeQuarter ?? 0) * 0.75;
  }
  return null;
}

function normalizeListingSummary(raw: Record<string, unknown>): ListingSummary {
  const idCandidate =
    raw.mlsNumber ||
    raw.mlsId ||
    raw.listingId ||
    raw.id ||
    raw._id;

  const address = formatAddress(raw) || "Unknown address";

  const media = (raw.media && typeof raw.media === "object" && !Array.isArray(raw.media))
    ? (raw.media as Record<string, unknown>)
    : null;
  const images = normalizeImages(raw.images || raw.photos || media?.images || media?.photos || raw.media);

  return {
    id: String(idCandidate ?? address),
    address,
    city: readString(raw.city) || readString(raw.cityName) || null,
    state: readString(raw.state) || readString(raw.stateCode) || null,
    postalCode: readString(raw.postalCode) || readString(raw.zip) || null,
    price: readNumber(raw.price, raw.listPrice, raw.listingPrice, raw.askingPrice),
    beds: readNumber(raw.beds, raw.bedrooms, raw.bedroomsTotal, raw.totalBedrooms, raw.bedsTotal),
    baths: computeBaths(raw),
    sqft: readNumber(raw.sqft, raw.squareFeet, raw.livingArea, raw.livingAreaSquareFeet),
    status: normalizeStatus(raw.status ?? raw.listingStatus),
    neighborhood: readString(raw.neighborhood) || readString(raw.community) || null,
    images
  };
}

function normalizeListingDetail(raw: Record<string, unknown>): ListingDetail {
  const summary = normalizeListingSummary(raw);
  const features = [
    ...normalizeStringArray(raw.features),
    ...normalizeStringArray(raw.interiorFeatures),
    ...normalizeStringArray(raw.exteriorFeatures),
    ...normalizeStringArray(raw.appliances),
    ...normalizeStringArray(raw.amenities),
    ...normalizeStringArray(raw.communityFeatures),
    ...normalizeStringArray(raw.parkingFeatures),
    ...normalizeStringArray(raw.heating),
    ...normalizeStringArray(raw.cooling),
    ...normalizeStringArray(raw.fireplaceFeatures),
    ...normalizeStringArray(raw.propertyFeatures)
  ];
  return {
    ...summary,
    propertyType:
      readString(raw.propertyType) ||
      readString(raw.propertyTypeName) ||
      readString(raw.propertySubType) ||
      readString(raw.propertySubTypeName) ||
      null,
    propertySubType:
      readString(raw.propertySubType) ||
      readString(raw.propertySubTypeName) ||
      null,
    yearBuilt: readNumber(raw.yearBuilt, raw.yearBuiltApprox),
    parking:
      readString(raw.parking) ||
      readString(raw.parkingFeatures) ||
      readString(raw.parkingType) ||
      null,
    hoaFee: readNumber(raw.hoaFees, raw.hoaFee, raw.associationFee, raw.associationFeeMonthly),
    daysOnMarket: readNumber(raw.daysOnMarket, raw.dom),
    lotSize: readNumber(raw.lotSize, raw.lotSizeSquareFeet),
    description:
      readString(raw.publicRemarks) ||
      readString(raw.remarks) ||
      readString(raw.description) ||
      null,
    features: Array.from(new Set(features)).filter(Boolean),
    raw
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

  const listings = rawListings.map((item) => normalizeListingSummary(item));
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
  return normalizeListingSummary(payload);
}

export async function getListingDetailById(listingId: string) {
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
  if (shouldLogRawPayload()) {
    console.log("Repliers listing raw payload", { listingId, payload });
  }
  return normalizeListingDetail(payload);
}
