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
  const [editingNote, setEditingNote] = useState<RealtorNoteSummary | null>(null);
  const [filterScope, setFilterScope] = useState<Scope | "all">("all");

  async function loadNotes() {
    setError(null);
    try {
      const res = await fetch("/api/notes?limit=50");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load notes");
      setNotes(Array.isArray(data.notes) ? data.notes : []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load notes";
      setError(message);
    }
  }

  function startEdit(note: RealtorNoteSummary) {
    setEditingNote(note);
    setScope(note.scope as Scope);
    setContent(note.content);
    setTags(note.tags?.join(", ") || "");
    if (note.listing_key) {
      const id = note.listing_key.replace(/^mred:/, "");
      setListingId(id);
    }
    if (note.building_key) {
      const addr = note.building_key.replace(/^building:/, "").replace(/_/g, " ");
      setBuildingAddress(addr);
    }
    if (note.neighborhood_key) {
      const hood = note.neighborhood_key.replace(/^neighborhood:/, "").replace(/-/g, " ");
      setNeighborhood(hood);
    }
    // Scroll to form
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingNote(null);
    setContent("");
    setTags("");
    setListingId("");
    setBuildingAddress("");
    setNeighborhood("");
    setScope("global");
  }

  useEffect(() => {
    void loadNotes();
  }, []);

  async function handleSubmit() {
    if (!content.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const url = editingNote ? `/api/notes/${editingNote.id}` : "/api/notes";
      const method = editingNote ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
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

      cancelEdit();
      await loadNotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to save note";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(noteId: string) {
    if (!confirm("Are you sure you want to delete this note?")) return;
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/notes/${noteId}`, {
        method: "DELETE"
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to delete note");
      }
      await loadNotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to delete note";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  const filteredNotes =
    filterScope === "all"
      ? notes
      : notes.filter((note) => note.scope === filterScope);

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ textDecoration: "none", color: "inherit", fontSize: 14, opacity: 0.7 }}>
          ← Back to Admin Dashboard
        </Link>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>All Notes</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          View and manage all your notes. Use the quick links below to add notes for specific scopes.
        </p>
      </header>

      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        <Link href="/admin/notes/listing" style={btn("solid")}>+ Listing Note</Link>
        <Link href="/admin/notes/neighborhood" style={btn("solid")}>+ Neighborhood Note</Link>
        <Link href="/admin/notes/building" style={btn("solid")}>+ Building Note</Link>
        <Link href="/admin/notes/global" style={btn("solid")}>+ Global Note</Link>
      </div>

      <section
        style={{
          marginTop: 14,
          padding: 20,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
          display: "grid",
          gap: 16
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>
            {editingNote ? "Edit Note" : "Create New Note"}
          </div>
          {editingNote && (
            <button
              onClick={cancelEdit}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                border: "1px solid rgb(var(--border))",
                background: "rgb(var(--card))",
                fontSize: 13,
                cursor: "pointer"
              }}
            >
              Cancel
            </button>
          )}
        </div>

        <label style={{ display: "grid", gap: 6 }}>
          <div style={{ fontWeight: 600, fontSize: 14 }}>Scope</div>
          <select
            value={scope}
            onChange={(e) => setScope(e.target.value as Scope)}
            style={inputStyle}
            disabled={!!editingNote}
          >
            {scopes.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
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

        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => void handleSubmit()}
            style={{
              padding: "12px 20px",
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
            {loading ? "Saving..." : editingNote ? "Update Note" : "Create Note"}
          </button>
        </div>
        {error ? (
          <div style={{ padding: 12, borderRadius: 8, background: "#fee2e2", color: "#b91c1c", fontSize: 14 }}>
            {error}
          </div>
        ) : null}
      </section>

      <section style={{ marginTop: 24, display: "grid", gap: 16 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontWeight: 700, fontSize: 18 }}>All Notes ({filteredNotes.length})</div>
          <select
            value={filterScope}
            onChange={(e) => setFilterScope(e.target.value as Scope | "all")}
            style={{
              ...inputStyle,
              padding: "8px 12px",
              fontSize: 13
            }}
          >
            <option value="all">All Scopes</option>
            {scopes.map((value) => (
              <option key={value} value={value}>
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </option>
            ))}
          </select>
        </div>
        {filteredNotes.length === 0 ? (
          <div
            style={{
              padding: 24,
              borderRadius: "var(--radius)",
              background: "rgb(var(--card))",
              border: "1px solid rgb(var(--border))",
              textAlign: "center",
              opacity: 0.7
            }}
          >
            No notes {filterScope !== "all" ? `with scope "${filterScope}"` : ""} yet.
          </div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {filteredNotes.map((note) => (
              <article
                key={note.id}
                style={{
                  padding: 16,
                  borderRadius: "var(--radius)",
                  background: "rgb(var(--card))",
                  border: "1px solid rgb(var(--border))",
                  display: "grid",
                  gap: 10
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span
                      style={{
                        fontSize: 11,
                        padding: "4px 8px",
                        borderRadius: 4,
                        background: "rgb(var(--muted))",
                        fontWeight: 600,
                        textTransform: "uppercase"
                      }}
                    >
                      {note.scope}
                    </span>
                    {note.listing_key && (
                      <span style={{ fontSize: 11, opacity: 0.7 }}>
                        Listing: {note.listing_key.replace(/^mred:/, "")}
                      </span>
                    )}
                    {note.building_key && (
                      <span style={{ fontSize: 11, opacity: 0.7 }}>
                        Building: {note.building_key.replace(/^building:/, "").replace(/_/g, " ")}
                      </span>
                    )}
                    {note.neighborhood_key && (
                      <span style={{ fontSize: 11, opacity: 0.7 }}>
                        Neighborhood: {note.neighborhood_key.replace(/^neighborhood:/, "").replace(/-/g, " ")}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      onClick={() => startEdit(note)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid rgb(var(--border))",
                        background: "rgb(var(--card))",
                        fontSize: 12,
                        cursor: "pointer"
                      }}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => void handleDelete(note.id)}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        border: "1px solid #dc2626",
                        background: "#fee2e2",
                        color: "#b91c1c",
                        fontSize: 12,
                        cursor: "pointer"
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                <div style={{ lineHeight: 1.6 }}>{note.content}</div>
                {note.tags && note.tags.length > 0 && (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                    {note.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontSize: 11,
                          padding: "4px 8px",
                          borderRadius: 4,
                          background: "rgb(var(--muted))",
                          border: "1px solid rgb(var(--border))"
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                <div style={{ fontSize: 11, opacity: 0.6 }}>
                  Created: {new Date(note.created_at).toLocaleString()}
                </div>
              </article>
            ))}
          </div>
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
