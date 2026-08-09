/**
 * Central place for deployment-specific config in the frontend.
 *
 * IMPORTANT: NEXT_PUBLIC_* variables are baked into the client bundle
 * at BUILD time, not read at runtime. If you change NEXT_PUBLIC_API_URL
 * or NEXT_PUBLIC_BASE_PATH in .env (e.g. after moving to a different
 * Jetson IP, or switching between native deployment and a proxied
 * environment like CloudLab/Jupyter), you must rebuild the frontend
 * (`npm run build`) for the change to take effect - simply editing
 * .env.local and restarting `npm run start` is NOT enough.
 */

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Two supported ways to reach the backend:
 *
 * 1. Direct (NEXT_PUBLIC_API_URL set) - the browser calls the FastAPI
 *    backend's own host:port directly. Use this for native/production
 *    deployment (e.g. Jetson on the LAN) where that port is reachable
 *    from the browser. Example: NEXT_PUBLIC_API_URL=http://192.168.1.50:8000
 *
 * 2. Same-origin proxy (NEXT_PUBLIC_API_URL unset) - falls back to
 *    `${BASE_PATH}/api/backend`, which Next.js rewrites server-side to
 *    the backend (see next.config.ts). Use this whenever only ONE port
 *    is reachable from the browser - e.g. behind CloudLab's Jupyter
 *    proxy, where the backend's own port typically isn't exposed at all.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || `${BASE_PATH}/api/backend`;
