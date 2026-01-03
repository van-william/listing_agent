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
