/**
 * Renders docs/demo-doc-print.html to docs/Sister-Stride-Product-Demo.pdf (A4).
 * Embeds ./demo-screenshots/*.png when present (run `npm run docs:demo-screenshots` first).
 * Requires: npx playwright install chromium (once).
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

async function main() {
  const cwd = process.cwd();
  const htmlPath = path.join(cwd, "docs", "demo-doc-print.html");
  const outPath = path.join(cwd, "docs", "Sister-Stride-Product-Demo.pdf");
  const fileUrl = pathToFileURL(htmlPath).href;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: "load" });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "16mm", right: "14mm", bottom: "16mm", left: "14mm" },
  });
  await browser.close();
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
