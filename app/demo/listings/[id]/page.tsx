import Link from "next/link";
import { getListing } from "@/lib/mockListings";
import ChatBox from "./ChatBox";

export default async function ListingDetail({ params }: { params: { id: string } }) {
  const listing = getListing(params.id);

  if (!listing) {
    return (
      <main style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
        <Link href="/demo/listings" style={{ textDecoration: "none", color: "inherit" }}>← Back</Link>
        <h1>Not found</h1>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, marginBottom: 12 }}>
        <div>
          <Link href="/demo/listings" style={{ textDecoration: "none", color: "inherit" }}>← Back to results</Link>
          <h1 style={{ margin: "8px 0 0" }}>{listing.address}</h1>
          <div style={{ opacity: 0.75 }}>{listing.neighborhood} • {listing.status}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 22, fontWeight: 900 }}>${listing.price.toLocaleString()}</div>
          <div style={{ opacity: 0.75, fontSize: 13 }}>{listing.beds} bd • {listing.baths} ba • {listing.sqft.toLocaleString()} sqft</div>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 14, alignItems: "start" }}>
        <section
          style={{
            background: "rgb(var(--card))",
            border: "1px solid rgb(var(--border))",
            borderRadius: "var(--radius)",
            padding: 14
          }}
        >
          <div
            style={{
              height: 260,
              borderRadius: 12,
              border: "1px dashed rgb(var(--border))",
              display: "grid",
              placeItems: "center",
              opacity: 0.7
            }}
          >
            Photos / media carousel (placeholder)
          </div>

          <h2 style={{ marginTop: 14 }}>MLS facts (mock)</h2>
          <ul style={{ marginTop: 8, opacity: 0.9, lineHeight: 1.6 }}>
            <li>Neighborhood: {listing.neighborhood}</li>
            <li>Status: {listing.status}</li>
            <li>Price: ${listing.price.toLocaleString()}</li>
            <li>Beds/Baths: {listing.beds}/{listing.baths}</li>
            <li>Sqft: {listing.sqft.toLocaleString()}</li>
          </ul>

          <h2 style={{ marginTop: 14 }}>Realtor perspective (demo)</h2>
          <div
            style={{
              padding: 12,
              borderRadius: 12,
              background: "rgb(var(--muted))",
              border: "1px solid rgb(var(--border))"
            }}
          >
            <div style={{ fontWeight: 800, marginBottom: 6 }}>Highlights / watchouts</div>
            <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9, lineHeight: 1.6 }}>
              {listing.highlights.map((h) => (<li key={h}>{h}</li>))}
            </ul>
            <div style={{ marginTop: 10, fontSize: 12, opacity: 0.7 }}>
              In the real system, this is retrieved from the agent’s notes (RAG) and clearly labeled as “agent insight.”
            </div>
          </div>
        </section>

        <AdvisorPanel listingId={listing.id} />
      </div>
    </main>
  );
}

function AdvisorPanel({ listingId }: { listingId: string }) {
  return (
    <section
      style={{
        background: "rgb(var(--card))",
        border: "1px solid rgb(var(--border))",
        borderRadius: "var(--radius)",
        padding: 14
      }}
    >
      <div style={{ fontWeight: 900, marginBottom: 6 }}>Advisor Q&A (demo)</div>
      <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 10 }}>
        Ask anything — the demo endpoint returns a structured answer with “MLS facts vs agent notes.”
      </div>
      <ChatBox listingId={listingId} />
    </section>
  );
}
