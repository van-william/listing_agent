export type Listing = {
  id: string;
  address: string;
  neighborhood: string;
  price: number;
  beds: number;
  baths: number;
  sqft: number;
  status: "Active" | "Pending" | "Closed";
  lat: number;
  lng: number;
  highlights: string[];
};

export const mockListings: Listing[] = [
  {
    id: "CHI-1001",
    address: "233 W Lake St #1205",
    neighborhood: "Loop",
    price: 625000,
    beds: 2,
    baths: 2,
    sqft: 1180,
    status: "Active",
    lat: 41.8855,
    lng: -87.6344,
    highlights: ["Walk to CTA", "Great natural light", "Gym + doorman"]
  },
  {
    id: "CHI-1002",
    address: "1430 N Dearborn St #9A",
    neighborhood: "Gold Coast",
    price: 749000,
    beds: 2,
    baths: 2,
    sqft: 1320,
    status: "Active",
    lat: 41.9070,
    lng: -87.6295,
    highlights: ["Classic building", "Quiet north-facing", "Parking may be waitlisted"]
  },
  {
    id: "CHI-1003",
    address: "1722 W Division St #3",
    neighborhood: "Wicker Park",
    price: 579000,
    beds: 3,
    baths: 2,
    sqft: 1450,
    status: "Active",
    lat: 41.9035,
    lng: -87.6710,
    highlights: ["Near Blue Line", "Top-floor", "Good nightlife access"]
  },
  {
    id: "CHI-1004",
    address: "454 W Briar Pl #4E",
    neighborhood: "Lakeview",
    price: 410000,
    beds: 2,
    baths: 1,
    sqft: 980,
    status: "Pending",
    lat: 41.9392,
    lng: -87.6405,
    highlights: ["Near lakefront", "Older HVAC", "Strong resale demand"]
  }
];

export function getListing(id: string) {
  return mockListings.find((x) => x.id === id);
}
