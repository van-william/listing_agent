"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import type { ListingSummary } from "@/lib/types";

const defaultParams = {
  q: "",
  city: "",
  minPrice: "",
  maxPrice: "",
  minBeds: "",
  maxBeds: ""
};

function formatNumber(value?: number | null) {
  if (value == null) return "";
  return value.toLocaleString();
}

export default function ListingsPage() {
  const [form, setForm] = useState(defaultParams);
  const [listings, setListings] = useState<ListingSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function runSearch(nextParams: typeof defaultParams) {
    setLoading(true);
    setError(null);

    try {
      const query = new URLSearchParams();
      if (nextParams.q) query.set("q", nextParams.q);
      if (nextParams.city) query.set("city", nextParams.city);
      if (nextParams.minPrice) query.set("minPrice", nextParams.minPrice);
      if (nextParams.maxPrice) query.set("maxPrice", nextParams.maxPrice);
      if (nextParams.minBeds) query.set("minBeds", nextParams.minBeds);
      if (nextParams.maxBeds) query.set("maxBeds", nextParams.maxBeds);

      const res = await fetch(`/api/repliers/search?${query.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Search failed");
      setListings(Array.isArray(data.listings) ? data.listings : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Search failed";
      setError(message);
      setListings([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Live MLS (Pattern A)</div>
          <h1 style={{ margin: "6px 0" }}>Chicago Listings</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" style={btn("ghost")}>Home</Link>
          <Link href="/chat" style={btn("solid")}>Advisor</Link>
          <Link href="/admin/notes" style={btn("ghost")}>Notes</Link>
        </div>
      </header>

      <section
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))"
        }}
      >
        <div style={{ display: "grid", gap: 10, gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr" }}>
          <input
            placeholder="Search (neighborhood, CTA, address)"
            value={form.q}
            onChange={(e) => setForm({ ...form, q: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="City"
            value={form.city}
            onChange={(e) => setForm({ ...form, city: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Min price"
            value={form.minPrice}
            onChange={(e) => setForm({ ...form, minPrice: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Max price"
            value={form.maxPrice}
            onChange={(e) => setForm({ ...form, maxPrice: e.target.value })}
            style={inputStyle}
          />
          <input
            placeholder="Min beds"
            value={form.minBeds}
            onChange={(e) => setForm({ ...form, minBeds: e.target.value })}
            style={inputStyle}
          />
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
          <button
            onClick={() => void runSearch(form)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgb(var(--accent))",
              color: "rgb(var(--accentFg))",
              border: "none",
              fontWeight: 700
            }}
            disabled={loading}
          >
            {loading ? "Searching..." : "Search"}
          </button>
          <button
            onClick={() => {
              setForm(defaultParams);
              void runSearch(defaultParams);
            }}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgb(var(--border))",
              background: "rgb(var(--card))",
              fontWeight: 700
            }}
          >
            Reset
          </button>
        </div>
        {error ? <div style={{ marginTop: 8, color: "#b91c1c" }}>{error}</div> : null}
      </section>

      <section style={{ marginTop: 16, display: "grid", gap: 12 }}>
        {listings.length === 0 && !loading ? (
          <div
            style={{
              padding: 16,
              borderRadius: "var(--radius)",
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
              opacity: 0.8
            }}
          >
            No results yet. Try a broader search.
          </div>
        ) : null}
        {listings.map((listing) => (
          <Link
            key={listing.id}
            href={`/listings/${encodeURIComponent(listing.id)}`}
            style={{ textDecoration: "none", color: "inherit" }}
          >
            <article
              style={{
                borderRadius: "var(--radius)",
                background: "rgb(var(--card))",
                border: "1px solid rgb(var(--border))",
                overflow: "hidden",
                display: "grid",
                gridTemplateColumns: "280px 1fr",
                gap: 0,
                transition: "transform 0.2s, box-shadow 0.2s",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Image Section */}
              <div
                style={{
                  width: "100%",
                  height: 200,
                  background: "rgb(var(--muted))",
                  position: "relative",
                  overflow: "hidden"
                }}
              >
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    src={listing.images[0]}
                    alt={listing.address}
                    width={280}
                    height={200}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover"
                    }}
                    unoptimized
                  />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      opacity: 0.5,
                      fontSize: 12
                    }}
                  >
                    No image
                  </div>
                )}
                {listing.status && (
                  <div
                    style={{
                      position: "absolute",
                      top: 8,
                      right: 8,
                      padding: "4px 8px",
                      borderRadius: 4,
                      background:
                        listing.status === "Active"
                          ? "rgba(34, 197, 94, 0.9)"
                          : listing.status === "Under Contract"
                            ? "rgba(251, 191, 36, 0.9)"
                            : "rgba(107, 114, 128, 0.9)",
                      color: "white",
                      fontSize: 11,
                      fontWeight: 600
                    }}
                  >
                    {listing.status}
                  </div>
                )}
              </div>

              {/* Content Section */}
              <div style={{ padding: 16, display: "grid", gap: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{listing.address}</div>
                    <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>
                      {listing.neighborhood || listing.city || ""}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 18, color: "rgb(var(--accent))" }}>
                    {listing.price != null ? `$${formatNumber(listing.price)}` : "Price on request"}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: 16,
                    fontSize: 14,
                    opacity: 0.85,
                    paddingTop: 8,
                    borderTop: "1px solid rgb(var(--border))"
                  }}
                >
                  {listing.beds != null ? (
                    <div>
                      <strong>{listing.beds}</strong> bed{listing.beds !== 1 ? "s" : ""}
                    </div>
                  ) : null}
                  {listing.baths != null ? (
                    <div>
                      <strong>{listing.baths}</strong> bath{listing.baths !== 1 ? "s" : ""}
                    </div>
                  ) : null}
                  {listing.sqft != null ? (
                    <div>
                      <strong>{formatNumber(listing.sqft)}</strong> sqft
                    </div>
                  ) : null}
                </div>
              </div>
            </article>
          </Link>
        ))}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgb(var(--border))",
  background: "rgb(var(--card))"
};

function btn(kind: "solid" | "ghost"): React.CSSProperties {
  return kind === "solid"
    ? {
        padding: "10px 12px",
        borderRadius: 10,
        background: "rgb(var(--accent))",
        color: "rgb(var(--accentFg))",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 13
      }
    : {
        padding: "10px 12px",
        borderRadius: 10,
        border: "1px solid rgb(var(--border))",
        background: "rgb(var(--card))",
        color: "rgb(var(--fg))",
        textDecoration: "none",
        fontWeight: 700,
        fontSize: 13
      };
}
