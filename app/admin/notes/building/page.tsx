"use client";

import Link from "next/link";
import { useState } from "react";

export default function BuildingNotesPage() {
  const [buildingAddress, setBuildingAddress] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    if (!content.trim() || !buildingAddress.trim()) {
      setError("Building address and content are required");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "building",
          buildingAddress: buildingAddress.trim(),
          content: content.trim(),
          tags
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");

      setContent("");
      setTags("");
      setBuildingAddress("");
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
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>Add Building Note</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          Add notes about a specific building. These will appear on all listings in that building and be used by the chat advisor.
        </p>
      </header>

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
          <div style={{ fontWeight: 600, fontSize: 14 }}>Building Address *</div>
          <input
            placeholder="e.g., 2330 N Clark St, Chicago, IL 60614"
            value={buildingAddress}
            onChange={(e) => setBuildingAddress(e.target.value)}
            style={inputStyle}
          />
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            Enter the full address (unit number will be automatically stripped). This note will apply to all units in this building.
          </div>
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Tags (comma separated)</div>
          <input
            placeholder="e.g., well-maintained, pet-friendly, good-management"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            style={inputStyle}
          />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Note Content *</div>
          <textarea
            placeholder="Share insights about this building. Building quality? Management? Amenities? Common issues? What to know about living here?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ ...inputStyle, minHeight: 200, resize: "vertical" }}
          />
          <div style={{ fontSize: 12, opacity: 0.6 }}>
            This note will be embedded and used in the chat advisor for relevant queries about this building
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
          {loading ? "Saving..." : "Save Building Note"}
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

