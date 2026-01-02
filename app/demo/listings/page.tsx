import Link from "next/link";
import { mockListings } from "@/lib/mockListings";

export default function ListingsPage() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <TopNav />

      <div style={{ display: "grid", gridTemplateColumns: "260px 1fr 360px", gap: 14, alignItems: "start" }}>
        <Filters />

        <section style={{ background: "white", border: "1px solid #eaeaea", borderRadius: 14, padding: 14 }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
            <h2 style={{ margin: 0 }}>Ranked results</h2>
            <div style={{ opacity: 0.7, fontSize: 13 }}>Mock data • {mockListings.length} listings</div>
          </div>

          <div style={{ marginTop: 10, display: "grid", gap: 10 }}>
            {mockListings.map((l) => (
              <Link key={l.id} href={`/demo/listings/${l.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ border: "1px solid #efefef", borderRadius: 14, padding: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <div>
                      <div style={{ fontWeight: 750 }}>{l.address}</div>
                      <div style={{ fontSize: 13, opacity: 0.75 }}>{l.neighborhood} • {l.status}</div>
                    </div>
                    <div style={{ fontWeight: 750 }}>${l.price.toLocaleString()}</div>
                  </div>
                  <div style={{ marginTop: 8, fontSize: 13, opacity: 0.85 }}>
                    {l.beds} bd • {l.baths} ba • {l.sqft.toLocaleString()} sqft
                  </div>
                  <div style={{ marginTop: 8, display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {l.highlights.map((h) => (
                      <span key={h} style={{ fontSize: 12, padding: "4px 8px", borderRadius: 999, border: "1px solid #eee", background: "#fcfcfc" }}>{h}</span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <Aside />
      </div>
    </main>
  );
}

function TopNav() {
  return (
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
      <div>
        <div style={{ fontSize: 12, opacity: 0.7 }}>Demo Portal</div>
        <div style={{ fontSize: 18, fontWeight: 800 }}>Listings • Chicago</div>
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <Link href="/" style={btn("ghost")}>Home</Link>
        <Link href="/demo/listings" style={btn("solid")}>Listings</Link>
      </div>
    </header>
  );
}

function Filters() {
  return (
    <aside style={{ background: "white", border: "1px solid #eaeaea", borderRadius: 14, padding: 14 }}>
      <div style={{ fontWeight: 800, marginBottom: 8 }}>Filters (stub)</div>
      <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
        In MVP we’ll implement these as real query params backed by Postgres/PostGIS:
        <ul>
          <li>Price range</li>
          <li>Beds / Baths</li>
          <li>Neighborhood</li>
          <li>CTA / commute</li>
          <li>Parking / pets / HOA</li>
        </ul>
      </div>
    </aside>
  );
}

function Aside() {
  return (
    <aside style={{ display: "grid", gap: 12 }}>
      <div style={{ background: "white", border: "1px solid #eaeaea", borderRadius: 14, padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Map (placeholder)</div>
        <div style={{ height: 220, borderRadius: 12, border: "1px dashed #ddd", display: "grid", placeItems: "center", opacity: 0.7 }}>
          Map pins + draw area
        </div>
      </div>

      <div style={{ background: "white", border: "1px solid #eaeaea", borderRadius: 14, padding: 14 }}>
        <div style={{ fontWeight: 800, marginBottom: 6 }}>Advisor (demo)</div>
        <div style={{ fontSize: 13, opacity: 0.8, lineHeight: 1.5 }}>
          Ask: “Find me a 2 bed under $650k near Brown Line, quiet.”
          <div style={{ marginTop: 10 }}>
            <Link href="/demo" style={btn("solid")}>Open Advisor</Link>
          </div>
        </div>
      </div>
    </aside>
  );
}

function btn(kind: "solid" | "ghost"): React.CSSProperties {
  return kind === "solid"
    ? { padding: "10px 12px", borderRadius: 10, background: "#111", color: "white", textDecoration: "none", fontWeight: 700, fontSize: 13 }
    : { padding: "10px 12px", borderRadius: 10, border: "1px solid #eaeaea", background: "white", color: "#111", textDecoration: "none", fontWeight: 700, fontSize: 13 };
}
