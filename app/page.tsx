import Link from "next/link";

export default function Page() {
  return (
    <main style={{ maxWidth: 980, margin: "0 auto", padding: 24 }}>
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div style={{ fontSize: 14, opacity: 0.7 }}>Client Portal</div>
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
            href="/mobile-chat"
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
            Mobile Chat
          </Link>
        </div>
      </header>

      <section style={{ marginTop: 22, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Why this works" items={[
          "Login-only portal (VOW-style gating)",
          "Fast search: direct Repliers integration",
          "AI advisor uses MLS facts + realtor notes (RAG)",
          "Mobile-first chat for on-the-go insights"
        ]} />
        <Card title="What you can click" items={[
          "Live listings search (Repliers)",
          "Listing detail + realtor notes",
          "AI Mobile Chat (embeddings)",
          "Admin dashboard (realtor only)"
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
        <h2 style={{ margin: "0 0 8px" }}>The Mobile-First Approach</h2>
        <p style={{ opacity: 0.9, lineHeight: 1.6 }}>
          Browse listings on your desktop via Zillow or our portal, then use the <strong>Mobile Chat</strong> to get the "scoop" from Matt Becker. 
          The chat is trained on Matt&apos;s personal notes, building-level expertise, and neighborhood tribal knowledge.
        </p>
      </section>

      <footer style={{ marginTop: 18, opacity: 0.7, fontSize: 13 }}>
        Tip: Admins can manage notes and invitations in the <Link href="/admin">Admin Panel</Link>.
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

