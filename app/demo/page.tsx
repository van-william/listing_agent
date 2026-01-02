"use client";

import Link from "next/link";
import { useState } from "react";

export default function AdvisorDemo() {
  const [input, setInput] = useState("Find me a 2 bed under $650k near the Brown Line, quiet.");
  const [out, setOut] = useState<string>("");

  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 20 }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
        <div>
          <Link href="/demo/listings" style={{ textDecoration: "none" }}>← Back to listings</Link>
          <h1 style={{ margin: "8px 0 0" }}>Advisor Demo</h1>
          <div style={{ opacity: 0.75 }}>Tool-calling + RAG goes here in the real build.</div>
        </div>
      </header>

      <section style={{ marginTop: 14, background: "white", border: "1px solid #eaeaea", borderRadius: 14, padding: 14 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #eaeaea" }}
          />
          <button
            onClick={async () => {
              setOut("Thinking…");
              const res = await fetch("/api/advisor", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: input })
              });
              const data = await res.json();
              setOut(data.answer);
            }}
            style={{ padding: "10px 12px", borderRadius: 10, background: "#111", color: "white", border: "none", fontWeight: 800 }}
          >
            Ask
          </button>
        </div>

        <pre style={{ marginTop: 10, padding: 12, borderRadius: 12, background: "#fafafa", border: "1px solid #eee", whiteSpace: "pre-wrap", fontSize: 13, lineHeight: 1.5 }}>
          {out || "(response will appear here)"}
        </pre>

        <div style={{ marginTop: 10, fontSize: 13, opacity: 0.8 }}>
          In the real version, the advisor will:
          <ul>
            <li>Call <b>searchListings()</b> against your DB</li>
            <li>Retrieve relevant realtor notes via pgvector</li>
            <li>Answer with clear sections: “MLS facts” vs “Agent insight”</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
