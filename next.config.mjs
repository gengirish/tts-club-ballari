import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import withSerwistInit from "@serwist/next";

const isVercel = !!process.env.VERCEL;
const useStandalone = !isVercel && process.env.NEXT_STANDALONE_OUTPUT === "1";

function getRevision() {
  const result = spawnSync("git", ["rev-parse", "HEAD"], { encoding: "utf-8" });
  const stdout = result.stdout?.trim();
  return stdout ? stdout.slice(0, 12) : randomUUID();
}

const revision = getRevision();

const withSerwist = withSerwistInit({
  swSrc: "src/app/sw.ts",
  swDest: "public/sw.js",
  disable: process.env.NODE_ENV === "development",
  cacheOnNavigation: true,
  reloadOnOnline: true,
  additionalPrecacheEntries: [{ url: "/~offline", revision }],
});

/** @type {import("next").NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  ...(useStandalone && {
    output: "standalone",
  }),
  async rewrites() {
    const base = process.env.PROXY_API_TO?.replace(/\/$/, "");
    if (!base) return [];
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${base}/api/:path*` }],
    };
  },
};

export default withSerwist(nextConfig);
