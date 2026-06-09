import type { MetadataRoute } from "next";
import { getPublicAppOrigin } from "@/lib/public-app-url";

/** Explicit allowlist for major AI / answer-engine crawlers (GEO / AEO pattern). */
const AI_CRAWLERS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "GoogleOther",
  "Applebot",
  "Applebot-Extended",
  "Bytespider",
  "CCBot",
  "cohere-ai",
  "Diffbot",
  "Meta-ExternalAgent",
  "Meta-ExternalFetcher",
  "FacebookBot",
  "DuckAssistBot",
  "Amazonbot",
  "MistralAI-User",
  "YouBot",
];

export default function robots(): MetadataRoute.Robots {
  const site = getPublicAppOrigin();
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/app/", "/admin/", "/coach/", "/host/"] },
      ...AI_CRAWLERS.map((userAgent) => ({
        userAgent,
        allow: "/",
        disallow: ["/api/", "/app/", "/admin/", "/coach/", "/host/"],
      })),
    ],
    sitemap: `${site}/sitemap.xml`,
    host: new URL(site).host,
  };
}
