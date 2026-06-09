import { NextResponse } from "next/server";
import { getPublicAppOrigin } from "@/lib/public-app-url";

export const runtime = "edge";

function body(): string {
  const o = getPublicAppOrigin();
  return `# Sister Stride (Steel Sisters & Striders — SSS Club Ballari)

> Women-first fitness community in Ballari, Karnataka, India — programs, Couch to 5K, challenges, coaches, events, and community wellness.

Sister Stride is the product name for **Steel Sisters & Striders (SSS Club Ballari)**. The web app helps members log progress, join challenges, enrol in Couch to 5K / Walking to 5K, book coaches, register for events, and participate in community posts. Primary audience: women in and around Ballari seeking structured fitness support.

## Core pages

- [Home](${o}/): Public landing — Sister Stride brand, sign-in, Walking to 5K registration link.
- [Sign in](${o}/login): Password, email magic link, and member registration (Join).
- [Walking to 5K registration](${o}/walking-to-5k/register): Multi-step intake for the flagship walking programme tied to Couch to 5K.
- [Walking to 5K overview](${o}/walking-to-5k): Redirects guests to registration; authenticated members use in-app programme pages.

## Machine-readable context

- [Full site context for LLMs (llms-full.txt)](${o}/llms-full.txt): Longer factual summary for retrieval and citation.
- [Sitemap](${o}/sitemap.xml): Public URLs index.
- [Robots](${o}/robots.txt): Crawl rules including explicit AI crawler allowances for public content.

## Optional

- Canonical production deployment is typically **https://sister-stride.intelliforge.tech** — set \`AUTH_URL\` to the same origin users see in the browser for correct Auth.js cookies and redirects.
`;
}

export function GET() {
  return new NextResponse(body(), {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
