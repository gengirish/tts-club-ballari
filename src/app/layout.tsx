import type { Metadata, Viewport } from "next";
import "./globals.css";

const APP_NAME = "Sister Stride";
const APP_DEFAULT_TITLE = "Steel Sisters & Striders — SSS Club Ballari";
const APP_TITLE_TEMPLATE = "%s — Sister Stride";
const APP_DESCRIPTION = "A women-first fitness community for Ballari — progress, challenges, programs, and events.";

export const metadata: Metadata = {
  applicationName: APP_NAME,
  metadataBase: new URL(
    process.env.AUTH_URL ??
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:3000")
  ),
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_DEFAULT_TITLE,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: "summary",
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#050408" },
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
  ],
  width: "device-width",
  initialScale: 1,
};

const themeInitScript = `
(() => {
  let theme = "dark";
  try {
    const key = "sss-theme";
    const stored = window.localStorage.getItem(key);
    const preferred = window.matchMedia("(prefers-color-scheme: light)").matches ? "light" : "dark";
    theme = stored === "light" || stored === "dark" ? stored : preferred;
  } catch {}
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(theme);
  root.dataset.theme = theme;
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
