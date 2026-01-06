"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RealtorNoteSummary } from "@/lib/types";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    total: 0,
    listing: 0,
    building: 0,
    neighborhood: 0,
    global: 0
  });
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await fetch("/api/notes?limit=1000");
        const data = await res.json();
        if (res.ok && Array.isArray(data.notes)) {
          const notes = data.notes as RealtorNoteSummary[];
          setStats({
            total: notes.length,
            listing: notes.filter((n) => n.scope === "listing").length,
            building: notes.filter((n) => n.scope === "building").length,
            neighborhood: notes.filter((n) => n.scope === "neighborhood").length,
            global: notes.filter((n) => n.scope === "global").length
          });
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    }
    void loadStats();
  }, []);

  return (
    <main style={{ maxWidth: 1200, margin: "0 auto", padding: 20 }}>
      <header style={{ marginBottom: 32 }}>
        <div style={{ fontSize: 12, opacity: 0.7, marginBottom: 8 }}>Admin Dashboard</div>
        <h1 style={{ margin: 0, fontSize: 32, fontWeight: 700 }}>Realtor Knowledge Base</h1>
        <p style={{ marginTop: 8, opacity: 0.7 }}>
          Manage your notes, insights, and knowledge for listings, buildings, and neighborhoods
        </p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16, marginBottom: 32 }}>
        <StatCard
          title="All Notes"
          value={loading ? "..." : stats.total}
          href="/admin/notes"
          color="rgb(var(--accent))"
        />
        <StatCard
          title="Listing Notes"
          value={loading ? "..." : stats.listing}
          href="/admin/notes/listing"
          color="#3b82f6"
        />
        <StatCard
          title="Building Notes"
          value={loading ? "..." : stats.building}
          href="/admin/notes/building"
          color="#10b981"
        />
        <StatCard
          title="Neighborhood Notes"
          value={loading ? "..." : stats.neighborhood}
          href="/admin/notes/neighborhood"
          color="#f59e0b"
        />
        <StatCard
          title="Global Notes"
          value={loading ? "..." : stats.global}
          href="/admin/notes/global"
          color="#8b5cf6"
        />
      </div>

      <section
        style={{
          padding: 24,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))",
          marginBottom: 24
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: 16, fontSize: 20, fontWeight: 700 }}>Invite Client</h2>
        <div style={{ display: "flex", gap: 8 }}>
          <input
            type="email"
            placeholder="client@email.com"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            style={inputStyle}
          />
          <button
            onClick={async () => {
              if (!inviteEmail) return;
              const res = await fetch("/api/admin/invite", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: inviteEmail })
              });
              if (res.ok) {
                alert("Invitation sent!");
                setInviteEmail("");
              } else {
                const data = await res.json();
                alert("Error: " + data.error);
              }
            }}
            style={btn("solid")}
          >
            Send Invite
          </button>
        </div>
        <p style={{ marginTop: 12, fontSize: 13, opacity: 0.7 }}>
          Clients will receive an email to join your organization and access listings.
        </p>
      </section>

      <section
        style={{
          padding: 24,
          borderRadius: "var(--radius)",
          background: "rgb(var(--card))",
          border: "1px solid rgb(var(--border))"
        }}
      >
        <div style={{ display: "grid", gap: 12 }}>
          <Link href="/admin/notes" style={actionLink}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>View All Notes</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Browse and manage all your notes</div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </Link>
          <Link href="/admin/notes/listing" style={actionLink}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Add Listing Note</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Add insights for a specific MLS listing</div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </Link>
          <Link href="/admin/notes/neighborhood" style={actionLink}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Add Neighborhood Note</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Share knowledge about a neighborhood</div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </Link>
          <Link href="/admin/notes/building" style={actionLink}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Add Building Note</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Add notes about a specific building</div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </Link>
          <Link href="/admin/embeddings" style={actionLink}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 4 }}>Manage Embeddings</div>
              <div style={{ fontSize: 13, opacity: 0.7 }}>Verify and regenerate embeddings for semantic search</div>
            </div>
            <span style={{ fontSize: 20 }}>→</span>
          </Link>
        </div>
      </section>

      <div style={{ marginTop: 24, display: "flex", gap: 12 }}>
        <Link href="/listings" style={btn("ghost")}>View Listings</Link>
        <Link href="/chat" style={btn("ghost")}>Chat Advisor</Link>
      </div>
    </main>
  );
}

function StatCard({
  title,
  value,
  href,
  color
}: {
  title: string;
  value: string | number;
  href: string;
  color: string;
}) {
  return (
    <Link
      href={href}
      style={{
        padding: 20,
        borderRadius: "var(--radius)",
        background: "rgb(var(--card))",
        border: "1px solid rgb(var(--border))",
        textDecoration: "none",
        color: "inherit",
        display: "block",
        transition: "transform 0.2s, box-shadow 0.2s",
        cursor: "pointer"
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-2px)";
        e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ fontSize: 13, opacity: 0.7, marginBottom: 8 }}>{title}</div>
      <div style={{ fontSize: 32, fontWeight: 700, color }}>{value}</div>
    </Link>
  );
}

const actionLink: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: 16,
  borderRadius: 8,
  border: "1px solid rgb(var(--border))",
  textDecoration: "none",
  color: "inherit",
  transition: "background 0.2s"
};

const inputStyle: React.CSSProperties = {
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid rgb(var(--border))",
  background: "rgb(var(--card))",
  fontSize: 14,
  flex: 1
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

