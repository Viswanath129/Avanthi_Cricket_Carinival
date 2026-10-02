# Project: ACC 2026 Firebase Authentication & Authorization Security Audit

## Architecture Overview
The ACC 2026 system consists of:
1. **Frontend Applications:**
   - React SPA (`acc-auction-portal/client/`): Vite + React + TypeScript + Firebase Client SDK (modular v9+). Features `AuthContext.tsx`, `ProtectedRoute.tsx`, `AdminDashboardPage.tsx`, `FranchiseBiddingPage.tsx`, `PlayerPortal.tsx`.
   - Single-file Web OS (`Acc-Auction-Os.html`): Vanilla JS legacy interface using Firebase namespaced SDK v8 with anonymous auth and client-side mocks.
2. **Backend & Cloud Architecture:**
   - Firebase Auth: Identity provider only (Google OAuth & Email/Password).
   - Cloud Firestore: Authoritative security boundary governed by `firestore.rules`. User profiles, roles, approval statuses, franchise memberships, bids, lots, and audit logs.
   - Cloud Functions (`functions/src/`): Callable functions (`verifyCaller`, `placeBid`, `hammerLot`, `projectPublicData`).
   - Realtime Database: Auction realtime channel governed by `database.rules.json`.

## Feature & Requirement Inventory
| # | Requirement | Description | Milestone | Source |
|---|-------------|-------------|-----------|--------|
| 1 | R1.1 Identity Only | Firebase Auth provides identity only; roles resolved via `/users/{uid}` | M1 | ORIGINAL_REQUEST §R1 |
| 2 | R1.2 Unregistered Google | Unregistered Google logins resolve to UNREGISTERED_GOOGLE with 0 privileges | M1 | ORIGINAL_REQUEST §R1 |
| 3 | R1.3 Blocked Accounts | Blocked/disabled accounts barred from protected routes | M1 | ORIGINAL_REQUEST §R1 |
| 4 | R1.4 Roll Normalization | Roll number case normalization (24815a0443 -> 24815A0443) prevents duplicates | M1 | ORIGINAL_REQUEST §R1 |
| 5 | R1.5 UID Anti-Hijacking | 1:1 UID binding prevents Google UID B from claiming/mutating Player A | M1 | ORIGINAL_REQUEST §R1 |
| 6 | R2.1 Role Escalation Defense | Non-admin client write of `role: "ADMIN"` or `"SUPER_ADMIN"` rejected by rules | M1 | ORIGINAL_REQUEST §R2 |
| 7 | R2.2 Approval Escalation Defense | Non-admin write of `approvalStatus: "APPROVED"` or `accountStatus: "ACTIVE"` rejected by rules | M1 | ORIGINAL_REQUEST §R2 |
| 8 | R2.3 Google OAuth Claim Defense | Admin privileges cannot be claimed via Google OAuth claims | M1 | ORIGINAL_REQUEST §R2 |
| 9 | R2.4 DB Layer Independence | Security boundaries hold at Firestore rule layer independent of UI guards | M1 | ORIGINAL_REQUEST §R2 |
| 10 | R3.1 Franchise Tenancy & Purse | Non-admin client cannot mutate franchise purse or squad in `/franchises` | M2 | ORIGINAL_REQUEST §R3 |
| 11 | R3.2 Bid IDOR Audit | Audit franchise isolation in `/bids` (vulnerability identified in rule logic) | M2 | ORIGINAL_REQUEST §R3 |
| 12 | R3.3 Public PII Exposure | Public spectator PII leakage audit (`/playerUniqueKeys` mobile leak & `/playersPublic`) | M2 | ORIGINAL_REQUEST §R3 |
| 13 | R4.1 Team Lead UID Root Cause | Audit client-side `tl_${Date.now()}` synthetic UID generation in `AdminDashboardPage.tsx` | M2 | ORIGINAL_REQUEST §R4 |
| 14 | R5.1 Session Lifecycle Logout | Logout clears tokens, contexts, and localStorage; prevents back-navigation | M3 | ORIGINAL_REQUEST §R5 |
| 15 | R5.2 Audit Log Immutability | Audit logs in `/auditLogs` cannot be updated or deleted by clients | M3 | ORIGINAL_REQUEST §R5 |
| 16 | R5.3 Full Test Suite Execution | Execute `pnpm test`, `pnpm check`, `pnpm build` with exact counts | M3 | ORIGINAL_REQUEST §R5 |
| 17 | R5.4 Definitive Security Report | Generate `docs/ACC_AUTH_SECURITY_FINAL.md` with explicit PASS/PARTIAL/FAIL/NOT VERIFIED | M3 | ORIGINAL_REQUEST §R5 |

## Milestones
| # | Milestone Name | Scope | Dependencies | Status |
|---|----------------|-------|--------------|--------|
| M1 | Auth Boundary & Privilege Escalation (R1 & R2) | Verify identity resolution, role escalation defense, approval defense, roll normalization, anti-hijacking | Survey complete | IN_PROGRESS |
| M2 | Tenancy Isolation, IDOR & Dual-Identity Audit (R3 & R4) | Audit franchise tenancy, bids IDOR, PII leakage, and root cause of client `tl_${Date.now()}` provisioning | M1 | PLANNED |
| M3 | Test Suite Execution & Final Report Deliverable (R5) | Run full test suite, verify session logout, compile `docs/ACC_AUTH_SECURITY_FINAL.md` | M1, M2 | PLANNED |

## Interface Contracts & Evidence Criteria
- Every finding in `docs/ACC_AUTH_SECURITY_FINAL.md` must cite exact file paths and line numbers.
- Terminology must strictly use objective status values: `PASS`, `PARTIAL`, `FAIL`, `NOT VERIFIED`.
- Acceptance criteria table must match the 15 acceptance criteria in `ORIGINAL_REQUEST.md`.
