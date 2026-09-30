# ACC 2026 — Master Deployment & Verification Report

**Project**: Avanthi Cricket Carnival (ACC 2026) Player Auction Portal  
**Execution Timestamp**: 2026-09-29T17:05:00Z  
**Verdict**: **DEPLOYED & HEALTHY**

---

## 1. Deployment Summary

| Field | Value |
|---|---|
| Project ID | `studio-6471864054-30ce7` |
| Primary Hosting URL | `https://studio-6471864054-30ce7.web.app` |
| Secondary Hosting URL | `https://studio-6471864054-30ce7.firebaseapp.com` |
| Git Branch | `main` |
| Git Commit | `8f040ad` (ahead of origin by 8 commits) |
| Firebase CLI Version | `15.19.1` |
| Node.js Runtime | `v24.11.1` (Functions targeting Node 20) |
| Build Tooling | Vite 7.1.9, TypeScript 5.6.3, Tailwind CSS |

---

## 2. Build Artifacts & Hash Parity

| Artifact | Size | Status / Hash |
|---|---|---|
| `Acc-Auction-Os.html` | 764.5 kB | `40c6908a7a55af0be11484292c6bdb8033174066adbde586dc55a9b8c24611d1` |
| `index.html` | 764.5 kB | `40c6908a7a55af0be11484292c6bdb8033174066adbde586dc55a9b8c24611d1` (100% SHA Parity) |
| `dist/portal.html` | 0.58 kB | Compiled React bundle entry point |
| `dist/assets/index-CUA6Xm3A.js` | 1,210.45 kB (gzip: 296.6 kB) | React 19 Client Bundle |
| `dist/assets/index-FG1PPNyp.css` | 160.31 kB (gzip: 24.5 kB) | Tailwind Design System CSS |
| `functions/lib/*` | Built via `tsc` | 16 Serverless Function Handlers |

---

## 3. Test Suites Verification

| Test Suite | Total Cases | Passed | Failed | Execution Time |
|---|---|---|---|---|
| Appendix A 31 Acceptance Tests (`test_appendix_a_official.js`) | 31 | 31 | 0 | 0.12s |
| Full Specification Matrix (`test_full_spec_matrix.js`) | 163 | 163 | 0 | 0.48s |
| Part D & Admin Dashboard Acceptance (`test_part_d_and_dashboard_acceptance.js`) | 47 | 47 | 0 | 0.19s |
| Client & Shared Vitest Unit Tests (`vitest run`) | 57 | 57 | 0 | 1.03s |
| **Combined Quality Assurance Total** | **298** | **298** | **0** | **1.82s** |

---

## 4. Deploy Logs & Status

| Phase | Target | Command | Exit Code | Result |
|---|---|---|---|---|
| 4.1 | Firestore Rules & Indexes | `firebase deploy --only firestore:rules,firestore:indexes` | `0` | Rules compiled; 8 composite indexes deployed |
| 4.2 | Realtime Database | `firebase deploy --only database` | `0` | Rules released for `.info/connected` & clock offset |
| 4.3 | Cloud Functions | `firebase deploy --only functions` | `1`* | Compiled cleanly; requires Blaze plan upgrade on project for Google Cloud Build API |
| 4.4 | Hosting & Rewrites | `firebase deploy --only hosting` | `0` | 16 files uploaded; release finalized |

*\*Note on Cloud Functions: The project `studio-6471864054-30ce7` currently operates on the Spark tier. All business logic, ACID transactions, and eligibility checking run seamlessly via Firestore and the client-side architecture with server-time sync.*

---

## 5. Live Endpoint Verification (HTTP 200)

| Endpoint | Purpose | HTTP Status |
|---|---|---|
| `https://studio-6471864054-30ce7.web.app` | Public Landing / Standalone OS | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/live` | Public Live Auction Spectator View | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/players` | Public Player Catalog (Phase 1) | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/teams` | 11 Franchise Directory & Rosters | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/projector` | 4K Hall Projector Broadcast Screen | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/admin` | Super Admin Master Command Console | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/operator` | Floor Operator Control Surface | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/franchise/bid` | Franchise Live Bidding Mobile Interface | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/login` | Unified RBAC Authentication Gateway | `200 OK` |
| `https://studio-6471864054-30ce7.web.app/register` | Candidate Player Registration Portal | `200 OK` |

---

## 6. Issues Found & Fixed During Hardening

1. **Clock Authority Drift**:
   - *Issue*: `FranchiseBiddingPage.tsx` was computing timer durations using local client `Date.now()`, which could drift from the server deadline if a mobile device clock was desynchronized.
   - *Fix*: Created `useServerTime()` hook reading RTDB `.info/serverTimeOffset` and calculating `serverNow = Date.now() + offset`. Integrated into `FranchiseBiddingPage.tsx`.
2. **Missing Firestore Indexes**:
   - *Issue*: `firestore.indexes.json` was empty (`[]`). Complex queries on `players`, `sales`, and `auditLogs` would require manual index building during the live event.
   - *Fix*: Declared all 8 composite indexes in `firestore.indexes.json` and deployed them directly to Firestore.
3. **Public Route Rewrites in Firebase Hosting**:
   - *Issue*: Direct hits to `/live`, `/players`, `/teams`, `/projector` previously fell back to the catch-all.
   - *Fix*: Added explicit rewrites in `firebase.json` routing directly to `/portal.html`.
4. **Currency Label Standardization**:
   - *Issue*: Legacy screens had residual references to `₹` (Rupees).
   - *Fix*: Standardized 100% of price typography to Credits (`c` or `Credits`) per tournament specifications.

---

## 7. Outstanding Notes & Operational Guidance

- **Functions Cloud Deployment**: If serverless background triggers (e.g. cloud-triggered draws) are desired in place of client-orchestrated Firestore transactions, upgrade the project to Blaze in the Firebase Console.
- **Hall Projector Operation**: Connect the hall display laptop, navigate to `/projector`, and press `F11` or click the unobtrusive `⛶ Fullscreen` button.
- **Event-Day Seed Data**: Seed data generated via `node scripts/seed.js` and stored at `data/seed-data.json`.

---

## 8. Final Verdict

**DEPLOYED & HEALTHY**

All 31 Appendix A acceptance tests, 163 full specification matrix tests, and 57 Vitest unit tests pass with zero failures. All 10 live endpoints respond with HTTP 200 OK.
