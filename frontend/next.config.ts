import type { NextConfig } from "next";

/**
 * NEXT_PUBLIC_BASE_PATH - only set this when the app is served behind a
 * sub-path reverse proxy (e.g. CloudLab's JupyterLab jupyter_server_proxy,
 * which serves this app under something like /proxy/3000/). Leave unset
 * (default "") for normal / native deployment - e.g. running directly on
 * the Jetson with the browser hitting the device's IP on port 3000
 * directly. Setting this incorrectly is what previously caused the
 * dashboard to load as unstyled raw HTML: without a matching basePath,
 * every /_next/static/* asset request resolves OUTSIDE the proxy's
 * mount path and 404s in the browser, even though curl/local requests
 * to the Next.js server directly succeed.
 *
 * IMPORTANT: like NEXT_PUBLIC_API_URL, this is baked in at BUILD time.
 * Changing it requires `npm run build` again, not just a restart.
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  ...(basePath ? { basePath } : {}),

  async rewrites() {
    return [
      {
        // Same-origin API proxy: the browser only ever needs to reach
        // THIS Next.js server (port 3000, or wherever it's proxied to -
        // e.g. CloudLab/Jupyter's /proxy/3000/). It never needs direct
        // network access to the FastAPI backend's own port, which may
        // not be exposed at all in a proxied dev environment like
        // CloudLab. The backend is reached server-side instead, via
        // BACKEND_INTERNAL_URL (defaults to same-host localhost:8000).
        //
        // Note: Next.js resolves rewrite `source` paths AFTER stripping
        // basePath, so this single rule correctly matches both
        // /api/backend/* (no basePath) and /proxy/3000/api/backend/*
        // (when NEXT_PUBLIC_BASE_PATH=/proxy/3000 is set).
        source: "/api/backend/:path*",
        destination: `${process.env.BACKEND_INTERNAL_URL || "http://127.0.0.1:8000"}/:path*`,
      },
    ];
  },
};

export default nextConfig;
