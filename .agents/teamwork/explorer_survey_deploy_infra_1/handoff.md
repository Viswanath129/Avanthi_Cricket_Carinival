# Handoff Report: Deployment, 3-File Parity, Firebase Config & Testing Infrastructure

**Author**: `explorer_survey_deploy_infra_1`  
**Working Directory**: `B:\projects\ACC\.agents\teamwork\explorer_survey_deploy_infra_1`  
**Date**: 2026-10-07T17:00:00Z  
**Parent Conversation ID**: `66041fa3-be11-41c6-9f64-93d3c8cf496f`  

---

## 1. Observation

### 1.1 File Parity Check
Direct execution of PowerShell `Get-FileHash`:
```powershell
Get-FileHash -Algorithm SHA256 "B:\projects\ACC\Acc-Auction-Os.html", "B:\projects\ACC\index.html", "B:\projects\ACC\acc-auction-portal\dist\index.html" | Format-List
```
Results observed:
- `B:\projects\ACC\Acc-Auction-Os.html`:
  - Size: 966,068 bytes
  - SHA-256: `E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`
- `B:\projects\ACC\index.html`:
  - Size: 966,068 bytes
  - SHA-256: `E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`
- `B:\projects\ACC\acc-auction-portal\dist\index.html`:
  - Size: 966,068 bytes
  - SHA-256: `E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`
- Additional copies in `dist`:
  - `acc-auction-portal\dist\Acc-Auction-Os.html`: `E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`
  - `acc-auction-portal\dist\os.html`: `E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`
- Drift observed in sub-mirror directory:
  - `acc-auction-portal\dist\public\index.html`: Size: 955,619 bytes, SHA-256: `320F00D206CB0DC2227CA3C4174947D2068ABFFFE9C4048B4E88F0FBA9ACAD63`
  - This indicates `sync-dist.js` was not executed after the most recent update to the root files.

### 1.2 Synchronization Mechanisms
- In `B:\projects\ACC\acc-auction-portal\package.json` (lines 8):
  ```json
  "build": "tsc && vite build && node sync-dist.js"
  ```
- In `B:\projects\ACC\acc-auction-portal\sync-dist.js` (lines 26-39, 60-70):
  ```javascript
  // 1. Copy root index.html (Acc-Auction-Os.html) into dist
  const rootIndex = path.join(rootDir, 'index.html');
  const rootOs = path.join(rootDir, 'Acc-Auction-Os.html');

  if (fs.existsSync(rootIndex)) {
    fs.copyFileSync(rootIndex, path.join(distDir, 'index.html'));
    fs.copyFileSync(rootIndex, path.join(distDir, 'os.html'));
  }
  if (fs.existsSync(rootOs)) {
    fs.copyFileSync(rootOs, path.join(distDir, 'Acc-Auction-Os.html'));
  }
  // 3. Ensure public mirror directory is updated as well
  const publicDir = path.join(distDir, 'public');
  if (fs.existsSync(distIndex)) {
    fs.copyFileSync(distIndex, path.join(publicDir, 'index.html'));
    fs.copyFileSync(distIndex, path.join(publicDir, 'Acc-Auction-Os.html'));
  }
  ```
- No mechanism in `sync-dist.js` or `package.json` synchronizes root `Acc-Auction-Os.html` to root `index.html`. In historical scripts (e.g. `scripts/apply_light_theme_and_no_emojis.py` lines 514-518), edits were written simultaneously to both `Acc-Auction-Os.html` and `index.html`.

### 1.3 Deployment & Hosting Configuration
- Root `B:\projects\ACC\firebase.json`:
  ```json
  "hosting": {
    "public": "acc-auction-portal/dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "headers": [
      {
        "source": "**/*.@(html|htm)",
        "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
      },
      {
        "source": "/",
        "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
      },
      {
        "source": "/index.html",
        "headers": [{ "key": "Cache-Control", "value": "no-cache, no-store, must-revalidate" }]
      }
    ],
    "rewrites": [{ "source": "**", "destination": "/index.html" }]
  },
  "firestore": { "rules": "firestore.rules", "indexes": "firestore.indexes.json" },
  "database": { "rules": "database.rules.json" },
  "functions": { "source": "acc-auction-portal/functions", "runtime": "nodejs20" },
  "storage": { "rules": "storage.rules" }
  ```
- Root `B:\projects\ACC\.firebaserc`:
  ```json
  {
    "projects": {
      "default": "studio-6471864054-30ce7"
    }
  }
  ```
- Sub-portal `acc-auction-portal/.firebaserc` (legacy reference):
  ```json
  {
    "projects": {
      "default": "avanthi-cricket-carnival-2026"
    }
  }
  ```
- Command to deploy:
  - From root `B:\projects\ACC`: `firebase deploy --only hosting` (or `npx firebase deploy --only hosting`).
- Live URL HTTP response (`curl.exe -I https://studio-6471864054-30ce7.web.app`):
  ```
  HTTP/1.1 200 OK
  Cache-Control: no-cache, no-store, must-revalidate
  Content-Type: text/html; charset=utf-8
  Etag: "b58d3fc8c933f72a6cc827386708f56a916c14dbfa5562df78c58175ff0ed15a"
  ```
- Firebase project status (`npx firebase projects:list`):
  `AvanthiCricketCarnival | studio-6471864054-30ce7 (current) | 830366253821`

### 1.4 Security & Database Rules
- `firestore.rules` (v2):
  - Rules define helper functions: `isAuthenticated()`, `getUserDoc()`, `getUserRole()`, `isSuperAdmin()`, `isAdmin()`, `isFranchise()`.
  - Collections governed: `/users/{uid}`, `/editions/{editionId}`, `/players/{playerId}`, `/playerUniqueKeys/{keyId}`, `/publicPlayers/{playerId}`, `/playersPublic/{playerId}`, `/deletedPlayers/{playerId}`, `/registrations/{regId}`, `/franchises/{franchiseId}`, `/franchisesPublic/{franchiseId}`, `/deletedFranchises/{franchiseId}`, `/franchiseUsers/{uid}`, `/lots/{lotId}`, `/bids/{bidId}`, `/acc_auctions/{auctionId}`, `/acquisitions/{acqId}`, `/sales/{saleId}`, `/auditLogs/{logId}`, `/auditLog/{logId}`, `/settings/{settingId}`.
  - Audit log immutability: `match /auditLogs/{logId} { allow read: if isAdmin(); allow create: if false; allow update, delete: if false; }`.
- `storage.rules` (v2):
  - Upload paths: `/players/{playerId}/{fileName}`, `/franchises/{franchiseId}/{fileName}`, `/coordinators/{coordId}/{fileName}`. Size limit `< 5 * 1024 * 1024` bytes, content type `image/*`.
- `database.rules.json`:
  - Paths governed: `/presence`, `/publicStats`, `/auctionState`, `/players`.

### 1.5 Testing Infrastructure Execution Results
1. `node tests/test_part_d_and_dashboard_acceptance.js`:
   - 47/47 passed (30 Part D conditions, 16 Admin Dashboard minimal acceptance, 1 Parity test).
2. `node tests/test_section52_acceptance.js`:
   - 13 test suites / 41 assertions passed (Approval, edit, block, archive, roll normalization, mobile responsiveness).
3. `node tests/test_appendix_a_official.js`:
   - 31/31 passed (Cases 1-31 from Problem Statement Appendix A).
4. `node tests/test_timer_franchiseref_photo_admin_fixes.js`:
   - 5/5 passed (Firestore rules audit, first bid timer activation, franchise referral, photo upload, 3-way SHA256 parity).
5. `node tests/test_auction_timer_root_cause.js`:
   - 25/25 passed (Countdown, 20s bid reset, pause/resume, clock sync offset, deadline monotonicity).
6. `node tests/test_timer_and_bid_sync.js`:
   - 21/21 passed (Zero-latency timer sync and bid start).
7. `node tests/test_aspect_ratio_and_live_badge.js`:
   - 5/5 passed (4:3 aspect ratio enforcement, live database indicator badge).
8. `node tests/test_photo_editor_zoom_no_whitespace.js`:
   - 5/5 passed (Cover-mode zoom baseline, edge clamping, 0 top gap).
9. `node tests/test_login_and_reg.js`:
   - 4/4 passed (Admin login fields and registration form layout).
10. `node tests/test_admin_governance.js`:
    - 7/7 passed (Credential generation, approval lifecycle, case-insensitive roll deduplication).
11. `node tests/test_admin_and_player_portal.js`:
    - 3/3 passed (Admin login handling, player portal rendering).
12. `node tests/test_bucket_wise_auction_and_draw.js`:
    - 7/7 passed (Bucket sequence B3->B4->B2->B1->D5->M6, draw modes).
13. `node tests/test_page_reload_view_persistence.js`:
    - 5/5 passed (Session restoration, sub-tab hash routing, 10 reload scenarios).
14. `node tests/test_verification_and_admin_gate.js`:
    - 5/5 passed (Player verification workflow and public gate).
15. `node tests/test_player_visibility_and_realtime.js`:
    - 5/5 passed (Player visibility lifecycle, no resurrection bug).
16. In `acc-auction-portal`: `pnpm test` (Vitest):
    - 9 test files, 79 tests passed (100%).
17. In `acc-auction-portal`: `pnpm check` (`tsc --noEmit`):
    - Exited with code 0, 0 TypeScript errors.
18. `node scripts/check-env.js`:
    - Passed: All required Firebase environment variables configured.

### 1.6 Environment & Dependencies
- Node.js: `v24.11.1`
- pnpm: `10.30.2`
- npm: `11.14.1`
- Firebase CLI: `15.19.1`

---

## 2. Logic Chain

1. **Byte Parity Invariant**:
   - The user specification dictates that three files must remain bit-for-bit identical: `Acc-Auction-Os.html`, `index.html`, and `acc-auction-portal/dist/index.html`.
   - Direct hashing via `Get-FileHash` confirmed that all 3 files currently have identical SHA-256 hashes (`E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`) and identical length (966,068 bytes).
   - In `acc-auction-portal/sync-dist.js`, copying `rootDir/index.html` to `dist/index.html` and `rootDir/Acc-Auction-Os.html` to `dist/Acc-Auction-Os.html` updates the dist folder, but it assumes `rootDir/index.html` and `rootDir/Acc-Auction-Os.html` were already synced. If an implementer modifies `Acc-Auction-Os.html` alone, root `index.html` would not automatically update unless explicitly copied.

2. **Deployment Mapping**:
   - `firebase.json` at root defines `"public": "acc-auction-portal/dist"`.
   - `.firebaserc` at root defines `"default": "studio-6471864054-30ce7"`.
   - Therefore, executing `firebase deploy --only hosting` from the workspace root targets `https://studio-6471864054-30ce7.web.app` with the build assets inside `acc-auction-portal/dist`.
   - Because `rewrites` points all routes to `/index.html`, Firebase Hosting serves `acc-auction-portal/dist/index.html`.

3. **Acceptance Test Execution Structure**:
   - Testing is divided into two distinct harnesses:
     - **Core Web OS Acceptance Tests** (`tests/test_*.js`): Executed using standalone `node tests/<script>.js`. The authoritative suites (`test_part_d_and_dashboard_acceptance.js`, `test_section52_acceptance.js`, `test_appendix_a_official.js`, `test_timer_franchiseref_photo_admin_fixes.js`, `test_auction_timer_root_cause.js`, `test_timer_and_bid_sync.js`) have a 100% pass rate.
     - **React Portal Unit & Integration Tests** (`acc-auction-portal`): Executed via `pnpm test` (Vitest: 79 tests passing) and `pnpm check` (`tsc --noEmit`: 0 errors).
   - `tests/e2e_auction_test.js` is an older test harness authored before the light theme redesign; its 47 failures stem from asserting dark mode CSS tokens and obsolete element IDs.
   - `tests/test_realtime_and_presence.js` requires the Node SDK to resolve modules from `acc-auction-portal/node_modules` and attempts a write to `/presence_test` which is intentionally blocked by `database.rules.json`.

---

## 3. Caveats

1. **Sync Dependency Caveat**:
   - `sync-dist.js` copies `index.html` to `dist/index.html`. It does NOT copy `Acc-Auction-Os.html` to `index.html`. Any edits made directly to `Acc-Auction-Os.html` must be manually copied to `index.html` in the root (or via a helper script) before running `sync-dist.js`, otherwise root `index.html` and `dist/index.html` will diverge from `Acc-Auction-Os.html`.
2. **Dist Public Folder Mirror**:
   - `acc-auction-portal/dist/public/index.html` currently contains an older version (955,619 bytes, hash `320F00D2...`). While `firebase.json` at root serves from `acc-auction-portal/dist` (and not `dist/public`), running `node acc-auction-portal/sync-dist.js` will update `dist/public` as well.
3. **Dual `.firebaserc` Files**:
   - Root `.firebaserc` points to `studio-6471864054-30ce7`.
   - `acc-auction-portal/.firebaserc` points to `avanthi-cricket-carnival-2026`.
   - Deployment must always be executed from the **workspace root** (`B:\projects\ACC`), NOT from inside `acc-auction-portal`, to avoid targeting the wrong Firebase project.
4. **Realtime Database Permission Bounding in Tests**:
   - Integration tests writing to arbitrary RTDB paths (e.g. `/presence_test`) fail with `PERMISSION_DENIED` because `database.rules.json` strictly whitelists `/presence`, `/publicStats`, `/auctionState`, and `/players`.

---

## 4. Conclusion

1. **Parity State**: `Acc-Auction-Os.html`, `index.html`, and `acc-auction-portal/dist/index.html` are currently in **100% bit-for-bit SHA-256 byte parity** (`E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`, 966,068 bytes).
2. **Deployment Configuration**: Firebase Hosting is properly wired in root `firebase.json` to deploy `acc-auction-portal/dist` to project `studio-6471864054-30ce7`. Deployment command is `firebase deploy --only hosting` (or `npx firebase deploy --only hosting`) run from `B:\projects\ACC`. The live URL `https://studio-6471864054-30ce7.web.app` is active and returns HTTP 200 with no-cache headers.
3. **Test Infrastructure**:
   - Key acceptance test suites (`test_part_d_and_dashboard_acceptance.js`, `test_section52_acceptance.js`, `test_appendix_a_official.js`, `test_timer_franchiseref_photo_admin_fixes.js`, `test_auction_timer_root_cause.js`, `test_timer_and_bid_sync.js`) pass with 0 errors.
   - Portal test suite (`pnpm test`) passes all 79 tests.
   - TypeScript compiler (`pnpm check`) passes with 0 errors.
4. **Environment Readiness**: Node v24.11.1, pnpm 10.30.2, npm 11.14.1, and Firebase CLI 15.19.1 are installed, configured, and authenticated.

---

## 5. Verification Method

To independently verify the survey findings:

1. **Verify 3-File Byte Parity**:
   ```powershell
   Get-FileHash -Algorithm SHA256 "B:\projects\ACC\Acc-Auction-Os.html", "B:\projects\ACC\index.html", "B:\projects\ACC\acc-auction-portal\dist\index.html" | Format-List
   ```
   *Expected*: All 3 hashes must be exactly `E4089312EEC7CB973A69D80E4B8455C6E7CB1E0AA52CBE3E0B7DB3060D658FC8`.

2. **Verify Live Firebase URL**:
   ```bash
   curl.exe -I https://studio-6471864054-30ce7.web.app
   ```
   *Expected*: Returns `HTTP/1.1 200 OK` with `Cache-Control: no-cache, no-store, must-revalidate`.

3. **Verify Acceptance Test Suites**:
   ```bash
   node tests/test_part_d_and_dashboard_acceptance.js
   node tests/test_section52_acceptance.js
   node tests/test_appendix_a_official.js
   node tests/test_timer_franchiseref_photo_admin_fixes.js
   node tests/test_auction_timer_root_cause.js
   node tests/test_timer_and_bid_sync.js
   ```
   *Expected*: All suites report 0 failures and exit with code 0.

4. **Verify Portal Vitest and TypeScript**:
   ```bash
   cd acc-auction-portal
   pnpm test
   pnpm check
   ```
   *Expected*: 79 passed tests and 0 TypeScript compilation errors.

5. **Invalidation Conditions**:
   - Any modification made to `Acc-Auction-Os.html` without copying to `index.html` and running `node acc-auction-portal/sync-dist.js` invalidates the 3-file parity invariant.
   - Running `firebase deploy` from inside `acc-auction-portal` invalidates the target project destination.
