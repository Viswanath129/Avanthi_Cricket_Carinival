# BRIEFING — 2026-10-02T05:01:00Z

## Mission
Investigate Franchise Tenancy & IDOR Defense (R3), Dual-Identity Provisioning & Team Lead Architecture (R4), and Audit Log Immutability (R5 part) across the codebase.

## 🔒 My Identity
- Archetype: explorer
- Roles: Tenancy & Architecture Explorer
- Working directory: b:\projects\ACC\.agents\teamwork\explorer_survey_tenancy_2
- Original parent: 7f068c7d-2f06-486e-9bdd-e40597973f6a
- Milestone: Survey & Architecture Investigation (R3, R4, R5 part)

## 🔒 Key Constraints
- Read-only investigation — do NOT implement
- Cite exact file paths, line numbers, and architectural data flows
- Write findings to report.md and handoff.md

## Current Parent
- Conversation ID: 7f068c7d-2f06-486e-9bdd-e40597973f6a
- Updated: not yet

## Investigation State
- **Explored paths**:
  - `firestore.rules` & `acc-auction-portal/firestore.rules`
  - `acc-auction-portal/functions/src/` (`index.ts`, `utils/auth.ts`, `auction/placeBid.ts`, `auction/passFranchise.ts`, `auction/hammerLot.ts`, `triggers/projectPublicData.ts`, `registration/registerFranchise.ts`, `registration/registerPlayer.ts`)
  - `acc-auction-portal/client/src/` (`contexts/AuthContext.tsx`, `pages/AdminDashboardPage.tsx`, `pages/FranchiseBiddingPage.tsx`, `pages/PlayerRegistrationPage.tsx`, `pages/FranchiseRegistrationPage.tsx`, `hooks/useBidSubmission.ts`)
  - `index.html` & `Acc-Auction-Os.html`
- **Key findings**:
  - R3 IDOR & Tenancy: `/bids/{bidId}` creates allow `isFranchise()` without checking payload `franchiseId`. `/acc_auctions/{auctionId}` write allows `isFranchise()` unconditionally. Self-creation of `/franchiseUsers/{uid}` allows any user to inject arbitrary `franchiseId` and bypass `isFranchiseOwner(franchiseId)` to read private franchise data. Direct PII leak in `/playerUniqueKeys/{keyId}` which has `allow read: if true;` and stores `mobile_${number}`. Unapproved players projected to `playersPublic` which allows public read.
  - R4 Dual-Identity Provisioning: `AdminDashboardPage.tsx:563` synthesizes `tl_${Date.now()}` client-side without Firebase Admin SDK or OAuth account creation. When real team lead logs in via Google, Firebase Auth generates real UID which never matches `tl_...`, stranding them in `UNREGISTERED_GOOGLE` with null permissions.
  - R5 Audit Log Immutability: `/auditLogs/{logId}` has `allow update, delete: if false;` and `allow create, read: if isAdmin();`. Immutability holds at rules level. Defect found in `AdminDashboardPage.tsx:221` where client writes to singular `'auditLog'`, causing admin action persistence to fail.
- **Unexplored areas**: None for R3, R4, and R5 (audit log part).

## Key Decisions Made
- Fully analyzed and cross-referenced client, Cloud Functions, and Firestore security rules to identify both structural rule vulnerabilities and frontend architectural discrepancies.

## Artifact Index
- DISPATCH.md — Record of incoming instructions
- progress.md — Liveness heartbeat and progress tracking
- report.md — Comprehensive investigation report
- handoff.md — Standardized 5-component handoff report
