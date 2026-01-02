import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Chicago Client Portal (Demo)",
  description: "Login-only MLS-style portal with realtor insight layer (demo)."
};

const base: React.CSSProperties = {
  fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial",
  margin: 0,
  background: "#fafafa",
  color: "#111"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={base}>{children}</body>
    </html>
  );
}
