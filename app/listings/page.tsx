"use client";

import Link from "next/link";
import { useState } from "react";
import type { ListingSummary } from "@/lib/types";

const defaultParams = {
  q: "",
  city: "Chicago",
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
                padding: 14,
                borderRadius: "var(--radius)",
                background: "rgb(var(--card))",
                border: "1px solid rgb(var(--border))",
                display: "grid",
                gap: 8
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                <div style={{ fontWeight: 700 }}>{listing.address}</div>
                <div style={{ fontWeight: 700 }}>
                  {listing.price != null ? `$${formatNumber(listing.price)}` : "Price on request"}
                </div>
              </div>
              <div style={{ fontSize: 13, opacity: 0.75 }}>
                {listing.neighborhood || listing.city || "Chicago"}
                {listing.status ? ` • ${listing.status}` : ""}
              </div>
              <div style={{ fontSize: 13, opacity: 0.85 }}>
                {listing.beds != null ? `${listing.beds} bd` : "Beds ?"} •
                {listing.baths != null ? ` ${listing.baths} ba` : " Baths ?"} •
                {listing.sqft != null ? ` ${formatNumber(listing.sqft)} sqft` : " Sqft ?"}
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
