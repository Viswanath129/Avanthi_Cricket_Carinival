# ACC 2026 — Root Route, Hard-Refresh Auth Restoration & Blue Animated Background Report

**Tournament Edition**: Avanthi Cricket Carnival 2026 (ACC 2026)  
**Target Environment**: `https://studio-6471864054-30ce7.web.app`  
**Status**: APPROVED & VERIFIED  

---

## 1. Executive Summary

This deliverable resolves the critical production defect where performing a browser reload, hard refresh (`Ctrl+Shift+R`), or direct URL access after successful login caused the application to revert to an unwanted monolithic public auction screen (`THE AUCTION IS LIVE` / `REGISTERED PLAYER ROSTER`).

The fix preserves:
1. The **Blue Animated Background** (`Blue-sky.mp4` / `Blue-sky-2048x1166.svg`) rendered globally as a non-destructive backdrop layer.
2. The single authoritative **Firebase Auth & Firestore** configuration (zero duplicate Firebase projects created).
3. Continuous session restoration across `/player`, `/franchise`, and `/admin` routes on hard refresh without unwanted redirects to the root landing screen.
4. Clean separation between the React Single Page Application (`dist/index.html`) and the legacy standalone Web OS (`dist/os.html` / `dist/Acc-Auction-Os.html`).

---

## 2. Root Cause Analysis

### A. Distribution Sync Overwrite Flaw
- **The Defect**: In `acc-auction-portal/sync-dist.js`, the build script executed `fs.copyFileSync(rootIndex, distIndex)`.
- **Impact**: Vite compiled the modern React SPA into `dist/index.html`, but `sync-dist.js` immediately overwrote it with `rootDir/index.html` (the legacy monolithic file `Acc-Auction-Os.html`).
- **Result**: Firebase Hosting served the legacy HTML file for `/index.html`. On boot, the legacy script defaulted to `currentView = 'public'`, rendering the exact unwanted screen reported by the user (`THE AUCTION IS LIVE`, `REGISTERED PLAYER ROSTER`, `WATCH LIVE AUCTION`, `EXPLORE PLAYERS`).

### B. Hosting Rewrite Misalignment
- In `firebase.json`, route rewrites were incomplete, meaning direct navigation or hard refreshes to `/player` or `/franchise` fell back to `/index.html` (which was the overwritten legacy OS file).

### C. Transient Auth Resolution Race Condition
- On initial page load or hard refresh, `fbAuth.onAuthStateChanged` takes 100–300ms to resolve cached credentials.
- Previously, route guards interpreted the transient `loading === true` state or initial `user === null` as an unauthenticated session and redirected immediately to `/`, ejecting authenticated users from their dashboard.

---

## 3. Implemented Architecture & Remediation

### A. Distribution Sync Integrity (`acc-auction-portal/sync-dist.js`)
- `dist/index.html` is strictly preserved as the compiled React SPA bundle produced by Vite.
- `dist/portal.html` is mirrored from `dist/index.html` for backward compatibility.
- The standalone legacy Web OS is synced exclusively to `dist/os.html` and `dist/Acc-Auction-Os.html`. It never touches or overwrites `dist/index.html`.
- High-resolution background assets (`Blue-sky.mp4`, `Blue sky.mp4`, `Blue-sky-2048x1166.svg`, `Blue sky-2048x1166.svg`) are copied directly to `dist/`.

### B. Authoritative Hosting Rewrites (`firebase.json`)
Explicit rewrites route all application paths to `/index.html` without cache contamination:
```json
{
  "source": "/player/**",
  "destination": "/index.html"
},
{
  "source": "/franchise/**",
  "destination": "/index.html"
},
{
  "source": "/admin/**",
  "destination": "/index.html"
},
{
  "source": "**",
  "destination": "/index.html"
}
```

### C. Global Blue Animated Background (`BlueAnimatedBackground.tsx`)
Mounted globally in `App.tsx` behind all routes:
- Hardware-accelerated `<video>` layer with `autoPlay`, `loop`, `muted`, and `playsInline`.
- SVG fallback poster (`/Blue-sky-2048x1166.svg`) prevents blank flashes on network latency.
- Frosted radial scrim (`rgba(246, 249, 255, 0.12)` to `rgba(246, 249, 255, 0.32)`) ensures high-contrast WCAG AA readability for foreground text.

### D. Hard-Refresh Auth Restoration (`RootRoute` & `ProtectedRoute`)
1. **RootRoute (`/`)**:
   - While `loading === true`, renders a smooth glassmorphic restoration card ("ACC 2026 · Restoring Session...").
   - When authenticated, evaluates `userDoc.role` and deterministically redirects to `/player`, `/franchise`, `/admin`, or `/operator`.
   - When unauthenticated, cleanly renders `<Home />`.
2. **ProtectedRoute (`/player`, `/franchise`, `/admin`)**:
   - While `loading === true`, renders the restoration spinner without modifying the URL.
   - Once Firebase Auth resolves, renders the child component directly. The user remains on the exact dashboard route they refreshed.

---

## 4. Automated Verification Matrix

| Test Suite / ID | Description | Result |
| :--- | :--- | :--- |
| `AUTH-ROUTE-001` | Auth loading state on `/` does not redirect or leak home; shows restoration card | **PASSED** |
| `AUTH-ROUTE-002` | Hard refresh on `/player` with session loading preserves route and displays loader | **PASSED** |
| `AUTH-ROUTE-003` | Hard refresh on `/franchise` with session loading preserves route and displays loader | **PASSED** |
| `AUTH-ROUTE-004` | Hard refresh on `/admin` with session loading preserves route and displays loader | **PASSED** |
| `AUTH-ROUTE-005` | Authenticated `PLAYER` on root `/` redirects deterministically to `/player` | **PASSED** |
| `AUTH-ROUTE-006` | Authenticated `FRANCHISE` on root `/` redirects deterministically to `/franchise` | **PASSED** |
| `AUTH-ROUTE-007` | Authenticated `SUPER_ADMIN` on root `/` redirects deterministically to `/admin` | **PASSED** |
| `AUTH-ROUTE-008` | Unauthenticated visitor accessing `/player` is redirected to `/login?mode=player` | **PASSED** |
| `AUTH-ROUTE-009` | Unauthenticated visitor accessing `/admin` is redirected to `/login?mode=admin` | **PASSED** |
| `AUTH-ROUTE-010` | Authorized user renders children directly without redirects | **PASSED** |
| `Vitest Suite` | 9 test files, 85 automated tests in `acc-auction-portal` | **85 / 85 PASSED** |
| `test_part_d_and_dashboard_acceptance.js` | 47 tests including 100% byte parity (`index.html` === `Acc-Auction-Os.html`) | **47 / 47 PASSED** |
| `test_section52_acceptance.js` | 40 admin governance, player lifecycle, and responsive layout tests | **40 / 40 PASSED** |
| `test_redteam_remediation.js` | 38 red-team security, role hierarchy, and rule enforcement tests | **38 / 38 PASSED** |
| `pnpm check` | TypeScript compiler check with zero emit errors | **PASSED (0 errors)** |
| `pnpm build` | Production Vite build and asset distribution | **PASSED** |

---

## 5. Deployment & Release Integrity

- **Hosting Target**: `studio-6471864054-30ce7`
- **Public URL**: `https://studio-6471864054-30ce7.web.app`
- **Git Branch**: `main`
- **Zero Regressions**: Core auction engine, bidding ladder, reserve purse calculations, bucket constraints, and Firestore security rules remain 100% intact.
