import type { MetadataRoute } from "next";
import { getPublicAppOrigin } from "@/lib/public-app-url";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = getPublicAppOrigin();
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/login`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/login/forgot-password`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
    { url: `${base}/login/verify-request`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${base}/walking-to-5k`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${base}/walking-to-5k/register`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
  ];
}
