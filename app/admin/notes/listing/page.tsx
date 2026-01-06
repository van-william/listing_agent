"use client";

import Link from "next/link";
import { useState } from "react";
import type { ListingSummary } from "@/lib/types";

export default function ListingNotesPage() {
  const [listingId, setListingId] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<ListingSummary[]>([]);
  const [searching, setSearching] = useState(false);

  async function searchListings() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const query = new URLSearchParams();
      query.set("q", searchQuery);
      // City can be added if needed, but not defaulting to Chicago
      const res = await fetch(`/api/repliers/search?${query.toString()}`);
      const data = await res.json();
      if (res.ok) {
        setSearchResults(Array.isArray(data.listings) ? data.listings : []);
      }
    } catch (err) {
      console.error("Search failed", err);
    } finally {
      setSearching(false);
    }
  }

  async function handleSubmit() {
    if (!content.trim() || !listingId.trim()) {
      setError("Listing ID and content are required");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "listing",
          listingId: listingId.trim(),
          content: content.trim(),
          tags
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");

      setContent("");
      setTags("");
      setListingId("");
      setSearchQuery("");
      setSearchResults([]);
      alert("Note saved successfully!");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save note";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ textDecoration: "none", color: "inherit", fontSize: 14, opacity: 0.7 }}>
          ← Back to Admin Dashboard
        </Link>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>Add Listing Note</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          Add insights and knowledge for a specific MLS listing. These notes will appear on the listing detail page.
        </p>
      </header>

      <section
        style={{
          padding: 20,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
          marginBottom: 24
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 18, fontWeight: 600 }}>Search for Listing</h2>
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          <input
            placeholder="Search by address, neighborhood, or MLS number"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void searchListings();
            }}
            style={inputStyle}
          />
          <button
            onClick={() => void searchListings()}
            disabled={searching}
            style={{
              padding: "10px 20px",
              borderRadius: 10,
              background: "rgb(var(--accent))",
              color: "rgb(var(--accentFg))",
              border: "none",
              fontWeight: 700,
              cursor: searching ? "not-allowed" : "pointer",
              opacity: searching ? 0.6 : 1
            }}
          >
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
        {searchResults.length > 0 && (
          <div style={{ marginTop: 12, display: "grid", gap: 8 }}>
            {searchResults.slice(0, 5).map((listing) => (
              <button
                key={listing.id}
                onClick={() => {
                  setListingId(listing.id);
                  setSearchQuery(listing.address);
                  setSearchResults([]);
                }}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  border: "1px solid rgb(var(--border))",
                  background: listingId === listing.id ? "rgb(var(--muted))" : "rgb(var(--card))",
                  textAlign: "left",
                  cursor: "pointer",
                  display: "grid",
                  gap: 4
                }}
              >
                <div style={{ fontWeight: 600 }}>{listing.address}</div>
                <div style={{ fontSize: 12, opacity: 0.7 }}>
                  {listing.neighborhood || listing.city} • {listing.beds}bd/{listing.baths}ba • $
                  {listing.price?.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, opacity: 0.6 }}>MLS ID: {listing.id}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      <section
        style={{
          padding: 20,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
          display: "grid",
          gap: 16
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 0, fontSize: 18, fontWeight: 600 }}>Note Details</h2>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Listing ID *</div>
          <input
            placeholder="Enter MLS listing ID (e.g., 12345678)"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            style={inputStyle}
          />
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            Use the search above to find listings, or enter the MLS ID directly
          </div>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Tags (comma separated)</div>
          <input
            placeholder="e.g., quiet, good-value, near-transit"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Note Content *</div>
          <textarea
            placeholder="Share your insights about this listing. What makes it special? Any concerns? What type of buyer would this suit?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ ...inputStyle, minHeight: 150, resize: "vertical" }}
          />
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            This note will be embedded and used in the chat advisor for relevant queries
          </div>
        </label>

        <button
          onClick={() => void handleSubmit()}
          style={{
            padding: "12px 24px",
            borderRadius: 10,
            background: "rgb(var(--accent))",
            color: "rgb(var(--accentFg))",
            border: "none",
            fontWeight: 700,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.6 : 1
          }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save Listing Note"}
        </button>
        {error ? (
          <div style={{ padding: 12, borderRadius: 8, background: "#fee2e2", color: "#b91c1c", fontSize: 14 }}>
            {error}
          </div>
        ) : null}
      </section>
    </main>
  );
}

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgb(var(--border))",
  background: "rgb(var(--card))",
  fontSize: 14
};

