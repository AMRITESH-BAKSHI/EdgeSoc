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
