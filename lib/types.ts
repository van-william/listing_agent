export type ListingSummary = {
  id: string;
  address: string;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  price?: number | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  status?: string | null;
  neighborhood?: string | null;
  images?: string[];
};

export type ListingDetail = ListingSummary & {
  propertyType?: string | null;
  propertySubType?: string | null;
  yearBuilt?: number | null;
  parking?: string | null;
  hoaFee?: number | null;
  daysOnMarket?: number | null;
  lotSize?: number | null;
  description?: string | null;
  features?: string[];
  raw?: Record<string, unknown>;
};

export type RealtorNoteSummary = {
  id: string;
  scope: string;
  content: string;
  listing_key: string | null;
  building_key: string | null;
  neighborhood_key: string | null;
  tags: string[];
  created_at: string;
};

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
