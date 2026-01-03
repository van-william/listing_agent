"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RealtorNoteSummary } from "@/lib/types";

const scopes = ["global", "listing", "building", "neighborhood"] as const;

type Scope = (typeof scopes)[number];

export default function NotesAdminPage() {
  const [scope, setScope] = useState<Scope>("global");
  const [listingId, setListingId] = useState("");
  const [buildingAddress, setBuildingAddress] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [notes, setNotes] = useState<RealtorNoteSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadNotes() {
    setError(null);
    try {
      const res = await fetch("/api/notes?limit=20");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load notes");
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notes";
      setError(message);
    }
  }

  useEffect(() => {
    void loadNotes();
  }, []);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope,
          listingId: listingId || null,
          buildingAddress: buildingAddress || null,
          neighborhood: neighborhood || null,
          content: content.trim(),
          tags
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save note");

      setContent("");
      setTags("");
      if (scope === "listing") setListingId("");
      if (scope === "building") setBuildingAddress("");
      if (scope === "neighborhood") setNeighborhood("");
      await loadNotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save note";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Admin</div>
          <h1 style={{ margin: "6px 0" }}>Realtor Notes</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" style={btn("ghost")}>Home</Link>
          <Link href="/listings" style={btn("solid")}>Listings</Link>
          <Link href="/chat" style={btn("ghost")}>Advisor</Link>
        </div>
      </header>

      <section
        style={{
          marginTop: 14,
          padding: 16,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
          display: "grid",
          gap: 12
        }}
      >
        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 700 }}>Scope</div>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
            style={inputStyle}
          >
            {scopes.map((value) => (
              <option key={value} value={value}>{value}</option>
            ))}
          </select>
        </label>

        {scope === "listing" ? (
          <label style={{ display: "grid", gap: 6 }}>
            <div>Listing ID</div>
            <input value={listingId} onChange={(e) => setListingId(e.target.value)} style={inputStyle} />
          </label>
        ) : null}

        {scope === "building" ? (
          <label style={{ display: "grid", gap: 6 }}>
            <div>Building address</div>
            <input
              value={buildingAddress}
              onChange={(e) => setBuildingAddress(e.target.value)}
              style={inputStyle}
            />
          </label>
        ) : null}

        {scope === "neighborhood" ? (
          <label style={{ display: "grid", gap: 6 }}>
            <div>Neighborhood</div>
            <input
              value={neighborhood}
              onChange={(e) => setNeighborhood(e.target.value)}
              style={inputStyle}
            />
          </label>
        ) : null}

        <label style={{ display: "grid", gap: 6 }}>
          <div>Tags (comma separated)</div>
          <input value={tags} onChange={(e) => setTags(e.target.value)} style={inputStyle} />
        </label>

        <label style={{ display: "grid", gap: 6 }}>
          <div>Note</div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            style={{ ...inputStyle, minHeight: 120, resize: "vertical" }}
          />
        </label>

        <button
          onClick={() => void handleSubmit()}
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgb(var(--accent))",
            color: "rgb(var(--accentFg))",
            border: "none",
            fontWeight: 700,
            width: 160
          }}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save note"}
        </button>
        {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
      </section>

      <section style={{ marginTop: 16, display: "grid", gap: 10 }}>
        <div style={{ fontWeight: 700 }}>Recent notes</div>
        {notes.length === 0 ? (
          <div style={{ opacity: 0.7 }}>No notes yet.</div>
        ) : (
          notes.map((note) => (
            <article
              key={note.id}
              style={{
                padding: 12,
                borderRadius: "var(--radius)",
                background: "rgb(var(--card))",
                border: "1px solid rgb(var(--border))",
                display: "grid",
                gap: 6
              }}
            >
              <div style={{ fontSize: 12, opacity: 0.7 }}>{note.scope}</div>
              <div>{note.content}</div>
              <div style={{ fontSize: 12, opacity: 0.7 }}>
                {note.tags?.length ? `Tags: ${note.tags.join(", ")}` : ""}
              </div>
            </article>
          ))
        )}
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
