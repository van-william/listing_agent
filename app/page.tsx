import Link from "next/link";

export default function Page() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Demo</div>
          <h1 style={{ margin: "6px 0" }}>Chicago Client-Only Listing Portal</h1>
          <p style={{ margin: 0, opacity: 0.8 }}>
            MLS-style search + realtor insight layer. This demo uses mock listings.
          </p>
        </div>
        <Link
          href="/demo/listings"
          style={{
            padding: "10px 14px",
            borderRadius: 10,
            background: "#111",
            color: "white",
            textDecoration: "none",
            fontWeight: 600
          }}
        >
          Open Demo
        </Link>
      </header>

      <section style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Why this works" items={[
          "Login-only portal (VOW-style gating)",
          "Fast search: ingest MLS → your DB",
          "AI advisor uses MLS facts + realtor notes (RAG)",
          "Saved searches + alerts to drive velocity"
        ]} />
        <Card title="What you can click" items={[
          "Ranked listings + filters",
          "Listing detail page",
          "Advisor Q&A (mock API)",
          "Favorites + audit events (stubbed)"
        ]} />
      </section>

      <section style={{ marginTop: 18, padding: 16, borderRadius: 14, background: "white", border: "1px solid #eaeaea" }}>
        <h2 style={{ margin: "0 0 8px" }}>Next steps (to make it real)</h2>
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
    <div style={{ padding: 16, borderRadius: 14, background: "white", border: "1px solid #eaeaea" }}>
      <div style={{ fontWeight: 700, marginBottom: 8 }}>{title}</div>
      <ul style={{ margin: 0, paddingLeft: 18, opacity: 0.9 }}>
        {items.map((x) => (
          <li key={x} style={{ margin: "6px 0" }}>{x}</li>
        ))}
      </ul>
    </div>
  );
}
