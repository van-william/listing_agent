"use client";

import Link from "next/link";
import { useState } from "react";

type Message = { from: "user" | "assistant"; text: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [listingId, setListingId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sendMessage() {
    if (!input.trim() || loading) return;
    const next = { from: "user", text: input.trim() } as Message;
    setMessages((prev) => [...prev, next]);
    setInput("");
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: next.text, listingId: listingId || null })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Chat failed");
      setMessages((prev) => [...prev, { from: "assistant", text: data.reply }]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Chat failed";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main style={{ maxWidth: 900, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontSize: 12, opacity: 0.7 }}>Advisor (RAG)</div>
          <h1 style={{ margin: "6px 0" }}>Realtor Chat</h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" style={btn("ghost")}>Home</Link>
          <Link href="/listings" style={btn("solid")}>Listings</Link>
          <Link href="/admin/notes" style={btn("ghost")}>Notes</Link>
        </div>
      </header>

      <section
        style={{
          marginTop: 14,
          padding: 14,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
          display: "grid",
          gap: 10
        }}
      >
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Listing ID (optional)"
            value={listingId}
            onChange={(e) => setListingId(e.target.value)}
            style={{ ...inputStyle, maxWidth: 220 }}
          />
          <div style={{ fontSize: 12, opacity: 0.7 }}>Used to fetch MLS facts for that listing.</div>
        </div>

        <div
          style={{
            minHeight: 260,
            borderRadius: 12,
            border: "1px solid rgb(var(--border))",
            padding: 12,
            background: "rgb(var(--muted))",
            display: "grid",
            gap: 10
          }}
        >
          {messages.length === 0 ? (
            <div style={{ opacity: 0.7 }}>
              Ask something like: &quot;Quiet 2 bed near Brown Line under $650k&quot;.
            </div>
          ) : null}
          {messages.map((msg, index) => (
            <div key={index} style={{ textAlign: msg.from === "user" ? "right" : "left" }}>
              <strong>{msg.from === "user" ? "You" : "Advisor"}:</strong> {msg.text}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8 }}>
          <input
            placeholder="Ask a question"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ ...inputStyle, flex: 1 }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void sendMessage();
            }}
          />
          <button
            onClick={() => void sendMessage()}
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
            {loading ? "Sending..." : "Send"}
          </button>
        </div>
        {error ? <div style={{ color: "#b91c1c" }}>{error}</div> : null}
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
