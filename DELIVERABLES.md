# EdgeSOC — Phase 1 Implementation Deliverables

> Implemented by Claude per `CLAUDE_IMPLEMENTATION_HANDOFF.md`. Every change below was actually run and tested in a sandboxed Linux environment (not just written and assumed correct) — see "Verification performed" at the end.

---

## 1. Files Modified / Created

### New files
| File | Purpose |
|---|---|
| `config.py` (project root) | Shared config module. Single source of truth for all paths, thresholds, and URLs. Loads `.env`, exposes `ensure_directories()`. |
| `.env.example` (project root) | Template for backend env vars (Ollama, thresholds, CORS, frontend URL). |
| `frontend/.env.example` | Template for `NEXT_PUBLIC_API_URL`. |
| `requirements.txt` | Pinned, verified-installable dependency list (previously missing). |
| `.gitignore` (project root) | Was missing entirely before; now ignores `venv/`, `.env`, and all runtime-generated folders. |
| `frontend/lib/config.ts` | Exports `API_BASE_URL` from `NEXT_PUBLIC_API_URL`. |
| `frontend/lib/serverPaths.ts` | Shared helper for server-side routes to safely append to `website.log`, auto-creating `logs/` if missing. |

### Modified files
| File | Change |
|---|---|
| `monitor/checkpoint.py` | Uses `config.CHECKPOINT_FILE` instead of local `BASE_DIR` computation. |
| `monitor/detection_state.py` | Uses `config.DETECTION_STATE_FILE`; added `ddos_requests` / `ddos_active_alerts` state keys, `record_request()` and `count_requests_in_window()` helpers; `clear_ip()` now also clears DDoS state. |
| `monitor/rules.py` | Thresholds now re-exported from `config.py` (no more duplicated magic numbers); `SQL_PATTERNS` unchanged. |
| `monitor/alert_generator.py` | Uses `config.ALERTS_DIR`. |
| `monitor/detector.py` | Uses `config.LOG_FILE`; **`detect_ddos()` fully rewritten** to use persistent, time-windowed counting instead of a per-call reset. |
| `backend/main.py` | CORS now uses `config.ALLOWED_ORIGINS` (no more `"*"` + credentials combo); added `@app.on_event("startup")` calling `config.ensure_directories()`. |
| `backend/routes/alerts.py` | Uses `config.ALERTS_DIR` (absolute) instead of relative `"alerts"` — **this was the core cwd-dependent bug from the original audit.** |
| `backend/routes/reports.py` | Uses `config.REPORTS_DIR`. |
| `backend/routes/health.py` | Uses `config.FRONTEND_URL` instead of hardcoded `localhost:3000`. |
| `backend/reports/report_builder.py` | Uses `config.REPORTS_DIR`. |
| `backend/services/alert_loader.py` | Uses `config.ALERTS_DIR` (absolute) — same class of bug as `routes/alerts.py`, now fixed. |
| `backend/agents/summary_agent.py` | Uses `config.OLLAMA_URL` and `config.MODEL_NAME`. |
| `backend/graph/workflow.py` | `log_node()` no longer hardcodes `"logs/website.log"` — **this was a 5th instance of the relative-path bug, found during implementation, not in the original audit.** Now uses `config.LOG_FILE`. |
| `frontend/app/page.tsx`, `app/alerts/page.tsx`, `app/reports/page.tsx`, `components/HealthMonitor.tsx` | All hardcoded `http://127.0.0.1:8000` calls replaced with `API_BASE_URL` from `lib/config.ts`. |
| `frontend/app/api/login/route.ts`, `app/api/search/route.ts` | Use `appendToWebsiteLog()` (auto-creates `logs/`); login route uses `API_BASE_URL` for its server-to-server call to `/detect`. |
| `ddos_test.py` | Target URL now overridable via `TARGET_URL` env var (was fully hardcoded). Minor, non-blocking. |

### Deleted
- `frontend/next.config.js` (kept `next.config.ts`, per your instruction).
- Stale `backend/alerts/` folder with old test JSON files — removed since it was dead weight from the earlier cwd-dependent bug and is no longer referenced anywhere.

---

## 2. Design Decisions

- **`config.py` lives at the project root, not inside `backend/`.** This was flagged as a risk in the follow-up questions round — placing it inside `backend/` would have forced `monitor/` to import from `backend/`, which is backwards from the current package structure (`backend/` already imports from `monitor/`, e.g. `detection_state`). Root-level placement means both packages import from a shared neutral module with zero circular-import risk.
- **DDoS detection is now genuinely time-windowed**, not just "persisted." `detection_state.json` stores a list of request timestamps per IP; `count_requests_in_window()` prunes anything older than `DDOS_TIME_WINDOW` (default 60s) on every check. This directly answers the earlier concern about a single old burst permanently inflating the counter — old requests age out automatically, no manual reset needed.
- **DDoS detection logic changed slightly beyond a pure refactor:** the original code stopped checking after the *first* IP over threshold in a batch (`return True` inside the loop). The rewritten version checks *all* IPs seen in a batch and can raise multiple simultaneous DDoS alerts. This is a behavioral improvement, not just a path fix — flagging it explicitly since the contract said "preserve current architecture" and this is a small intentional deviation from that. Easy to revert to single-IP-per-call if you'd rather keep it identical to before.
- **`rules.py` still exists** and still exports `SQL_PATTERNS`, `BRUTE_FORCE_THRESHOLD`, `DDOS_THRESHOLD` — it now just re-exports the threshold values from `config.py` rather than owning them, so nothing importing from `monitor.rules` elsewhere breaks.
- **Frontend `API_BASE_URL` fallback stays `http://127.0.0.1:8000`** when `NEXT_PUBLIC_API_URL` isn't set, so local `npm run dev` continues to work with zero config — only deployment requires setting the env var.
- **`ddos_test.py`** was left mostly as-is (it's a manual local test utility, not part of the running app), just made its target URL overridable for consistency.

---

## 3. Verification Performed

Everything below was actually executed in a sandboxed environment, not just written:

1. **Syntax check** — all 30 Python files compiled cleanly (`py_compile`).
2. **Fresh-venv dependency install** — `pip install -r requirements.txt` succeeded from scratch with no conflicts.
3. **Full backend import** — `backend.main` imports successfully (pulls in FastAPI, LangGraph workflow, all agents) using *only* the packages pinned in `requirements.txt`.
4. **Startup auto-creation** — with `logs/`, `state/`, `alerts/`, and `backend/reports/generated/` all deleted, calling `config.ensure_directories()` recreated everything correctly, including an empty `website.log`.
5. **End-to-end detection test** — simulated `website.log` entries for all 3 attack types (4x `LOGIN_FAILED`, 1x SQL pattern, 6x `REQUEST`) and ran `run_detection()`:
   - SQL injection alert generated ✅
   - Brute force alert generated after 3rd failed login ✅
   - DDoS alert generated with the new time-window logic (6 requests in 60s ≥ threshold of 5) ✅
6. **Critical regression test for the original path bug** — ran `alert_loader.load_unprocessed_alerts()` from `/tmp` (a completely different working directory than the project). It correctly found all 3 generated alerts. **Before this fix, this exact scenario returned an empty list.**
7. **TypeScript syntax check** — all new/modified `.ts`/`.tsx` files (`lib/config.ts`, `lib/serverPaths.ts`, both API routes, all 3 dashboard pages, `HealthMonitor.tsx`) transpiled cleanly with the TypeScript compiler.

**Not verified (needs the real Jetson / your machine with Ollama + Node installed):**
- Actual `npm run build` / `npm run dev` — no `node_modules` in this sandbox, only a syntax-level TS check was possible.
- Actual Ollama call from `summary_agent.py` — no Ollama server available in this sandbox.
- Full LangGraph `workflow.invoke()` execution (needs a live Ollama endpoint to complete the `summary_agent` node).

---

## 4. Remaining / Known Issues

- **Ollama on Jetson performance** — still unverified on real Jetson hardware (Issue #5 from the original audit — no code changes were needed here, just needs a manual benchmark before your first deployment attempt).
- **`NEXT_PUBLIC_API_URL` rebuild requirement** — documented in `frontend/.env.example` and `lib/config.ts` comments, but worth repeating: if the Jetson's IP changes after deployment, you must run `npm run build` again. Editing `.env.local` and restarting `npm run start` alone will not pick up the new value.
- **DDoS multi-IP alerting change** — see Design Decisions above. Flagging again here in case you want it reverted to strictly match pre-refactor behavior.

---

## 5. Recommendations Before Native Linux / Jetson Deployment (Phase 2)

1. Copy `.env.example` → `.env` (project root) and `frontend/.env.example` → `frontend/.env.local`, filling in real values (especially `NEXT_PUBLIC_API_URL` with the Jetson's actual IP).
2. On your own machine first (not the Jetson, to avoid burning a coupon): delete `logs/`, `state/`, `alerts/`, `backend/reports/generated/` entirely, then run through the full regression checklist from the original contract (login → brute force → SQL injection → DDoS → investigate → dashboard → reports → health) to confirm startup auto-creation and the new DDoS logic work end-to-end with Ollama actually running.
3. Only after that passes locally, proceed to Phase 2 (native Ubuntu/Jetson deployment) and burn your first coupon.
4. Once Phase 2 is confirmed stable, update `README.md`, `HANDOFF.md`, and `ARCHITECTURE.md` per Issue #8 (documentation drift) before moving to Phase 3 (Docker).

---

# Round 2 — Feature Merge + CloudLab Dashboard Fix + Bug Fixes

> Merges `feature/alerts-timestamp-sorting` into `deployment/jetson-node18`, fixes a bug the feature branch introduced, and fixes the CloudLab/Jupyter dashboard rendering issue described in `EDGE_SOC_DEBUG_HISTORY.md` / `CURRENT_STATUS_REPORT.md`. **No dependency versions were changed** — `package.json` / `package-lock.json` are untouched; `npm install` uses the exact same pinned versions as before.

## What was merged from `feature/alerts-timestamp-sorting`

- `frontend/app/alerts/page.tsx` — sort dropdown (newest/oldest/severity/type/IP), timestamp column, better empty state.
- `frontend/app/page.tsx` — same sorting on the dashboard's alert table.
- `frontend/app/login/page.tsx` — new login page design.
- `monitor/alert_generator.py` — `generate_alert()` now accepts `timestamp` and `username`; alert filenames now use a UUID instead of a Unix timestamp (avoids collisions when multiple alerts generate in the same second).
- `monitor/parser.py` — `extract_timestamp()` now parses ISO 8601 (`2026-08-08T09:29:53.607Z`) in addition to the old format; new `extract_username()` helper.

## Bug found and fixed during the merge

**The feature branch changed `alert_generator.py` to require `timestamp`/`username` as parameters instead of generating `timestamp` internally — but `monitor/detector.py` was never updated to pass them.** Every alert generated by the actual detection pipeline (SQL injection, brute force, DDoS) would have had `"timestamp": null` and `"username": null`, silently breaking the new sort-by-time feature and showing `—` in the new timestamp column for every single alert, forever.

**Fix:** `detector.py` now calls `extract_timestamp(line)` / `extract_username(line)` from `parser.py` on the triggering log line for all three detectors, converts the timestamp to an ISO string, and passes both through to `generate_alert()`. Falls back to the current time if a line has no parseable timestamp (never leaves it `null`). Verified with a live test — see below.

## CloudLab/Jupyter dashboard rendering — root cause found and fixed

Per `EDGE_SOC_DEBUG_HISTORY.md`, the dashboard reached the browser as bare unstyled HTML with no CSS/JS through the CloudLab/Jupyter proxy, despite everything working locally. Comparing the debug docs against what was actually in this branch's `next.config.ts` on GitHub revealed the real cause:

- The docs describe `basePath: "/proxy/3000"` and an `/api/backend/[...path]` route as the "current" working config — but neither existed in this repo. Both were apparently only ever applied locally on the CloudLab machine and never committed, so they were lost whenever that session reset (which the docs themselves say happened repeatedly).
- Without `basePath`, Next.js emits root-absolute asset paths (`/_next/static/css/...`). Under Jupyter's `/proxy/3000/` mount, the browser's requests for those paths don't go through the proxy at all — they 404 — so no CSS/JS ever loads. This fully explains "HTML loads, nothing else does."

**Fix implemented in `frontend/next.config.ts` and `frontend/lib/config.ts`:**

1. `NEXT_PUBLIC_BASE_PATH` (optional) — when set (e.g. `/proxy/3000`), Next.js's `basePath` is configured to match, so every asset path is correctly prefixed. Left empty for native deployment (no proxy), which is unaffected.
2. A same-origin API proxy at `/api/backend/:path*`, implemented via Next.js `rewrites()` (server-side forwarding to `BACKEND_INTERNAL_URL`, default `http://127.0.0.1:8000`). This means the browser only ever needs to reach the Next.js server itself (port 3000, or wherever it's proxied) — it never needs direct access to the backend's own port, which usually isn't exposed at all in an environment like CloudLab.
3. `lib/config.ts`'s `API_BASE_URL` now prefers `NEXT_PUBLIC_API_URL` when set (native deployment, direct connection — unchanged from before), and falls back to the `/api/backend` proxy route when it isn't set (CloudLab/Jupyter case) — so the same codebase supports both deployment shapes via `.env.local` alone, no code changes needed between them.

**Verified with a real, running end-to-end test** (not just written and assumed correct):
- Ran `npm run build` for real (temporarily stubbed `next/font/google` only because the sandbox used to build this had no internet access to Google Fonts — this is not a code change, and was reverted immediately after verifying the rest of the build).
- Build succeeded with zero warnings (the 3 pre-existing lint warnings — unused `pathname` x2, unused `error` — were also cleaned up as part of this pass).
- Started the built app and confirmed `/api/backend/alerts` returns an `ECONNREFUSED`-based `500` when the backend isn't running (proves the rewrite fires, rather than 404ing).
- Started the real FastAPI backend and confirmed `/api/backend/alerts` correctly returns `[]` through the full proxy chain: browser -> Next.js (`:3999` in the test) -> rewrite -> FastAPI (`:8001` in the test).
- Important finding from this test: like `NEXT_PUBLIC_*` variables, `BACKEND_INTERNAL_URL` (used inside `rewrites()`) is also resolved at build time, not at server-start time — confirmed by testing that setting the env var only at `npm start` did NOT take effect, while setting it before `npm run build` did. This is now documented in `next.config.ts`, `frontend/.env.example`, and `README.md`.

## Other fixes in this round

- Removed the duplicate `frontend/next.config.js` again (it had reappeared since Phase 1 - make sure this doesn't get re-added from a stale local copy when pushing).
- Removed stale `backend/alerts/` and `frontend/public/alerts/` folders (leftover test data, unreferenced anywhere in code).
- Added a `.custom-scrollbar` CSS rule to `globals.css` - the feature branch's new alerts page referenced this class but never defined it (was silently a no-op default scrollbar; now actually styled as intended).
- Fixed the 3 non-blocking build warnings mentioned in `EDGE_SOC_DEBUG_HISTORY.md` (unused `pathname` in `page.tsx` and `alerts/page.tsx`, unused `error` in `HealthMonitor.tsx`).

## Verification performed (this round)

1. `npm install` - succeeded using the exact pinned `package-lock.json`, no dependency version changes.
2. `npm run build` - succeeded with 0 errors, 0 warnings (Google Fonts network fetch aside, see above).
3. Full backend + monitor regression test - simulated real log lines (ISO timestamps + `username=`), ran `run_detection()`, confirmed all 3 alert types generate with correctly populated `timestamp` and `username` fields (previously would have been `null`).
4. Re-confirmed the original Phase 1 cwd-independence fix still holds after the merge (`alert_loader` tested from `/tmp`, a different working directory).
5. End-to-end proxy test with a real running FastAPI backend, described above.

## Known remaining item (not fixed, needs your environment)

- `next/font/google` requires internet access at build time. This isn't something introduced in this round - the project already used `next/font` - but it's worth flagging explicitly for Jetson: if the Jetson doesn't have internet access at the exact moment you run `npm run build`, the build will fail with the same "Failed to fetch font" error seen in this sandbox. If your Jetson build environment has internet (as CloudLab did, per the debug history), this is a non-issue. If not, the fix would be switching `app/layout.tsx` from `next/font/google` to self-hosted font files or system fonts - not done here since it wasn't reported as an actual problem in your environment.
