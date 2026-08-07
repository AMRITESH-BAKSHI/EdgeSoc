/**
 * Central place for deployment-specific config in the frontend.
 *
 * IMPORTANT: NEXT_PUBLIC_* variables are baked into the client bundle
 * at BUILD time, not read at runtime. If you change NEXT_PUBLIC_API_URL
 * in .env (e.g. after moving to a different Jetson IP), you must
 * rebuild the frontend (`npm run build`) for the change to take effect
 * - simply editing .env and restarting `next start` is NOT enough.
 */
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
