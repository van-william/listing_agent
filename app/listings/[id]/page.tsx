import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNotesByKeys } from "@/lib/notes";
import { toBuildingKey, toListingKey, toNeighborhoodKey } from "@/lib/keys";
import { getListingById } from "@/lib/repliers";

function formatNumber(value?: number | null) {
  if (value == null) return "";
  return value.toLocaleString();
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  let listing;
  try {
    listing = await getListingById(params.id);
  } catch {
    notFound();
  }

  const listingKey = toListingKey(params.id);
  const buildingAddress = [listing.address, listing.city, listing.state, listing.postalCode]
    .filter(Boolean)
    .join(", ");
  const buildingKey = buildingAddress ? toBuildingKey(buildingAddress) : null;
  const neighborhoodKey = listing.neighborhood ? toNeighborhoodKey(listing.neighborhood) : null;

  const keys = [listingKey, buildingKey, neighborhoodKey].filter(Boolean) as string[];
  const notes = await fetchNotesByKeys(keys, 8);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link href="/listings" style={{ textDecoration: "none", color: "inherit" }}>
            ← Back to listings
          </Link>
          <h1 style={{ margin: "8px 0 0" }}>{listing.address}</h1>
          <div style={{ opacity: 0.7 }}>
            {listing.city || "Chicago"}
            {listing.neighborhood ? ` • ${listing.neighborhood}` : ""}
            {listing.status ? ` • ${listing.status}` : ""}
          </div>
        </div>
        <div style={{ fontWeight: 800, fontSize: 20 }}>
          {listing.price != null ? `$${formatNumber(listing.price)}` : "Price on request"}
        </div>
      </header>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
          display: "grid",
          gap: 10
        }}
      >
        <div style={{ fontWeight: 700 }}>MLS facts</div>
        <div style={{ fontSize: 14, opacity: 0.85 }}>
          {listing.beds != null ? `${listing.beds} beds` : "Beds ?"} •
          {listing.baths != null ? ` ${listing.baths} baths` : " Baths ?"} •
          {listing.sqft != null ? ` ${formatNumber(listing.sqft)} sqft` : " Sqft ?"}
        </div>
        <div style={{ fontSize: 13, opacity: 0.75 }}>
          Listing ID: {listing.id}
        </div>
      </section>

      <section
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))"
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Realtor notes</div>
        {notes.length === 0 ? (
          <div style={{ opacity: 0.75 }}>No notes yet.</div>
        ) : (
          <ul style={{ margin: 0, paddingLeft: 18, display: "grid", gap: 8 }}>
            {notes.map((note) => (
              <li key={note.id} style={{ lineHeight: 1.5 }}>
                {note.content}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
