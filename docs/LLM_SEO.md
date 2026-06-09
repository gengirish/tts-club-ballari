# LLM / AI search discoverability (GEO / AEO)

This project follows the same **public-surface pattern as [CiteForge](https://github.com/gengirish/citeforge)** (see CiteForge `README.md`, `src/middleware.ts` public paths, `JsonLd`, and `structured-data`): machine-readable routes, explicit crawler policy, and schema.org JSON-LD so answer engines can retrieve and cite facts consistently.

## What is implemented

| Asset | Path | Purpose |
|-------|------|---------|
| **llms.txt** | `/llms.txt` | Curated markdown index (llmstxt.org style); links to core pages and `llms-full.txt`. |
| **llms-full.txt** | `/llms-full.txt` | Longer factual summary for RAG-style ingestion. |
| **robots.txt** | `/robots.txt` | `User-agent: *` plus explicit **allow** rules for major AI crawlers (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot, Google-Extended, …); **disallow** `/api/`, `/app/`, `/admin/`, `/coach/`, `/host/`. |
| **sitemap.xml** | `/sitemap.xml` | Public URLs only (home, login flows, Walking to 5K). |
| **JSON-LD** | In root layout | `Organization`, `WebSite`, `SportsActivityLocation`, `FAQPage` — built from `getPublicAppOrigin()` / `AUTH_URL`. |
| **Metadata** | Root layout | `keywords`, `robots: { index, follow }`, existing Open Graph / Twitter. |
| **`<link rel="alternate" type="text/markdown">`** | Root `<head>` | Points crawlers at `/llms.txt`. |

## Canonical URL

Structured data and sitemap URLs use **`getPublicAppOrigin()`** (`src/lib/public-app-url.ts`): **`AUTH_URL`** when set, else `https://${VERCEL_URL}`, else localhost.

For production citations to stay correct, set **`AUTH_URL`** to your real public origin (see [DEPLOYED_URLS.md](./DEPLOYED_URLS.md)), e.g. `https://sister-stride.intelliforge.tech`.

## Verification (after deploy)

- `curl -sI -A "GPTBot" "https://<host>/"` — should be **200** on public pages.
- Open `/<host>/llms.txt`, `/robots.txt`, `/sitemap.xml` in a browser.
- [Rich Results Test](https://search.google.com/test/rich-results) and [Schema validator](https://validator.schema.org/) on the home page.

## Further reading

- Cursor skill: **llm-seo** (GEO / AEO checklist).
- CiteForge reference: public routes, `JsonLd`, `src/lib/structured-data.ts`, `e2e/public-routes.spec.ts`.
