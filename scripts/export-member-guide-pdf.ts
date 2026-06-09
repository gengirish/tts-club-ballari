/**
 * Renders docs/member-guide-print.html to docs/Sister-Stride-Member-Guide.pdf (A4).
 * Requires: npx playwright install chromium (once).
 */
import path from "node:path";
import { pathToFileURL } from "node:url";
import { chromium } from "playwright";

async function main() {
  const cwd = process.cwd();
  const htmlPath = path.join(cwd, "docs", "member-guide-print.html");
  const outPath = path.join(cwd, "docs", "Sister-Stride-Member-Guide.pdf");
  const fileUrl = pathToFileURL(htmlPath).href;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(fileUrl, { waitUntil: "load" });
  await page.pdf({
    path: outPath,
    format: "A4",
    printBackground: true,
    margin: { top: "18mm", right: "16mm", bottom: "18mm", left: "16mm" },
  });
  await browser.close();
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
