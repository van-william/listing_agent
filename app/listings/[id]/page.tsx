import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchNotesByKeys } from "@/lib/notes";
import { toBuildingKey, toListingKey, toNeighborhoodKey } from "@/lib/keys";
import { getListingDetailById } from "@/lib/repliers";
import { getZillowDataByAddress } from "@/lib/zillow";

function formatNumber(value?: number | null) {
  if (value == null) return "";
  return value.toLocaleString();
}

export default async function ListingDetailPage({ params }: { params: { id: string } }) {
  let listing;
  try {
    listing = await getListingDetailById(params.id);
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
  const [notes, zillowData] = await Promise.all([
    fetchNotesByKeys(keys, 8),
    getZillowDataByAddress(listing.address, listing.city || undefined, listing.state || undefined)
  ]);

  return (
    <main style={{ maxWidth: 1000, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <Link href="/listings" style={{ textDecoration: "none", color: "inherit" }}>
            ← Back to listings
          </Link>
          <h1 style={{ margin: "8px 0 0" }}>{listing.address}</h1>
          <div style={{ opacity: 0.7 }}>
            {listing.city || ""}
            {listing.neighborhood ? ` • ${listing.neighborhood}` : ""}
            {listing.status ? ` • ${listing.status}` : ""}
          </div>
        </div>
        <div style={{ fontWeight: 800, fontSize: 20 }}>
          {listing.price != null ? `$${formatNumber(listing.price)}` : "Price on request"}
        </div>
      </header>

      {/* Image Gallery */}
      {listing.images && listing.images.length > 0 ? (
        <section
          style={{
            marginTop: 16,
            padding: 12,
            borderRadius: "var(--radius)",
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))"
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18 }}>Photos</div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 12
            }}
          >
            {listing.images.map((src, index) => (
              <a
                key={`${src}-${index}`}
                href={src}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "block",
                  cursor: "pointer",
                  borderRadius: 12,
                  overflow: "hidden",
                  border: "1px solid rgb(var(--border))"
                }}
              >
                <Image
                  src={src}
                  alt={`Listing photo ${index + 1}`}
                  width={200}
                  height={180}
                  style={{
                    width: "100%",
                    height: 180,
                    objectFit: "cover"
                  }}
                  unoptimized
                />
              </a>
            ))}
          </div>
        </section>
      ) : null}

      {/* Zillow Data Section */}
      {zillowData ? (
        <section
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: "var(--radius)",
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))"
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18 }}>Zillow Insights</div>
          <div style={{ display: "grid", gap: 12 }}>
            {zillowData.zestimate != null ? (
              <div
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "rgb(var(--muted))",
                  border: "1px solid rgb(var(--border))"
                }}
              >
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Zestimate</div>
                <div style={{ fontWeight: 700, fontSize: 20, color: "rgb(var(--accent))" }}>
                  ${formatNumber(zillowData.zestimate)}
                </div>
                {listing.price != null && zillowData.zestimate != null ? (
                  <div style={{ fontSize: 12, marginTop: 4, opacity: 0.7 }}>
                    {listing.price > zillowData.zestimate
                      ? `Listed ${formatNumber(listing.price - zillowData.zestimate)} above estimate`
                      : `Listed ${formatNumber(zillowData.zestimate - listing.price)} below estimate`}
                  </div>
                ) : null}
              </div>
            ) : null}
            {zillowData.rentZestimate != null ? (
              <div>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Rent Zestimate</div>
                <div style={{ fontWeight: 600, fontSize: 16 }}>
                  ${formatNumber(zillowData.rentZestimate)}/mo
                </div>
              </div>
            ) : null}
            {(zillowData.walkScore != null || zillowData.transitScore != null) && (
              <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
                {zillowData.walkScore != null ? (
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Walk Score</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{zillowData.walkScore}/100</div>
                  </div>
                ) : null}
                {zillowData.transitScore != null ? (
                  <div>
                    <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Transit Score</div>
                    <div style={{ fontWeight: 600, fontSize: 16 }}>{zillowData.transitScore}/100</div>
                  </div>
                ) : null}
              </div>
            )}
            {zillowData.priceHistory && zillowData.priceHistory.length > 0 ? (
              <div style={{ marginTop: 8 }}>
                <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 6 }}>Price History</div>
                <div style={{ display: "grid", gap: 4, fontSize: 13 }}>
                  {zillowData.priceHistory.slice(0, 5).map((entry, idx) => (
                    <div key={idx} style={{ display: "flex", justifyContent: "space-between" }}>
                      <span>{entry.date}</span>
                      <span style={{ fontWeight: 600 }}>${formatNumber(entry.price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      {/* MLS Facts - Enhanced */}
      <section
        style={{
          marginTop: 16,
          padding: 16,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))"
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 12, fontSize: 18 }}>MLS Facts</div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: 16
          }}
        >
          {listing.beds != null && (
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Bedrooms</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{listing.beds}</div>
            </div>
          )}
          {listing.baths != null && (
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Bathrooms</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{listing.baths}</div>
            </div>
          )}
          {listing.sqft != null && (
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Square Feet</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{formatNumber(listing.sqft)}</div>
            </div>
          )}
          {listing.daysOnMarket != null && (
            <div>
              <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 4 }}>Days on Market</div>
              <div style={{ fontWeight: 600, fontSize: 18 }}>{listing.daysOnMarket}</div>
            </div>
          )}
        </div>
        <div style={{ fontSize: 12, opacity: 0.6, marginTop: 12 }}>
          MLS Listing ID: {listing.id}
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
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Details</div>
        <div style={{ display: "grid", gap: 6, fontSize: 14, opacity: 0.9 }}>
          {listing.propertyType ? <div>Property type: {listing.propertyType}</div> : null}
          {listing.propertySubType ? <div>Sub-type: {listing.propertySubType}</div> : null}
          {listing.yearBuilt ? <div>Year built: {listing.yearBuilt}</div> : null}
          {listing.parking ? <div>Parking: {listing.parking}</div> : null}
          {listing.hoaFee != null ? <div>HOA fee: ${listing.hoaFee.toLocaleString()}</div> : null}
          {listing.daysOnMarket != null ? <div>Days on market: {listing.daysOnMarket}</div> : null}
          {listing.lotSize != null ? <div>Lot size: {listing.lotSize.toLocaleString()} sqft</div> : null}
        </div>
        {listing.description ? (
          <div style={{ marginTop: 10 }}>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Description</div>
            <div style={{ opacity: 0.85 }}>{listing.description}</div>
          </div>
        ) : null}
        {listing.features && listing.features.length > 0 ? (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Features</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {listing.features.map((feature) => (
                <span
                  key={feature}
                  style={{
                    fontSize: 12,
                    padding: "4px 8px",
                    borderRadius: 999,
                    border: "1px solid rgb(var(--border))",
                    background: "rgb(var(--muted))"
                  }}
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>
        ) : null}
        {!listing.propertyType &&
        !listing.propertySubType &&
        !listing.yearBuilt &&
        !listing.parking &&
        listing.hoaFee == null &&
        listing.daysOnMarket == null &&
        listing.lotSize == null &&
        !listing.description &&
        (!listing.features || listing.features.length === 0) ? (
          <div style={{ marginTop: 8, opacity: 0.7 }}>No extra details available.</div>
        ) : null}
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

      {listing.raw ? (
        <section
          style={{
            marginTop: 16,
            padding: 16,
            borderRadius: "var(--radius)",
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))"
          }}
        >
          <details>
            <summary style={{ cursor: "pointer", fontWeight: 700 }}>All listing fields (raw)</summary>
            <pre
              style={{
                marginTop: 10,
                padding: 12,
                borderRadius: 12,
                background: "rgb(var(--muted))",
                border: "1px solid rgb(var(--border))",
                whiteSpace: "pre-wrap",
                fontSize: 12,
                lineHeight: 1.5
              }}
            >
              {JSON.stringify(listing.raw, null, 2)}
            </pre>
          </details>
        </section>
      ) : null}
    </main>
  );
}
