# AuctionTracker — Cleanup & Stability Audit
_Generated: 2026-02-23_

---

## PART 1 — FILES TO REMOVE

### 🔴 HIGH CONFIDENCE — Safe to Delete (zero risk)

These files are **confirmed unused** (0 imports anywhere) or are duplicates/test files.

| File | Location | Size | Reason |
|------|----------|------|--------|
| `CustomThemePanel 2.tsx` | `frontend/src/components/control/` | 13.4 KB | Duplicate of `CustomThemePanel.tsx`. Not imported anywhere. Likely an old backup. |
| `package-lock 2.json` | `frontend/` | 72.6 KB | Duplicate lockfile with a space in the name. Only `package-lock.json` should exist. |
| `test2.png` | `frontend/public/Background/` | 2.0 MB | Untracked test asset. Filename makes intent clear. Wasting ~2MB in the bundle. |

**Total savings: ~2.1 MB, 3 files**

---

### 🟡 MEDIUM CONFIDENCE — Review Before Deleting (no current risk, but could be WIP)

These are **React components with zero imports** anywhere in the codebase. They do not affect the running app. However, some may have been intentional stubs for future features. Read them briefly before deleting to confirm they have no value.

| File | Location | Notes |
|------|----------|-------|
| `GoalCelebration.tsx` | `frontend/src/components/display/` | Celebration animation. Confetti is already implemented inline in `Display.tsx`. Likely superseded. |
| `MoneyGrowthBar.tsx` | `frontend/src/components/display/` | Progress bar animation. The thermometer/progress logic is implemented directly in `Display.tsx`. Likely superseded. |
| `LastBidAnimation.tsx` | `frontend/src/components/display/` | Bid arrival animation. `PaddleNumberDisplay.tsx` handles this now. Likely superseded. |
| `CurrentLevelDisplay.tsx` | `frontend/src/components/display/` | Meant to show donation level on the display page. Not integrated. Could be dormant feature. |
| `PaddleAnimationPanel.tsx` | `frontend/src/components/control/` | A control panel for paddle animation settings. Not wired up to `Control.tsx`. May have been planned but not completed. |

**Impact if deleted:** None to the running app. These are dead code.

---

### 🟢 DOCUMENTATION & DEV FILES — Low Risk, Judgment Call

These files don't affect the running app but may have reference value.

| File | Location | Keep? |
|------|----------|-------|
| `REALTIME_TEST_GUIDE.md` | root | Keep if you reference it during testing; otherwise delete |
| `SETUP.md` | root | Keep if you onboard others; otherwise delete |
| `start.txt` | root | Appears to be a scratchpad for startup commands. Safe to delete. |
| `notes.txt` | root | Personal to-do list. Safe to delete once tasks are done. |

---

## PART 2 — FILES THAT MUST STAY

Every file below is actively used. Deleting any of them will break the app.

### Backend (all used)
```
backend/src/index.ts               ← Server entry point
backend/src/websocket.ts           ← Real-time socket server
backend/src/database/db.ts         ← SQLite init + schema
backend/src/database/queries.ts    ← All SQL queries
backend/src/middleware/upload.ts   ← File upload config (multer)
backend/src/models/Bid.ts          ← TypeScript interfaces
backend/src/models/Settings.ts     ← TypeScript interfaces (26 fields)
backend/src/routes/bids.ts         ← Bid CRUD endpoints
backend/src/routes/settings.ts     ← Settings endpoints
backend/src/routes/upload.ts       ← Image upload endpoints
backend/src/routes/export.ts       ← CSV export endpoint
backend/src/routes/admin.ts        ← Health check + reset
backend/src/services/BidService.ts
backend/src/services/SettingsService.ts
backend/src/services/ExportService.ts
```

### Frontend (all used)
```
frontend/src/main.tsx
frontend/src/App.tsx
frontend/src/pages/Display.tsx
frontend/src/pages/Control.tsx
frontend/src/pages/MobileControl.tsx
frontend/src/context/AuctionContext.tsx
frontend/src/services/api.ts
frontend/src/hooks/useWebSocket.ts
frontend/src/hooks/useAnimatedValue.ts
frontend/src/hooks/useResponsive.ts
frontend/src/components/common/ConfirmDialog.tsx
frontend/src/components/control/BidForm.tsx
frontend/src/components/control/BidHistory.tsx
frontend/src/components/control/SettingsPanel.tsx
frontend/src/components/control/LogoUploader.tsx
frontend/src/components/control/ExportButton.tsx
frontend/src/components/control/ResetButton.tsx
frontend/src/components/control/CurrentLevelSelector.tsx
frontend/src/components/control/DonationLevelsPanel.tsx
frontend/src/components/control/CustomThemePanel.tsx  ← (NOT the "2" copy)
frontend/src/components/control/GoalReachedPanel.tsx
frontend/src/components/control/ThemeToggle.tsx
frontend/src/components/control/ProgressBarThemePanel.tsx
frontend/src/components/display/AnimatedBackground.tsx
frontend/src/components/display/TotalDisplay.tsx
frontend/src/components/display/GoalDisplay.tsx
frontend/src/components/display/LogoDisplay.tsx
frontend/src/components/display/PaddleNumberDisplay.tsx
frontend/src/components/display/UpdateFlash.tsx
frontend/src/components/display/GoalReachedDisplay.tsx
frontend/src/types/bid.ts
frontend/src/types/settings.ts
frontend/src/types/theme.ts
frontend/src/types/controlTheme.ts
frontend/src/config/controlThemes.ts
frontend/src/utils/colorUtils.ts
frontend/src/styles/global.css
frontend/src/styles/animations.css
frontend/src/styles/themes.css
frontend/src/vite-env.d.ts
frontend/index.html
frontend/vite.config.ts
```

### Assets (keep)
```
frontend/public/Background/thermometerFinal.png   ← Used for thermometer display
frontend/public/Background/winterBackground.png   ← Used for winter theme
frontend/public/branding/company-logo.png         ← Used in Control + Display footer
```

---

## PART 3 — STABILITY & PRODUCTION CONCERNS

This app will be used at live events where any crash or freeze is unacceptable. Below are the issues found, ordered by severity.

---

### 🔴 CRITICAL — Fix Before Production

#### 1. No Error Boundary in React
**Risk:** Any unhandled JavaScript error in a component silently crashes the entire UI, leaving the display screen frozen with a blank page — in front of a live audience.

**Fix:** Wrap the app (or at minimum `Display.tsx`) in an `<ErrorBoundary>` component that renders a fallback instead of a white screen.

```tsx
// App.tsx
<ErrorBoundary fallback={<DisplayFallback />}>
  <AuctionProvider>
    <Routes>...</Routes>
  </AuctionProvider>
</ErrorBoundary>
```

---

#### 2. WebSocket Reconnection Has No Maximum Retry Cap
**File:** `frontend/src/hooks/useWebSocket.ts`
**Risk:** The exponential backoff caps delay at 5 seconds, which is good — but there is no maximum attempt count. If the backend goes down and comes back, the reconnect logic should resume. However, if an event causes repeated rapid connect/disconnect cycles (e.g. network flap), this can produce a loop that floods the server with connection attempts.

**Fix:** Add a max retry counter and a circuit-breaker pause after N consecutive failures (e.g., 10 failures → wait 30 seconds before retrying again). Also ensure the `socket.disconnect()` is called on component unmount to prevent ghost connections.

---

#### 3. No Input Sanitization on Bid Amount
**File:** `backend/src/services/BidService.ts`
**Risk:** Validation exists but it's not clear it guards against very large numbers (e.g., $999,999,999) that could overflow display formatting, or negative amounts slipping through via direct API calls. If a bad value gets into the database, the display could show garbled output during a live event.

**Fix:** Add explicit min/max guards:
```typescript
if (amount <= 0 || amount > 999999) throw new Error('Invalid amount');
if (paddleNumber < 1 || paddleNumber > 9999) throw new Error('Invalid paddle');
```

---

#### 4. CORS Set to Wildcard `*`
**File:** `backend/src/index.ts`
**Risk:** Accepting requests from any origin is fine in development but is a security risk in production. At a live event on a local network, another device on the same network could make requests to the backend.

**Fix:** Set the CORS origin to the specific frontend IP/hostname used at the event:
```typescript
cors({ origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173' })
```

---

### 🟡 HIGH — Should Fix for Production Events

#### 5. No Environment Variable Configuration
**Risk:** Port (`3001`), database path (`/data/auction.db`), and upload directory are all hardcoded. If you need to run two instances or change the port at an event, you'd have to edit source code.

**Fix:** Create a `.env` file and read values from `process.env`:
```
PORT=3001
DB_PATH=./data/auction.db
UPLOAD_DIR=./data/uploads
ALLOWED_ORIGIN=http://192.168.1.x:5173
```

---

#### 6. No Database Backup Mechanism
**Risk:** The entire auction data lives in a single SQLite file (`/data/auction.db`). If the machine crashes mid-event, all bid history could be lost. There is no backup.

**Fix (simple):** Add a backup endpoint or a cron-style interval in the backend that copies `auction.db` to `auction.db.backup` every 5 minutes during an active event.

---

#### 7. `Display.tsx` is 1,025 Lines — Too Large to Maintain Safely
**Risk:** A single massive component is harder to debug. Inline confetti logic, theme switching, progress bar rendering, and fullscreen handling are all in one file. A change to one area can accidentally break another.

**Fix:** Not urgent for stability, but before the next major change, extract:
- Confetti particle system → `utils/confetti.ts`
- Theme style calculations → a custom hook `useDisplayTheme.ts`
- Progress bar rendering → `components/display/ProgressBar.tsx`

---

#### 8. Image Uploads Have No Cleanup on Deletion
**File:** `backend/src/routes/upload.ts`
**Risk:** When a user uploads a new logo or background, the old file may not be deleted from disk. Over time (across multiple events), this fills up the upload directory with orphaned images.

**Fix:** Before saving a new upload, check if a previous file path exists in settings and `fs.unlink()` the old file.

---

#### 9. SQLite Schema Relies on `ALTER TABLE` Migrations Run at Startup
**File:** `backend/src/database/db.ts`
**Risk:** There are 7+ `ALTER TABLE` statements wrapped in `try/catch` that run every time the server starts. If any of these fail silently (which they will for columns that already exist — the catch swallows it), the schema could be in an unexpected state without any log output to diagnose it.

**Fix:** Log the outcome of each migration (even if it's just "column already exists — skipped") so you can see the schema state in logs during an event.

---

### 🟢 MEDIUM — Quality Improvements

#### 10. No Logging Framework
**Risk:** The app uses `console.log` and `console.error` throughout. At a production event, you want structured, timestamped logs to a file so you can diagnose problems that happened before you noticed them.

**Fix:** Add `pino` or `winston` (lightweight) to the backend and replace key `console.log` calls. Pipe output to a log file.

---

#### 11. No Health Monitoring on the Frontend
**Risk:** The display page shows a connection indicator, but there's no alarm or visual cue if the backend goes completely unreachable for more than, say, 30 seconds. Operators may not notice the display is frozen on stale data.

**Fix:** If `isConnected === false` for > 30 seconds, show a prominent banner on the Control page: "⚠️ Display may be showing stale data — reconnecting…"

---

#### 12. Unused CSS Keyframes in `animations.css`
**File:** `frontend/src/styles/animations.css`
**Risk:** No stability risk, but unused animations (frost shimmer, ice shimmer, winter swirl, sparkle, shimmer) add bloat to the CSS bundle. Vite won't tree-shake CSS.

**Fix:** Audit and remove any `@keyframes` blocks not referenced by active CSS classes.

---

#### 13. `vite-env.d.ts` Should Be Checked
**File:** `frontend/src/vite-env.d.ts`
**Risk:** This file declares the `ImportMeta` type for Vite's `import.meta.env`. If `VITE_API_URL` or other env vars are added, they need to be declared here or TypeScript will error.

**Fix:** When adding env vars, add them to this file.

---

## SUMMARY TABLE

### Files to Remove

| File | Impact If Removed | Confidence |
|------|------------------|------------|
| `CustomThemePanel 2.tsx` | None | Delete |
| `package-lock 2.json` | None | Delete |
| `test2.png` | None | Delete |
| `GoalCelebration.tsx` | None | Delete |
| `MoneyGrowthBar.tsx` | None | Delete |
| `LastBidAnimation.tsx` | None | Delete |
| `CurrentLevelDisplay.tsx` | None | Delete (or integrate) |
| `PaddleAnimationPanel.tsx` | None currently | Delete (or wire up) |
| `start.txt` | None | Delete |
| `notes.txt` | None (personal notes) | Your call |

### Stability Issues by Priority

| # | Issue | Severity | Effort |
|---|-------|----------|--------|
| 1 | No React Error Boundary | 🔴 Critical | Low |
| 2 | WebSocket no max retry cap | 🔴 Critical | Low |
| 3 | No bid amount upper-bound guard | 🔴 Critical | Low |
| 4 | CORS wildcard in production | 🔴 Critical | Low |
| 5 | No environment variables | 🟡 High | Medium |
| 6 | No database backup | 🟡 High | Medium |
| 7 | Display.tsx too large | 🟡 High | High |
| 8 | Old images not cleaned up | 🟡 High | Low |
| 9 | Silent migration failures | 🟡 High | Low |
| 10 | No structured logging | 🟢 Medium | Medium |
| 11 | No stale-data warning on Control | 🟢 Medium | Low |
| 12 | Unused CSS keyframes | 🟢 Medium | Low |
| 13 | `vite-env.d.ts` not updated | 🟢 Medium | Low |

---

_No changes have been made to any files. This is a read-only audit._
