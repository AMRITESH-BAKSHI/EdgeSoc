import fs from "fs";
import path from "path";

/**
 * Server-side (Next.js API routes) helper for the shared website.log file.
 *
 * Assumes the Next.js server's cwd is the `frontend/` directory (true for
 * both `npm run dev` and `npm run start` run from `frontend/`), so the log
 * file lives one level up at the project root, matching config.py's
 * LOG_FILE on the Python side.
 *
 * Creates the `logs/` directory automatically if it doesn't exist yet -
 * fs.appendFileSync does NOT create missing parent directories on its
 * own, which was previously causing an ENOENT crash on a fresh clone.
 */
export function getWebsiteLogPath(): string {
  const logDir = path.join(process.cwd(), "..", "logs");
  fs.mkdirSync(logDir, { recursive: true });
  return path.join(logDir, "website.log");
}

export function appendToWebsiteLog(entry: string): void {
  fs.appendFileSync(getWebsiteLogPath(), entry);
}
