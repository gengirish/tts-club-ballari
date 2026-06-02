/** @type {import('next').NextConfig} */
const isVercel = !!process.env.VERCEL;
// Standalone output is flaky on some Windows builds (trace copy ENOENT). Enable only when
// explicitly requested (Fly Dockerfile sets NEXT_STANDALONE_OUTPUT=1 for Linux builder).
const useStandalone = !isVercel && process.env.NEXT_STANDALONE_OUTPUT === "1";

const nextConfig = {
  reactStrictMode: true,
  experimental: { serverActions: { bodySizeLimit: "2mb" } },
  // Fly/Docker: standalone bundle. Vercel uses its own builder (omit standalone).
  ...(useStandalone && {
    output: "standalone",
  }),
  // Vercel UI only: forward /api to Fly (set PROXY_API_TO in Vercel env). Omit locally & on Fly.
  async rewrites() {
    const base = process.env.PROXY_API_TO?.replace(/\/$/, "");
    if (!base) return [];
    return {
      beforeFiles: [{ source: "/api/:path*", destination: `${base}/api/:path*` }],
    };
  },
};

export default nextConfig;
