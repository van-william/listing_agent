"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RealtorNoteSummary } from "@/lib/types";

type RealtorNoteWithEmbedding = RealtorNoteSummary & {
  has_embedding?: boolean;
};

export default function EmbeddingsAdminPage() {
  const [notes, setNotes] = useState<RealtorNoteWithEmbedding[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    withEmbeddings: 0,
    withoutEmbeddings: 0
  });
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    void loadNotes();
  }, []);

  async function loadNotes() {
    setLoading(true);
    try {
      const res = await fetch("/api/notes?limit=1000");
      const data = await res.json();
      if (res.ok && Array.isArray(data.notes)) {
        const allNotes = data.notes as RealtorNoteWithEmbedding[];
        setNotes(allNotes);
        setStats({
          total: allNotes.length,
          withEmbeddings: allNotes.filter((n) => n.has_embedding !== false).length,
          withoutEmbeddings: allNotes.filter((n) => n.has_embedding === false).length
        });
      }
    } catch (err) {
      console.error("Failed to load notes", err);
    } finally {
      setLoading(false);
    }
  }

  async function regenerateEmbedding(noteId: string) {
    setRegenerating(noteId);
    try {
      const note = notes.find((n) => n.id === noteId);
      if (!note) throw new Error("Note not found");

      const res = await fetch(`/api/embeddings/regenerate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to regenerate embedding");

      alert("Embedding regenerated successfully!");
      await loadNotes();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to regenerate embedding";
      alert(`Error: ${message}`);
    } finally {
      setRegenerating(null);
    }
  }

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <header style={{ marginBottom: 24 }}>
        <Link href="/admin" style={{ textDecoration: "none", color: "inherit", fontSize: 14, opacity: 0.7 }}>
          ← Back to Admin Dashboard
        </Link>
        <h1 style={{ margin: "8px 0 0", fontSize: 28, fontWeight: 700 }}>Embeddings Management</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          Verify and manage embeddings for your notes. Embeddings enable semantic search in the chat advisor.
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard title="Total Notes" value={stats.total} />
        <StatCard title="With Embeddings" value={stats.withEmbeddings} color="#10b981" />
        <StatCard title="Missing Embeddings" value={stats.withoutEmbeddings} color="#ef4444" />
      </div>

      <section
        style={{
          padding: 20,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))"
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: 700 }}>All Notes</h2>
        {loading ? (
          <div style={{ padding: 24, textAlign: "center", opacity: 0.7 }}>Loading...</div>
        ) : notes.length === 0 ? (
          <div style={{ padding: 24, textAlign: "center", opacity: 0.7 }}>No notes found</div>
        ) : (
          <div style={{ display: "grid", gap: 12 }}>
            {notes.map((note) => {
              const hasEmbedding = note.has_embedding !== false;
              return (
                <div
                  key={note.id}
                  style={{
                    padding: 16,
                    borderRadius: 8,
                    border: "1px solid rgb(var(--border))",
                    background: hasEmbedding ? "rgb(var(--card))" : "#fef2f2",
                    display: "grid",
                    gap: 8
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
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
                        {hasEmbedding ? (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 4,
                              background: "#d1fae5",
                              color: "#065f46",
                              fontWeight: 600
                            }}
                          >
                            ✓ Has Embedding
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: 11,
                              padding: "4px 8px",
                              borderRadius: 4,
                              background: "#fee2e2",
                              color: "#991b1b",
                              fontWeight: 600
                            }}
                          >
                            ⚠ Missing Embedding
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, lineHeight: 1.6, marginBottom: 8 }}>{note.content}</div>
                      {note.tags && note.tags.length > 0 && (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
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
                    </div>
                    {!hasEmbedding && (
                      <button
                        onClick={() => void regenerateEmbedding(note.id)}
                        disabled={regenerating === note.id}
                        style={{
                          padding: "8px 16px",
                          borderRadius: 6,
                          border: "1px solid #dc2626",
                          background: "#fee2e2",
                          color: "#991b1b",
                          fontSize: 12,
                          fontWeight: 600,
                          cursor: regenerating === note.id ? "not-allowed" : "pointer",
                          opacity: regenerating === note.id ? 0.6 : 1
                        }}
                      >
                        {regenerating === note.id ? "Regenerating..." : "Regenerate"}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function StatCard({ title, value, color }: { title: string; value: number; color?: string }) {
  return (
    <div
      style={{
        padding: 20,
        borderRadius: "var(--radius)",
        background: "rgb(var(--card))",
        border: "1px solid rgb(var(--border))"
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color: color || "rgb(var(--accent))" }}>{value}</div>
    </div>
  );
}

