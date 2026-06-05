"use client";

import { useEffect, useState } from "react";

type Theme = "dark" | "light";

const STORAGE_KEY = "sss-theme";
const THEME_COLORS: Record<Theme, string> = {
  dark: "#050408",
  light: "#f8fafc",
};

function syncThemeColor(theme: Theme) {
  const head = document.head;
  if (!head) return;

  let themeColorMeta = document.querySelector('meta[name="theme-color"]');
  if (!(themeColorMeta instanceof HTMLMetaElement)) {
    themeColorMeta = document.createElement("meta");
    themeColorMeta.setAttribute("name", "theme-color");
    head.appendChild(themeColorMeta);
  }

  themeColorMeta.setAttribute("content", THEME_COLORS[theme]);
}

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.remove("dark", "light");
  root.classList.add(theme);
  root.dataset.theme = theme;
  syncThemeColor(theme);
  try {
    window.localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore storage write errors (private browsing / blocked storage).
  }
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2.5M12 19.5V22M4.9 4.9l1.8 1.8M17.3 17.3l1.8 1.8M2 12h2.5M19.5 12H22M4.9 19.1l1.8-1.8M17.3 6.7l1.8-1.8" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4 shrink-0"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 14.2a8.6 8.6 0 1 1-11.2-11 7.7 7.7 0 1 0 11.2 11Z" />
    </svg>
  );
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const current = document.documentElement.classList.contains("light") ? "light" : "dark";
    syncThemeColor(current);
    setTheme(current);
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const toggleTheme = () => {
    const nextTheme: Theme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    applyTheme(nextTheme);
  };
  const nextTheme: Theme = theme === "dark" ? "light" : "dark";
  const nextThemeLabel = nextTheme === "dark" ? "Dark" : "Light";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={`Switch to ${nextTheme.toLowerCase()} mode`}
      aria-pressed={theme === "dark"}
      className="inline-flex shrink-0 items-center gap-2 rounded-full border border-steel/25 bg-paper-muted px-4 py-2 text-xs font-extrabold uppercase tracking-wide text-ink transition hover:border-violet/50 hover:text-violet focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet focus-visible:ring-offset-2 focus-visible:ring-offset-paper"
    >
      {nextTheme === "light" ? <SunIcon /> : <MoonIcon />}
      <span>{nextThemeLabel}</span>
    </button>
  );
}
