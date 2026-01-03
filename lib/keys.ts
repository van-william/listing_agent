const UNIT_PATTERNS = [
  "#",
  "unit",
  "apt",
  "apartment",
  "suite",
  "ste",
  "floor",
  "fl"
];

function stripUnit(address: string) {
  const lower = address.toLowerCase();
  const hashIndex = lower.indexOf("#");
  if (hashIndex >= 0) return address.slice(0, hashIndex);

  const pattern = new RegExp(`\\b(${UNIT_PATTERNS.join("|")})\\b.*$`, "i");
  return address.replace(pattern, "");
}

function slugify(input: string, sep: "_" | "-" = "_") {
  return input
    .toLowerCase()
    .replace(/['`]/g, "")
    .replace(/[^a-z0-9]+/g, sep)
    .replace(new RegExp(`${sep}+`, "g"), sep)
    .replace(new RegExp(`^${sep}|${sep}$`, "g"), "");
}

export function toListingKey(listingId: string) {
  return `mred:${slugify(listingId, "-")}`;
}

export function toBuildingKey(address: string) {
  const cleaned = stripUnit(address);
  return `building:${slugify(cleaned, "_")}`;
}

export function toNeighborhoodKey(name: string) {
  return `neighborhood:${slugify(name, "-")}`;
}

export function buildMatchKeys(input: {
  listingId?: string | null;
  buildingAddress?: string | null;
  neighborhood?: string | null;
}) {
  const keys: string[] = [];
  if (input.listingId) keys.push(toListingKey(input.listingId));
  if (input.buildingAddress) keys.push(toBuildingKey(input.buildingAddress));
  if (input.neighborhood) keys.push(toNeighborhoodKey(input.neighborhood));
  return keys;
}
