import type { Listing } from "./mockListings";

export type SearchPrefs = {
  maxPrice?: number;
  minBeds?: number;
  neighborhoods?: string[];
};

// Very simple MVP scoring: deterministic + explainable.
export function scoreListing(l: Listing, prefs: SearchPrefs) {
  let score = 0;
  const reasons: string[] = [];

  if (prefs.maxPrice != null) {
    if (l.price <= prefs.maxPrice) {
      score += 40;
      reasons.push(`Under max price ($${prefs.maxPrice.toLocaleString()})`);
    } else {
      score -= 20;
      reasons.push(`Over max price by $${(l.price - prefs.maxPrice).toLocaleString()}`);
    }
  }

  if (prefs.minBeds != null) {
    if (l.beds >= prefs.minBeds) {
      score += 25;
      reasons.push(`${l.beds} beds meets minimum (${prefs.minBeds})`);
    } else {
      score -= 15;
      reasons.push(`${l.beds} beds below minimum (${prefs.minBeds})`);
    }
  }

  if (prefs.neighborhoods?.length) {
    if (prefs.neighborhoods.includes(l.neighborhood)) {
      score += 20;
      reasons.push(`In preferred neighborhood (${l.neighborhood})`);
    } else {
      score -= 5;
      reasons.push(`Not in preferred neighborhoods`);
    }
  }

  // mild boost for Active
  if (l.status === "Active") score += 5;

  return { score, reasons };
}
