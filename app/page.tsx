import Link from "next/link";

export default function Page() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Demo</div>
          <h1 style={{ margin: "6px 0" }}>Chicago Client-Only Listing Portal</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            MLS-style search + realtor insight layer. Live data comes from Repliers.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link
            href="/listings"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              background: "rgb(var(--accent))",
              color: "rgb(var(--accentFg))",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Open Live Listings
          </Link>
          <Link
            href="/demo/listings"
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid rgb(var(--border))",
              background: "rgb(var(--card))",
              color: "rgb(var(--fg))",
              textDecoration: "none",
              fontWeight: 600
            }}
          >
            Open Demo
          </Link>
        </div>
      </header>

      <section style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Why this works" items={[
          "Login-only portal (VOW-style gating)",
          "Fast search: ingest MLS → your DB",
          "AI advisor uses MLS facts + realtor notes (RAG)",
          "Saved searches + alerts to drive velocity"
        ]} />
        <Card title="What you can click" items={[
          "Live listings search (Repliers)",
          "Listing detail + realtor notes",
          "Advisor Q&A (RAG)",
          "Admin notes (embeddings)"
        ]} />
      </section>

      <section
        style={{
          marginTop: 18,
          padding: 16,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))"
        }}
      >
        <h2 style={{ margin: "0 0 8px" }}>Next steps (to expand)</h2>
        <ol style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
          <li>Connect MLS feed (Chicago / MRED) under the realtor’s VOW agreement</li>
          <li>Stand up Supabase tables + RLS with Clerk org gating</li>
          <li>Ingestion worker for incremental updates + history</li>
          <li>Replace mock advisor with Vercel AI SDK + embeddings</li>
        </ol>
      </section>

      <footer style={{ marginTop: 18, opacity: 0.7, fontSize: 13 }}>
        Tip: Deploy this repo to Vercel as-is to show the flow. Then swap mock data → real ingestion.
      </footer>
    </main>
  );
}

function Card({ title, items }: { title: string; items: string[] }) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: "var(--radius)",
        background: "rgb(var(--card))",
        border: "1px solid rgb(var(--border))"
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
        {items.map((x) => (
          <li key={x} style={{ margin: "6px 0" }}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
