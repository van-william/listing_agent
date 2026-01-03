"use client";

import { useEffect, useState } from "react";

const THEMES = ["minimal", "modern", "lux"] as const;
type Theme = (typeof THEMES)[number];

const THEME_STORAGE_KEY = "demo_theme";

function getNextTheme(current: Theme): Theme {
  const idx = THEMES.indexOf(current);
  return THEMES[(idx + 1) % THEMES.length];
}

export default function ThemeCycler() {
  const [theme, setTheme] = useState<Theme>("modern");

  useEffect(() => {
    const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    const initial = saved && THEMES.includes(saved) ? saved : "modern";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  const cycle = () => {
    const next = getNextTheme(theme);
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem(THEME_STORAGE_KEY, next);
  };

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label="Cycle demo theme"
      title="Cycle theme: minimal -> modern -> lux"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        borderRadius: "var(--radius)",
        border: "1px solid rgb(var(--border))",
        background: "rgb(var(--card))",
        color: "rgb(var(--fg))",
        padding: "10px 12px",
        fontSize: 12,
        fontWeight: 700,
        boxShadow: "var(--shadow)"
      }}
    >
      <span
        aria-hidden
        style={{
          width: 10,
          height: 10,
          borderRadius: 999,
          background: "rgb(var(--accent))",
          display: "inline-block"
        }}
      />
      Theme: <span style={{ textTransform: "capitalize" }}>{theme}</span>
    </button>
  );
}
