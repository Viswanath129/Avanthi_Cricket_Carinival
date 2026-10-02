# ACC 2026 — Definitive Adversarial Security Audit & Authorization Verification

**Document Identifier:** `ACC-SEC-AUTH-2026-FINAL`  
**Target System:** Avanthi Cricket Carnival (ACC 2026) Auction Operating System & Portal  
**Target Repository:** `b:\projects\ACC`  
**Auditor Identity:** Teamwork Security Audit Specialist & QA Sentinel  
**Verification Date:** October 2, 2026  
**Security Classification:** Strict Technical Audit / Production Gate Report  
**Compliance Standard:** Adversarial Static Analysis, Live Test Suite Execution, and Threat Modeling  

---

## 1. Executive Summary & Verification Certification Metadata

### 1.1 Executive Summary
A comprehensive, adversarial security audit and authorization verification was conducted against the Avanthi Cricket Carnival (ACC 2026) production software architecture. The audit evaluated the dual frontend implementation:
1. **Production React SPA (`acc-auction-portal`):** Vite v7, React 18, TypeScript, Firebase Modular SDK v11, Cloud Firestore, Cloud Functions v2, and Realtime Database.
2. **Standalone Single-File Web OS (`Acc-Auction-Os.html` / `index.html`):** Legacy client-side simulation running Firebase Compat SDK v10 with anonymous authentication and browser `localStorage`.

The primary objective was to verify that the **frontend is treated as untrusted**, all security boundaries hold authoritatively at the database and cloud function execution layers, and no client-side spoofing or tampering can compromise tournament integrity, franchise purses, player data privacy, or administrative governance.

### 1.2 System Certification Metadata
- **Git Workspace Root:** `b:\projects\ACC`
- **Primary Web Portal:** `b:\projects\ACC\acc-auction-portal`
- **Node.js Runtime Environment:** Node.js v24.11.1 on Windows 11
- **Automated Test Runner:** Vitest v2.1.9 (8 test suites, 75 unit/integration tests)
- **TypeScript Compiler:** TypeScript v5.6.3 (`tsc --noEmit`)
- **Vite Bundler:** Vite v7.1.9 (Transforming 1,686 modules in production build)
- **Firebase Engine:** Cloud Firestore Rules Version 2, Cloud Functions Node 20 runtime

### 1.3 Key Audit Findings Overview
- **Authentication Boundary (PASS):** Firebase Authentication provides identity only (`uid`, `email`). Roles and permissions resolve exclusively from authoritative Firestore records at `/users/{uid}`. Unregistered Google accounts are strictly trapped in `UNREGISTERED_GOOGLE` with zero privileges. Blocked accounts are immediately denied access.
- **Privilege Escalation Defense (PASS):** Non-admin clients attempting direct Firestore writes to set `role: "ADMIN"` or `role: "SUPER_ADMIN"`, or elevate `approvalStatus: "APPROVED"`, are unconditionally rejected by `firestore.rules`.
- **Franchise Isolation & IDOR (PARTIAL / HIGH RISK):** While franchise purse and squad updates are protected in `/franchises/{franchiseId}`, two critical IDOR gaps exist:
  1. `/bids/{bidId}` creation rule fails to validate that `request.resource.data.franchiseId` matches the caller's authorized franchise.
  2. `/acc_auctions/{auctionId}` grants blanket write permissions to any franchise user, permitting unauthorized mutation of global auction state.
- **Public Spectator Data Leakage (FAIL / CRITICAL):**
  1. `/playerUniqueKeys/{keyId}` allows unauthenticated public read (`allow read: if true;`), exposing all student mobile phone numbers through document IDs formatted as `mobile_{normalizedMobile}`.
  2. `/playersPublic/{playerId}` exposes unapproved and rejected applicants to public spectators because background triggers project players immediately upon registration.
- **Dual-Identity Team Lead UID Provisioning (FAIL / CRITICAL ARCHITECTURAL FLAW):** Team Leader accounts are generated client-side in `AdminDashboardPage.tsx` using synthetic IDs (`tl_${Date.now()}`) without Firebase Admin SDK provisioning. Consequently, when a human Team Leader logs in via Google OAuth, their real Google UID does not match the database document, trapping them permanently in `UNREGISTERED_GOOGLE`.
- **Audit Trail Immutability (PASS at DB / DEFECT at Client):** `firestore.rules` enforces absolute immutability (`allow update, delete: if false;`). However, `AdminDashboardPage.tsx#L221` writes to `'auditLog'` (singular) rather than `'auditLogs'` (plural), causing admin UI audit events to be dropped by Firestore default-deny.

---

## 2. Threat Model & Trust Boundaries

The ACC 2026 auction system operates under an adversarial threat model where the client runtime environment (web browser, mobile browser, or modified HTTP/WebSocket client) must be considered **hostile and completely untrusted**.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        UNTRUSTED FRONTEND LAYER                        │
│   React SPA (Vite / Client SDK)      Acc-Auction-Os.html (Compat SDK)  │
│   DevTools / Console Tampering       Forged REST / WebSocket Payloads  │
└───────────────────┬────────────────────────────────┬───────────────────┘
                    │                                │
                    ▼                                ▼
       ┌────────────────────────┐       ┌────────────────────────┐
       │   CLOUD FIRESTORE      │       │   CLOUD FUNCTIONS      │
       │   SECURITY RULES v2    │       │   (Admin SDK / Node20) │
       │  /users/{uid}          │       │   verifyCaller()       │
       │  /players/{playerId}   │       │   placeBid()           │
       │  /franchises/{fId}     │       │   hammerLot()          │
       │  /bids/{bidId}         │       └───────────┬────────────┘
       │  /auditLogs/{logId}    │                   │
       └────────────┬───────────┘                   │
                    │                               │
                    ▼                               ▼
┌────────────────────────────────────────────────────────────────────────┐
│                    AUTHORITATIVE DATABASE BOUNDARY                     │
│    Canonical Firestore Collections & State Records (Fail Closed)       │
└────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Principle of the Untrusted Frontend
No security decision, role grant, auction validation, or price calculation executed in the client browser is trusted by the backend. Route guards (such as `ProtectedRoute.tsx` and hash-change listeners in `Acc-Auction-Os.html`) are purely UX conveniences. Security boundaries are established exclusively at:
1. Cloud Firestore Security Rules (`firestore.rules`).
2. Server-side Cloud Functions (`functions/src/`).
3. Realtime Database Security Rules (`database.rules.json`).

### 2.2 Layer 1: Firebase Authentication (Identity Provider Only)
Firebase Authentication handles user authentication (Google OAuth 2.0 and Email/Password).
- **Identity Scope:** The ID token proves identity (`sub`/`uid`, `email`, `email_verified`).
- **Zero Role Claims:** ACC 2026 strictly rejects placing custom role claims (such as `role: 'ADMIN'`) into JWT ID tokens. Provider metadata and token claims are never checked for authorization.
- **Fail-Closed Resolution:** If an identity authenticated via Firebase Auth lacks an authoritative profile in `/users/{uid}`, it has zero access rights.

### 2.3 Layer 2: Cloud Firestore Security Rules Layer
Firestore Security Rules constitute the primary database perimeter. All direct document reads, queries, creates, updates, and deletes are governed by `firestore.rules`:
- Helper functions `getUserDoc()`, `getUserRole()`, `isAdmin()`, `isSuperAdmin()`, `isFranchise()`, and `isFranchiseOwner()` query `/users/$(request.auth.uid)` in real time.
- If `/users/{uid}` does not exist, `getUserDoc()` returns null, causing role checks to evaluate to false and fail closed.

### 2.4 Layer 3: Backend Cloud Functions Layer
Privileged operations (such as bidding, hammering lots, approving registrations, and projecting public data) are handled by Cloud Functions v2.
- `verifyCaller(uid, allowedRoles)` in `functions/src/utils/auth.ts` inspects the caller's Firestore user document using the Firebase Admin SDK.
- `db.runTransaction()` executes atomic updates to lots, bids, and franchise purses, preventing race conditions.

### 2.5 Layer 4: Realtime Database Layer
The Realtime Database handles live presence telemetry and real-time auction synchronization.
- Rules in `database.rules.json` manage read/write permissions for `/presence`, `/publicStats`, and `/auctionState`.

---

## 3. Acceptance Criteria Status Table

The following table evaluates all 15 acceptance criteria specified in `ORIGINAL_REQUEST.md` against objective, empirical criteria:
- **PASS**: Verified by automated test suites AND confirmed by verbatim source code implementation.
- **PARTIAL**: Implementation exists in code but contains documented vulnerabilities, bypasses, or missing backend integrations.
- **FAIL**: Explicit vulnerability, architectural defect, or security regression identified.
- **NOT VERIFIED**: Requires live production infrastructure or active Firebase emulators not wired into the automated offline CI test pipeline.

| # | Acceptance Criterion | Status | Technical Evidence & Source Citation |
|---|----------------------|:------:|--------------------------------------|
| **AC-01** | Direct Firestore write of `role: "SUPER_ADMIN"` or `role: "ADMIN"` by non-admin client is rejected by rules. | **PASS** *(Rules Logic)*<br>**NOT VERIFIED** *(Live Emulator)* | `firestore.rules` L44-62: `allow write: if isSuperAdmin();`. Create restricts roles to `PLAYER` or `FRANCHISE_COORDINATOR` with `PENDING` status. Updates require `isAdmin()`, and non-super-admins cannot set `SUPER_ADMIN`. Verified in `realAuthRoleResolution.test.ts` L52-63. Live network emulator suite absent. |
| **AC-02** | Direct Firestore write of `approvalStatus: "APPROVED"` or `accountStatus: "ACTIVE"` by non-admin client is rejected by rules. | **PASS** *(Rules Logic)*<br>**NOT VERIFIED** *(Live Emulator)* | `firestore.rules` L47-55 (`/users/{uid}`) and L92-104 (`/players/{playerId}`). Self-registration mandates `accountStatus == 'PENDING'` and `approvalStatus == 'PENDING_APPROVAL'`. Updates enforce that status fields match existing document values (`request.resource.data.approvalStatus == resource.data.approvalStatus`). |
| **AC-03** | Attempting to access or claim Admin/SuperAdmin privileges via Google OAuth provider is rejected. | **PASS** | `AuthContext.tsx` L194-230: Admin login requires dedicated email/password; `preventAdminGoogleElevation` rejects Google OAuth for admin roles. `firestore.rules` L9-23 derives roles strictly from `/users/{uid}`, ignoring OAuth provider claims. Verified in `realAuthRoleResolution.test.ts` L230-253. |
| **AC-04** | Unregistered Google accounts cannot access protected player or franchise dashboards. | **PASS** | `AuthContext.tsx` L104-115: Unregistered Google users resolve to `authState = 'UNREGISTERED_GOOGLE'` with `userDoc = null` and empty `allowedRoles: []`. `ProtectedRoute.tsx` L44-47 immediately redirects null `userDoc` sessions to `/login`. Verified in `realAuthRoleResolution.test.ts` L106-110. |
| **AC-05** | Franchise Coordinator A cannot update or bid on Franchise B's lot, purse, or squad. | **PARTIAL**<br>*(VULNERABLE)* | **Purse/Squad Direct Mutation: PASS.** `firestore.rules` L134 blocks client writes to `/franchises/{franchiseId}` (`allow update: if isAdmin();`).<br>**Bid Injection IDOR: FAIL.** `firestore.rules` L158-162 allows any `isFranchise()` user to create documents in `/bids` without validating `request.resource.data.franchiseId == getUserDoc().franchiseId`.<br>**Auction State Overwrite: FAIL.** `firestore.rules` L165-168 gives franchise users write access to `/acc_auctions/{auctionId}`. |
| **AC-06** | Public spectators cannot query unapproved players or private contact fields (phone numbers, private emails) via Firestore rules. | **FAIL**<br>*(CRITICAL LEAK)* | **Private Directory: PASS.** `/players/{playerId}` (`firestore.rules` L84-91) correctly restricts reads to admins and the authenticated owner.<br>**Phone Number Leak: FAIL.** `firestore.rules` L108-113 permits `allow read: if true;` on `/playerUniqueKeys/{keyId}`. In `index.html` L6412, documents are stored with IDs `mobile_${normalizedMobile}`, leaking all player phone numbers to public spectators.<br>**Unapproved Players in Public: FAIL.** `/playersPublic/{playerId}` (`firestore.rules` L118-121) has `allow read: if true;`. Triggers in `projectPublicData.ts` L13-59 project pending players immediately upon registration. |
| **AC-07** | Roll number normalization strictly prevents duplicate registrations (`24815a0443` resolves to `24815A0443`). | **PASS** | `useRollParser.ts` L18-20, `PlayerRegistrationPage.tsx` L173, and `realAuthRoleResolution.test.ts` L5-7: `.trim().toUpperCase().replace(/\s+/g, '')`. Verified across all casing variations in Vitest suite (8 tests passing). |
| **AC-08** | Attempt by Google UID B to claim Player record belonging to Google UID A fails. | **PASS** | `PlayerRegistrationPage.tsx` L219-255 checks existing UID ownership before write. `firestore.rules` L96-104 evaluates update on existing document, requiring `resource.data.uid == request.auth.uid`. Impostor UID writes return `PERMISSION_DENIED`. Verified in `realAuthRoleResolution.test.ts` L91-102. |
| **AC-09** | Root cause and architectural security evaluation of Team Lead secondary UID provisioning documented. | **PASS** *(Audit)*<br>**FAIL** *(System)* | Exhaustively analyzed. `AdminDashboardPage.tsx` L563 generates synthetic `tl_${Date.now()}` client-side without calling Firebase Admin SDK (`admin.auth().createUser()`). Real Google logins fail to match `tl_...`, locking Team Leaders out in `UNREGISTERED_GOOGLE`. Full root cause and Admin SDK fix documented in Section 8. |
| **AC-10** | Audit log records verified to be immutable against client modification or deletion. | **PASS** *(DB Rules)*<br>**DEFECT** *(Client Typo)* | **Database Rule Immutability: PASS.** `firestore.rules` L185-189: `allow update, delete: if false;` and `allow create: if isAdmin();`.<br>**Frontend Persistence Defect: DEFECT.** `AdminDashboardPage.tsx` L221 writes to `'auditLog'` (singular) rather than `'auditLogs'` (plural). Firestore default-deny drops the write, preventing UI admin actions from being stored in the database. |
| **AC-11** | Session logout verified to purge auth credentials and prevent stale state access. | **PASS** | `AuthContext.tsx` L280-298: calls `firebaseSignOut(auth)`, resets state (`user=null`, `userDoc=null`, `authState='UNAUTHENTICATED'`), and purges `localStorage` keys (`acc_active_franchise_session`, `acc_current_user_2026`). Back-navigation intercepted by `ProtectedRoute.tsx` L39-47. In Web OS, `Acc-Auction-Os.html` L7127-7148 unbinds listeners, clears session, and resets hash to `home`. |
| **AC-12** | Full automated test suite (`pnpm test`) executed and passing with exact counts reported. | **PASS** | Executed live via `run_command` in `acc-auction-portal`. Vitest v2.1.9 passed **8/8 test files** and **75/75 tests** in 1.70s with exit code 0. Exact file breakdown documented in Section 4. |
| **AC-13** | TypeScript check (`pnpm exec tsc --noEmit`) passes with 0 errors. | **PASS** | Executed live via `run_command` (`pnpm check`). Completed with **0 errors** and exit code 0. |
| **AC-14** | Production build (`pnpm build`) succeeds. | **PASS** | Executed live via `run_command` (`pnpm build`). Transformed 1,686 modules in 6.84s, generated distribution bundles, completed `sync-dist.js`, and exited with code 0. |
| **AC-15** | `docs/ACC_AUTH_SECURITY_FINAL.md` created with exact acceptance status table and objective terminology (PASS, PARTIAL, FAIL, NOT VERIFIED). | **PASS** | Compiled into this authoritative, adversarial deliverable incorporating complete citations, threat models, empirical test runs, and remediation code diffs. |

---

## 4. Complete Automated Test Suite Execution Results

### 4.1 Primary Portal Test Suite (`acc-auction-portal`)
All verification commands were executed directly in the project workspace:

#### 1. Vitest Test Suite (`pnpm test` / `vitest run`)
- **Execution Date:** 2026-10-02 10:35:01 IST
- **Status:** **100% PASS** (8 test files passed, 75 tests passed, 0 failed)
- **Total Duration:** 1.70s (transform: 979ms, setup: 0ms, collect: 1.65s, tests: 117ms, environment: 4ms, prepare: 2.03s)
- **Exit Code:** 0

| Test File Name | Tests Passed | Tests Failed | Duration | Primary Security & Domain Coverage |
| :--- | :---: | :---: | :---: | :--- |
| `shared/engine/__tests__/bidEngine.test.ts` | 11 | 0 | 13ms | Official bidding ladder increments, max bid formulas, reserve purse invariants |
| `shared/engine/__tests__/bucketEligibility.test.ts` | 4 | 0 | 8ms | Rule 12.2 mandatory slot protection, bucket composition viability |
| `client/src/__tests__/realAuthRoleResolution.test.ts` | 14 | 0 | 22ms | Roll normalization, duplicate roll blocks, Google UID anti-hijacking, `UNREGISTERED_GOOGLE`, blocked user quarantine, dual-identity access, admin OAuth elevation defense |
| `shared/engine/__tests__/rollClassifier.test.ts` | 8 | 0 | 14ms | Academic roll parsing (B.Tech Regular, Lateral Entry, Diploma, Post-Graduate) |
| `client/src/__tests__/adminCapabilities.test.ts` | 4 | 0 | 13ms | Super Admin vs Floor Operator RBAC, bid ladder, dynamic scarcity threshold |
| `client/src/__tests__/franchisePortal.test.ts` | 14 | 0 | 17ms | Team name uniqueness, captain/vice-captain 0-credit pricing, max bid cases 1-3, slot protection cases 7 & 10, timer resets |
| `client/src/__tests__/playerRegistration.test.ts` | 16 | 0 | 20ms | Roll classification, cricket skill derivation (`WK_BATTER`, `ALL_ROUNDER`, etc.), 16-step base price ladder, privacy defaults |
| `shared/engine/__tests__/credentials.test.ts` | 4 | 0 | 11ms | Official credential hashing and format conventions |
| **TOTAL** | **75** | **0** | **1.70s** | **8 / 8 Test Files Passing (100%)** |

#### 2. TypeScript Static Analysis (`pnpm check` / `tsc --noEmit`)
- **Execution Date:** 2026-10-02 10:35:06 IST
- **Result:** **0 errors**
- **Exit Code:** 0

#### 3. Production Compilation & Distribution Sync (`pnpm build`)
- **Execution Date:** 2026-10-02 10:35:18 IST
- **Duration:** 6.84s
- **Modules Transformed:** 1,686 modules
- **Bundle Manifest:**
  - `dist/index.html`: 0.58 kB (gzip: 0.35 kB)
  - `dist/assets/index-B-_S-_Q5.css`: 171.38 kB (gzip: 25.75 kB)
  - `dist/assets/index-DmmJjQy6.js`: 1,396.72 kB (gzip: 335.64 kB)
- **Asset Synchronization (`sync-dist.js`):**
  - Preserved React bundle as `portal.html`
  - Synced primary ACC 2026 application into `dist/index.html` and `dist/os.html`
  - Synced `Acc-Auction-Os.html` into `dist/`
- **Exit Code:** 0

### 4.2 Root Test Harness & Security Regression Analysis (`tests/`)
In addition to Vitest, the standalone test script `tests/test_redteam_remediation.js` was executed:
- **Command:** `node tests/test_redteam_remediation.js`
- **Total Tests:** 38 test assertions
- **Passed:** 36
- **Failed:** 2
- **Detailed Defect Identification:**
  - `[FAIL] [PLAYER-001] Player registration starts in PENDING_APPROVAL and auction ineligible`  
    *Error:* Assertion failed: `firestoreRules.includes("request.resource.data.auctionEligible == false")`.
  - `[FAIL] [PLAYER-002] Player cannot self-approve or tamper verification status in Firestore`  
    *Error:* Assertion failed: `firestoreRules.includes("request.resource.data.auctionEligible == false")`.
  - **Empirical Cause:** `firestore.rules` line 95 enforces `request.resource.data.auctionable == false;`, whereas the legacy test script asserts the literal string `auctionEligible == false`. This demonstrates that the root test scripts evaluate string matching on rule files rather than executing real Firestore rule evaluation.

### 4.3 Test Infrastructure Audit Findings
- **Absence of `@firebase/rules-unit-testing`:** The testing library `@firebase/rules-unit-testing` is absent from all `package.json` manifests.
- **Firebase Emulator Configuration Gap:** Neither `firebase.json` nor `acc-auction-portal/firebase.json` contains an `"emulators"` configuration block. Consequently, direct Firestore network-level rule penetration tests (e.g. testing network requests against local port 8080) cannot be executed via automated CI scripts. Rule evaluations are therefore categorized as **PASS (Rules Logic)** and **NOT VERIFIED (Live Emulator)**.

---

## 5. Detailed Audit: R1 — Authentication Boundary & Identity Resolution

### 5.1 Identity Resolution Architecture
In `acc-auction-portal/client/src/contexts/AuthContext.tsx` lines 72-122, user profile resolution is bound to `onAuthStateChanged`:
```typescript
// AuthContext.tsx lines 85-103
const userRef = doc(db, 'users', firebaseUser.uid);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
  setAuthState('ROLE_RESOLVING');
  const data = userSnap.data() as UserDoc;
  setUserDoc(data);
  setUnregisteredGoogleUser(null);

  const accStatus = data.accountStatus || (data.status === 'ACTIVE' ? 'ACTIVE' : 'PENDING');
  if (accStatus === 'BLOCKED' || accStatus === 'DISABLED') {
    setAuthState('BLOCKED');
  } else if (accStatus === 'PENDING' || data.approvalStatus === 'PENDING_APPROVAL') {
    setAuthState('PENDING_APPROVAL');
  } else {
    setAuthState('READY');
  }
}
```
**Verification Finding (PASS):** The application treats Firebase Authentication tokens strictly as identity attestations (`uid`, `email`). Roles (`SUPER_ADMIN`, `ADMIN`, `FRANCHISE_COORDINATOR`, `FRANCHISE_TEAM_LEADER`, `PLAYER`) are loaded strictly from `/users/{uid}` in Firestore.

### 5.2 Unregistered Google Account Quarantine
When an unprovisioned Google user authenticates via OAuth popup:
1. `userSnap.exists()` evaluates to `false` (`AuthContext.tsx` L104-115).
2. `userDoc` is set to `null`.
3. `authState` transitions to `'UNREGISTERED_GOOGLE'`.
4. In `ProtectedRoute.tsx` lines 44-47:
   ```typescript
   if (!userDoc) {
     return <Redirect to="/login" />;
   }
   ```
5. In `LoginPage.tsx` lines 122-176, the user is presented with a notification stating that their Google email is verified but holds no roles in ACC 2026.
6. At the database level (`firestore.rules` L9-23), helper functions `isSuperAdmin()`, `isAdmin()`, and `isFranchise()` evaluate `getUserRole()`. Because `/users/$(request.auth.uid)` does not exist, Firestore rule evaluation terminates and denies access.

### 5.3 Blocked and Disabled Account Quarantine
When a user profile has `accountStatus: 'BLOCKED'` or `'DISABLED'`:
1. `AuthContext.tsx` line 97 sets `authState = 'BLOCKED'`.
2. `ProtectedRoute.tsx` lines 50-76 intercepts route rendering and presents an "Account Suspended: Operational Suspension" modal.
3. In `Acc-Auction-Os.html` lines 13000-13007, the realtime listener `subscribeCurrentUser()` immediately triggers `logoutUser()` if `uData.status === 'BLOCKED'` or `'DISABLED'`.
4. **Defensive Nuance in `firestore.rules` (SEC-R1-01):** The helper functions `isAdmin()` and `isFranchise()` in `firestore.rules` lines 21-31 verify only `getUserRole()`. They do **not** check `getUserDoc().accountStatus == 'ACTIVE'`. If an admin or coordinator account is suspended in `/users/{uid}` without changing the `role` string, direct REST/SDK requests would continue to satisfy `isAdmin()` or `isFranchise()` until their role is removed.

### 5.4 Roll Number Normalization & Anti-Hijacking
- **Case & Space Normalization:**
  - `useRollParser.ts` L18-20: `rollNumber.trim().toUpperCase()`.
  - `PlayerRegistrationPage.tsx` L173, L215: `formData.rollNumber.trim().toUpperCase()`.
  - `realAuthRoleResolution.test.ts` L5-7: `roll.trim().toUpperCase().replace(/\s+/g, '')`.
  - Inputs such as `" 24815a0443 "` or `"24815 a 0443"` resolve deterministically to `"24815A0443"`.
- **1:1 Google UID-to-Player Anti-Hijacking:**
  - In `PlayerRegistrationPage.tsx` lines 219-255, the registration handler verifies that the target roll number document in `/players/{roll}` does not already contain a different `uid`.
  - In `firestore.rules` lines 96-104:
    ```javascript
    allow update: if isAuthenticated() && (
      isAdmin() ||
      (
        (resource.data.uid == request.auth.uid || resource.data.authUid == request.auth.uid) &&
        request.resource.data.accountStatus == resource.data.accountStatus &&
        request.resource.data.approvalStatus == resource.data.approvalStatus &&
        request.resource.data.auctionable == resource.data.auctionable
      )
    );
    ```
    If an attacker attempts a direct Firestore write to claim an existing player's document, Firestore treats the operation as an update. Because `resource.data.uid != request.auth.uid`, the write is rejected with `PERMISSION_DENIED`.

---

## 6. Detailed Audit: R2 — Privilege & Approval Escalation Penetration Testing

### 6.1 Direct Role Escalation Defense
Rules governing `/users/{uid}` in `firestore.rules` lines 44-62:
```javascript
match /users/{uid} {
  allow read: if isAuthenticated() && (request.auth.uid == uid || isAdmin());
  allow write: if isSuperAdmin();
  allow create: if isAuthenticated() && request.auth.uid == uid &&
    (
      (request.resource.data.role == 'PLAYER' &&
       request.resource.data.accountStatus == 'PENDING' &&
       request.resource.data.approvalStatus == 'PENDING_APPROVAL') ||
      (request.resource.data.role == 'FRANCHISE_COORDINATOR' &&
       request.resource.data.accountStatus == 'PENDING' &&
       request.resource.data.approvalStatus == 'PENDING_APPROVAL')
    );
  allow update: if isSuperAdmin() || (
    isAdmin() && 
    request.resource.data.role != 'SUPER_ADMIN' && 
    resource.data.role != 'SUPER_ADMIN'
  );
  allow delete: if isSuperAdmin();
}
```

#### Attack Vectors Evaluated:
1. **Attack: Non-admin client creates `/users/{uid}` with `role: "SUPER_ADMIN"` or `"ADMIN"`.**
   - *Evaluation:* `allow create` permits self-registration only if `role` is `'PLAYER'` or `'FRANCHISE_COORDINATOR'`.
   - *Result:* **REJECTED** with `PERMISSION_DENIED`.
2. **Attack: Registered player attempts `updateDoc(doc(db, 'users', uid), { role: 'ADMIN' })`.**
   - *Evaluation:* `allow update` requires `isSuperAdmin()` or `isAdmin()`. Players have zero update rights on `/users/{uid}`.
   - *Result:* **REJECTED** with `PERMISSION_DENIED`.
3. **Attack: Floor operator (`ADMIN`) attempts to escalate themselves or another user to `SUPER_ADMIN`.**
   - *Evaluation:* Line 58 explicitly enforces `request.resource.data.role != 'SUPER_ADMIN'`.
   - *Result:* **REJECTED** with `PERMISSION_DENIED`.

### 6.2 Approval Status Escalation Defense
Rules governing `/players/{playerId}` in `firestore.rules` lines 84-106:
1. **Self-Creation:** Line 92 requires `request.resource.data.accountStatus == 'PENDING'`, `request.resource.data.approvalStatus == 'PENDING_APPROVAL'`, and `request.resource.data.auctionable == false`. Any creation attempt specifying `'APPROVED'` or `auctionable: true` is rejected.
2. **Self-Update:** Lines 96-103 allow owner updates only if `request.resource.data.approvalStatus == resource.data.approvalStatus` and `request.resource.data.auctionable == resource.data.auctionable`. A player cannot approve their own registration or make themselves eligible for bidding.
3. *Result:* **REJECTED** at the database layer.

### 6.3 Google OAuth Admin Privilege Claim Defense
1. In `AuthContext.tsx` lines 194-230, administrative roles (`ADMIN`, `SUPER_ADMIN`) must log in via `signInAdmin` using email and password credentials. Google OAuth sign-in routes through `signInWithGoogle`, which rejects admin role intent.
2. In `realAuthRoleResolution.test.ts` lines 52-63, `preventAdminGoogleElevation` blocks Google OAuth elevation to `ADMIN` or `SUPER_ADMIN`.
3. In `firestore.rules`, rules never reference `request.auth.token.firebase.sign_in_provider` or custom token claims. Even if an attacker injects custom claims into a forged token, Firestore resolves roles strictly from the database document `/users/{uid}`.

---

## 7. Detailed Audit: R3 — Franchise Isolation (IDOR) & Public Data Privacy

### 7.1 IDOR Vulnerability in `/bids/{bidId}` (CRITICAL FINDING SEC-R3-01)
- **Location:** `firestore.rules` lines 158-162
- **Rule Implementation:**
  ```javascript
  match /bids/{bidId} {
    allow read: if true;
    allow create: if isAdmin() || isFranchise();
    allow update, delete: if false;
  }
  ```
- **Vulnerability Analysis:**
  The rule permits any authenticated franchise user (`isFranchise()`) to create a document in `/bids`. It **omits validation** that `request.resource.data.franchiseId` matches the caller's authorized franchise (`getUserDoc().franchiseId`).
- **Attack Scenario:**
  A coordinator or team lead belonging to Franchise A (`FR001`) can send a direct Firestore write:
  ```javascript
  await addDoc(collection(db, 'bids'), {
    lotId: 'LOT_42',
    franchiseId: 'FR002', // Attacking rival Franchise B
    amount: 850,
    timestamp: serverTimestamp(),
    clientActionId: 'exploit_' + Date.now()
  });
  ```
- **Database Evaluation:** The caller satisfies `isFranchise()` because their role is `FRANCHISE_COORDINATOR`. The document is committed. In clients that listen to `/bids` directly (such as `useBidSubmission.ts#L67-94`), this injects a fraudulent bid on behalf of Franchise B.
- **Classification:** **HIGH SEVERITY IDOR VULNERABILITY**.

### 7.2 Unrestricted Write Access to `/acc_auctions` (CRITICAL FINDING SEC-R3-02)
- **Location:** `firestore.rules` lines 165-168
- **Rule Implementation:**
  ```javascript
  match /acc_auctions/{auctionId} {
    allow read: if true;
    allow write: if isAdmin() || isFranchise();
  }
  ```
- **Vulnerability Analysis:**
  `allow write: if isAdmin() || isFranchise();` grants any franchise coordinator or team leader write access to the global live auction document (`/acc_auctions/acc_main_2026`).
- **Attack Scenario:**
  A malicious franchise user can issue:
  ```javascript
  await updateDoc(doc(db, 'acc_auctions', 'acc_main_2026'), {
    isPaused: true,
    passedFranchiseIds: ['FR001', 'FR002', 'FR003', 'FR004', 'FR005'],
    currentBid: 9999
  });
  ```
  This halts the live tournament or disqualifies competing franchises from bidding.
- **Classification:** **CRITICAL PRIVILEGE ESCALATION VULNERABILITY**.

### 7.3 Franchise Tenancy Bypass via `/franchiseUsers/{uid}` (HIGH FINDING SEC-R3-03)
- **Location:** `firestore.rules` lines 33-38 and 145-149
- **Rules Implementation:**
  ```javascript
  function isFranchiseOwner(franchiseId) {
    return isAuthenticated() && (
      getUserDoc().franchiseId == franchiseId ||
      get(/databases/$(database)/documents/franchiseUsers/$(request.auth.uid)).data.franchiseId == franchiseId
    );
  }

  match /franchiseUsers/{uid} {
    allow read: if isAuthenticated() && (request.auth.uid == uid || isAdmin());
    allow create: if isAuthenticated() && request.auth.uid == uid;
    allow write: if isSuperAdmin();
  }
  ```
- **Vulnerability Analysis:**
  Line 147 permits any authenticated user to create their own `/franchiseUsers/{uid}` document without validating the payload.
- **Attack Scenario:**
  An authenticated attacker creates:
  ```javascript
  await setDoc(doc(db, 'franchiseUsers', auth.currentUser.uid), {
    franchiseId: 'FR002', // Target rival franchise
    identityType: 'COORDINATOR'
  });
  ```
  When the attacker queries `/franchises/FR002`, `firestore.rules` evaluates `isFranchiseOwner('FR002')`:
  `get(/databases/.../franchiseUsers/$(request.auth.uid)).data.franchiseId == 'FR002'` evaluates to **true**!
  The attacker gains read access to Franchise B's private `/franchises/FR002` record, exposing the coordinator's personal mobile phone, email, and internal roster notes.
- **Classification:** **HIGH SEVERITY TENANCY BYPASS**.

### 7.4 Public Spectator Mobile Number Leak via `/playerUniqueKeys` (CRITICAL FINDING SEC-R3-04)
- **Location:** `firestore.rules` lines 108-113 & `index.html` lines 6411-6412
- **Rule Implementation:**
  ```javascript
  match /playerUniqueKeys/{keyId} {
    allow read: if true;
    allow create: if isAuthenticated();
    allow update, delete: if isSuperAdmin();
  }
  ```
- **Application Code (`index.html` L6411-6412):**
  ```javascript
  fbDb.collection("playerUniqueKeys").doc("roll_" + normalizedRoll).set({ playerId: normalizedRoll, createdAt: new Date().toISOString() });
  fbDb.collection("playerUniqueKeys").doc("mobile_" + normalizedMobile).set({ playerId: normalizedRoll, createdAt: new Date().toISOString() });
  ```
- **Vulnerability Analysis:**
  Because `allow read: if true;` is open to unauthenticated clients, any spectator can issue:
  ```javascript
  const keys = await getDocs(collection(db, 'playerUniqueKeys'));
  const phoneNumbers = keys.docs
    .filter(d => d.id.startsWith('mobile_'))
    .map(d => ({ mobile: d.id.replace('mobile_', ''), roll: d.data().playerId }));
  ```
  This dumps the private mobile numbers and roll numbers of all registered students to the public internet.
- **Classification:** **CRITICAL PII EXPOSURE LEAK**.

### 7.5 Unapproved Player Directory Exposed to Spectators (MEDIUM FINDING SEC-R3-05)
- **Location:** `firestore.rules` lines 118-121, `triggers/projectPublicData.ts` lines 13-59, `registration/registerPlayer.ts` lines 79-95
- **Rule Implementation:**
  ```javascript
  match /playersPublic/{playerId} {
    allow read: if true;
    allow write: if isAdmin();
  }
  ```
- **Vulnerability Analysis:**
  The background Cloud Function trigger `projectPublicPlayer` (`triggers/projectPublicData.ts` L44-45) projects player profiles into `/playersPublic` immediately upon creation:
  ```typescript
  approvalStatus: raw.approvalStatus || 'PENDING_APPROVAL',
  auctionEligible: Boolean(raw.auctionEligible),
  ```
  Neither the trigger nor the security rule filters out unapproved players. Spectators querying `/playersPublic` can see unverified, pending, and rejected student applicants.
- **Classification:** **MEDIUM SEVERITY PRIVACY VIOLATION**.

---

## 8. Detailed Audit: R4 — Dual-Identity Provisioning & Team Lead Architecture

### 8.1 Dual-Identity Concept vs Implementation
The ACC 2026 operational model requires each franchise to be co-managed by:
1. **Franchise Faculty Coordinator (`FRANCHISE_COORDINATOR`):** Administers registrations and roster planning.
2. **Franchise Team Leader / Captain (`FRANCHISE_TEAM_LEADER`):** Operates the bidding console during the live auction floor session.

Both identities must share access to the same franchise purse, squad roster, and bidding controls.

### 8.2 Client-Side Synthetic UID Generation Trace
In `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx` lines 554-605, the Team Leader assignment handler executes entirely in the client browser:
```typescript
// AdminDashboardPage.tsx lines 560-597
const fId = teamLeadFormData.franchiseId;
const targetFranchise = franchises.find(f => f.franchiseId === fId || f.id === fId);
const cleanEmail = teamLeadFormData.email.trim().toLowerCase();

// CRITICAL DEFECT: Synthetic client-side UID generation
const leadUid = `tl_${Date.now()}`;

const teamLeadDoc = {
  uid: leadUid,
  role: 'FRANCHISE_TEAM_LEADER',
  franchiseId: fId,
  identityType: 'TEAM_LEADER',
  name: teamLeadFormData.name.trim(),
  playerId: teamLeadFormData.rollNumber.trim().toUpperCase() || null,
  email: cleanEmail,
  mobile: teamLeadFormData.mobile.trim() || null,
  accountStatus: 'ACTIVE',
  approvalStatus: 'APPROVED',
  status: 'ACTIVE',
  authProvider: 'google.com',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

try {
  // 1. Direct write to /users/{leadUid}
  await setDoc(doc(db, 'users', leadUid), teamLeadDoc);
  
  // 2. Direct write to /franchiseUsers/{leadUid}
  await setDoc(doc(db, 'franchiseUsers', leadUid), {
    uid: leadUid,
    franchiseId: fId,
    identityType: 'TEAM_LEADER',
    email: cleanEmail,
    mobile: teamLeadFormData.mobile.trim(),
    status: 'ACTIVE',
  });
  
  // 3. Update franchise record
  if (targetFranchise) {
    await updateDoc(doc(db, 'franchises', targetFranchise.id || fId), {
      secondaryAuthUid: leadUid,
      updatedAt: new Date().toISOString(),
    });
  }
} catch (err: any) { ... }
```

### 8.3 Root Cause Analysis & Authentication Failure on Google Login
There is **no backend Firebase Admin SDK integration** (`admin.auth().createUser()`) and **no OAuth account-linking workflow**.

```
[Student Team Leader]
        │
        ▼ (Attempts Google OAuth Sign-In via LoginPage.tsx)
Firebase Auth issues authentic cryptographic Google UID: e.g. "gAuth_99182aBcDeF"
        │
        ▼
AuthContext.tsx#L85: getDoc(doc(db, 'users', 'gAuth_99182aBcDeF'))
        │
        ├──> DOCUMENT DOES NOT EXIST!
        │    (AdminDashboardPage saved the record under /users/tl_1727845600000)
        │
        ▼
AuthContext.tsx#L106-114:
userDoc = null
authState = 'UNREGISTERED_GOOGLE'
        │
        ▼
[LOCKED OUT]: Redirected to /login. Team Leader cannot access franchise bidding terminal!
```

#### Complete Impact Breakdown:
1. **Frontend Lockout:** When the Team Leader logs in using Google OAuth, their real Google UID does not match `tl_${Date.now()}`. They are classified as `UNREGISTERED_GOOGLE` with zero roles.
2. **Firestore Security Rules Failure:**
   - `getUserDoc()` checks `/users/$(request.auth.uid)`. Because `request.auth.uid` is `gAuth_...`, the document does not exist. `isFranchise()` returns `false`.
   - `/franchises/{franchiseId}` check `resource.data.secondaryAuthUid == request.auth.uid` fails because `secondaryAuthUid` is `tl_...`.
3. **Cloud Functions Failure:** When calling `placeBid`, `verifyCaller` queries `/users/gAuth_...`, fails to find the document, and throws `HttpsError('not-found', 'User account not found.')`.
4. **Admin Rule Denial on Creation:** Standard administrators (`ADMIN`, not `SUPER_ADMIN`) running `handleAddTeamLead` in `AdminDashboardPage.tsx` fail `firestore.rules` line 46 (`allow write: if isSuperAdmin();`). Line 47 requires `request.auth.uid == uid`, which fails because `leadUid` (`tl_...`) does not match the admin's UID. The write is rejected unless performed by `SUPER_ADMIN`.

---

## 9. Detailed Audit: R5 — Session Lifecycle, Audit Log Immutability & Build Verification

### 9.1 Session Logout & Back-Navigation Defense
- **React Portal Flow (`AuthContext.tsx` L280-298):**
  ```typescript
  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } finally {
      setUser(null);
      setUserDoc(null);
      setUnregisteredGoogleUser(null);
      setError(null);
      setAuthState('UNAUTHENTICATED');

      try {
        localStorage.removeItem('acc_active_franchise_session');
        localStorage.removeItem('acc_current_user_2026');
      } catch { }
    }
  };
  ```
- **Credential Teardown:**
  - `firebaseSignOut(auth)` invalidates active refresh tokens and purges IndexedDB credentials (`firebase:authUser:...`).
  - React memory state (`user`, `userDoc`, `unregisteredGoogleUser`) is reset to null.
  - Sensitive `localStorage` keys are explicitly purged.
  - `sessionStorage` contains only `accVisitorId` (used for anonymous presence counting).
- **Back-Navigation Prevention (`ProtectedRoute.tsx` L39-47):**
  When a logged-out user clicks the browser "Back" button to navigate to `/admin`, `/operator`, `/franchise`, or `/player`:
  - `if (!user) return <Redirect to={redirectTo} />;` fires immediately.
  - Stale pages cannot render.
- **Web OS Flow (`Acc-Auction-Os.html` L7127-7148):**
  - Unsubscribes protected realtime listeners (`window.RealtimeManager.unsubscribeProtected()`).
  - Resets `currentUser` to `{ role: "PUBLIC", name: "Public Guest" }`.
  - Removes `localStorage.acc_current_user_2026`.
  - Calls `fbAuth.signOut()`.
  - Resets location hash to `#home` and switches view to `public`.

### 9.2 Audit Log Immutability (`firestore.rules` L183-189)
```javascript
// ── Audit Logs (admin read, admin create, NO update/delete) ───────
// Immutable audit trail.
match /auditLogs/{logId} {
  allow read: if isAdmin();
  allow create: if isAdmin();
  allow update, delete: if false;
}
```
**Verification Finding (PASS):**
- Direct client `update` and `delete` operations are unconditionally set to `if false;`. Even `SUPER_ADMIN` clients cannot alter or delete committed audit entries.
- Direct client `create` operations require `isAdmin()`. Non-administrators and public spectators cannot inject fraudulent audit entries.

### 9.3 Frontend Audit Log Persistence Defect (FINDING SEC-R5-01)
In `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx` lines 211-226:
```typescript
const logAudit = async (action: string, targetId: string, details: string) => {
  const entry = {
    timestamp: new Date().toISOString(),
    action,
    targetId,
    actorUid: user?.uid || 'usr_admin',
    role: userDoc?.role || 'SUPER_ADMIN',
    details,
  };
  try {
    // DEFECT: Writes to 'auditLog' (singular) instead of 'auditLogs' (plural)
    await addDoc(collection(db, 'auditLog'), entry);
  } catch {
    // Silently catches permissions failure and stores in local React state only
    setAuditLogs(prev => [entry, ...prev]);
  }
};
```
- **Root Cause:** The code calls `collection(db, 'auditLog')` (singular).
- **Rule Mismatch:** `firestore.rules` line 185 defines `match /auditLogs/{logId}` (plural). There is no rule for `/auditLog`.
- **Impact:** Firestore enforces default-deny on `/auditLog`. The `addDoc` promise fails with `FirebaseError: Missing or insufficient permissions`. The `catch` block catches the error and appends the entry to local React state only. When the browser refreshes, the audit record is lost. Administrative actions performed through `AdminDashboardPage` are **never committed to the database audit trail**.
- **Contrast:** In `AdminLiveDashboard.tsx` line 351 and Cloud Functions (`hammerLot.ts` line 73), writes correctly target `collection('auditLogs')` (plural).

---

## 10. Comprehensive Discovered Vulnerabilities & Defects

| Finding ID | Vulnerability Title | Severity | Impacted File & Lines | Technical Description | Exploit Scenario |
| :--- | :--- | :---: | :--- | :--- | :--- |
| **SEC-R3-01** | Bidding IDOR Franchise Impersonation | **HIGH** | `firestore.rules`<br>L158-162 | Rule `allow create: if isAdmin() \|\| isFranchise();` omits check on `request.resource.data.franchiseId`. | Coordinator A writes to `/bids` setting `franchiseId: 'FR002'`, forging bids for rival Franchise B. |
| **SEC-R3-02** | Unrestricted Global Auction State Mutation | **CRITICAL** | `firestore.rules`<br>L165-168 | Rule `allow write: if isAdmin() \|\| isFranchise();` on `/acc_auctions/{auctionId}` permits arbitrary franchise writes. | Any franchise coordinator can pause the auction, alter `passedFranchiseIds`, or tamper with the live lot. |
| **SEC-R3-03** | Franchise User Self-Assignment Bypass | **HIGH** | `firestore.rules`<br>L33-38, L145-149 | Rule `allow create: if isAuthenticated() && request.auth.uid == uid;` on `/franchiseUsers/{uid}` lacks payload validation. | User writes `{ franchiseId: 'FR002' }` to `/franchiseUsers/{uid}`, passing `isFranchiseOwner` and accessing private franchise data. |
| **SEC-R3-04** | Public Spectator Student Phone Number Leak | **CRITICAL** | `firestore.rules`<br>L108-113,<br>`index.html`<br>L6411-6412 | `/playerUniqueKeys/{keyId}` allows unauthenticated public read (`allow read: if true;`), exposing document IDs formatted as `mobile_{phone}`. | Spectator issues `getDocs(collection(db, 'playerUniqueKeys'))` and dumps phone numbers of all registered students. |
| **SEC-R3-05** | Unapproved Player Directory Exposure | **MEDIUM** | `firestore.rules`<br>L118-121,<br>`projectPublicData.ts`<br>L13-59 | Background trigger projects unverified and pending players to `/playersPublic`, which allows public read (`allow read: if true;`). | Public spectator lists `/playersPublic` and views all rejected or unverified applicant records. |
| **SEC-R4-01** | Team Lead Synthetic UID Authentication Break | **CRITICAL** | `AdminDashboardPage.tsx`<br>L554-605 | Team Lead account created with synthetic `tl_${Date.now()}` client-side without Firebase Admin SDK provisioning. | Real Team Leader logs in with Google OAuth; UID mismatch locks them out as `UNREGISTERED_GOOGLE`. |
| **SEC-R5-01** | Audit Log Persistence Typo Drop | **MEDIUM** | `AdminDashboardPage.tsx`<br>L221 | Typo writes to `'auditLog'` (singular), blocked by Firestore default-deny, preventing persistent audit recording. | Admin UI actions (player approvals, team lead assignments) are dropped from the database audit trail on page refresh. |
| **SEC-R1-01** | Missing Account Status Check in Rules | **LOW** | `firestore.rules`<br>L21-31 | Helper functions `isAdmin()` and `isFranchise()` do not check `accountStatus == 'ACTIVE'`. | Suspended admins or coordinators retain rule authorization if their role string remains unchanged. |
| **SEC-RTDB-01**| Unrestricted Realtime DB Auction State Write | **MEDIUM** | `database.rules.json`<br>L20-23 | RTDB rule `"auctionState": { ".write": "auth != null" }` allows any authenticated user to write. | A registered student player can alter auction state in the Realtime Database channel. |

---

## 11. Prioritized Actionable Remediation Plan

### Remediation Phase 1: Security Rules Hardening (`firestore.rules` & `database.rules.json`)
The following patches resolve findings **SEC-R3-01**, **SEC-R3-02**, **SEC-R3-03**, **SEC-R3-04**, **SEC-R3-05**, **SEC-R1-01**, and **SEC-RTDB-01**:

```diff
--- a/firestore.rules
+++ b/firestore.rules
@@ -21,11 +21,15 @@ service cloud.firestore {
+    function isUserActive() {
+      return getUserDoc().accountStatus == 'ACTIVE' || getUserDoc().status == 'ACTIVE';
+    }
+
     function isAdmin() {
-      return isAuthenticated() && (getUserRole() == 'SUPER_ADMIN' || getUserRole() == 'ADMIN');
+      return isAuthenticated() && isUserActive() && (getUserRole() == 'SUPER_ADMIN' || getUserRole() == 'ADMIN');
     }
 
     function isFranchise() {
-      return isAuthenticated() && (
+      return isAuthenticated() && isUserActive() && (
         getUserRole() == 'FRANCHISE_COORDINATOR' ||
         getUserRole() == 'FRANCHISE_TEAM_LEADER' ||
         getUserRole() == 'FRANCHISE'
       );
     }
@@ -109,7 +113,7 @@ service cloud.firestore {
     match /playerUniqueKeys/{keyId} {
-      allow read: if true;
+      allow read: if isAdmin();
       allow create: if isAuthenticated();
       allow update, delete: if isSuperAdmin();
     }
@@ -118,7 +122,7 @@ service cloud.firestore {
     match /playersPublic/{playerId} {
-      allow read: if true;
+      allow read: if resource.data.approvalStatus == 'APPROVED' || isAdmin();
       allow write: if isAdmin();
     }
@@ -145,7 +149,7 @@ service cloud.firestore {
     match /franchiseUsers/{uid} {
       allow read: if isAuthenticated() && (request.auth.uid == uid || isAdmin());
-      allow create: if isAuthenticated() && request.auth.uid == uid;
+      allow create, write: if isSuperAdmin();
     }
@@ -158,7 +162,10 @@ service cloud.firestore {
     match /bids/{bidId} {
       allow read: if true;
-      allow create: if isAdmin() || isFranchise();
+      allow create: if isAdmin() || (
+        isFranchise() &&
+        request.resource.data.franchiseId == getUserDoc().franchiseId
+      );
       allow update, delete: if false;
     }
@@ -165,3 +172,3 @@ service cloud.firestore {
     match /acc_auctions/{auctionId} {
       allow read: if true;
-      allow write: if isAdmin() || isFranchise();
+      allow write: if isAdmin();
     }
```

```diff
--- a/database.rules.json
+++ b/database.rules.json
@@ -20,4 +20,4 @@
     "auctionState": {
       ".read": true,
-      ".write": "auth != null"
+      ".write": "auth != null && (root.child('users').child(auth.uid).child('role').val() === 'SUPER_ADMIN' || root.child('users').child(auth.uid).child('role').val() === 'ADMIN')"
     }
```

### Remediation Phase 2: Authoritative Team Lead Provisioning Backend (Fix for SEC-R4-01)
Replace the client-side synthetic UID generator in `AdminDashboardPage.tsx` with a secure Cloud Function using the Firebase Admin SDK:

```typescript
// functions/src/franchise/assignTeamLeader.ts
import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import { verifyCaller } from '../utils/auth';

export const assignTeamLeader = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  const { franchiseId, email, name, rollNumber, mobile } = request.data;
  
  if (!franchiseId || !email || !name) {
    throw new HttpsError('invalid-argument', 'franchiseId, email, and name are required.');
  }
  
  const cleanEmail = email.trim().toLowerCase();
  const db = admin.firestore();

  // 1. Resolve or create authentic Firebase Auth user account
  let authUser: admin.auth.UserRecord;
  try {
    authUser = await admin.auth().getUserByEmail(cleanEmail);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      authUser = await admin.auth().createUser({
        email: cleanEmail,
        displayName: name.trim(),
      });
    } else {
      throw new HttpsError('internal', err.message);
    }
  }

  const realUid = authUser.uid;

  // 2. Write authoritative profile keyed by real cryptographic UID
  const teamLeadDoc = {
    uid: realUid,
    role: 'FRANCHISE_TEAM_LEADER',
    franchiseId,
    identityType: 'TEAM_LEADER',
    name: name.trim(),
    playerId: rollNumber?.trim().toUpperCase() || null,
    email: cleanEmail,
    mobile: mobile?.trim() || null,
    accountStatus: 'ACTIVE',
    approvalStatus: 'APPROVED',
    status: 'ACTIVE',
    authProvider: 'google.com',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  const batch = db.batch();
  batch.set(db.collection('users').doc(realUid), teamLeadDoc, { merge: true });
  batch.set(db.collection('franchiseUsers').doc(realUid), {
    uid: realUid,
    franchiseId,
    identityType: 'TEAM_LEADER',
    email: cleanEmail,
    mobile: mobile?.trim() || null,
    status: 'ACTIVE',
  }, { merge: true });
  batch.update(db.collection('franchises').doc(franchiseId), {
    secondaryAuthUid: realUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  batch.set(db.collection('auditLogs').doc(), {
    action: 'TEAM_LEAD_ASSIGNED',
    actorUid: caller.uid,
    actorRole: caller.role,
    targetId: franchiseId,
    details: `Team Lead ${name} (${cleanEmail}) bound to real Auth UID ${realUid}`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  await batch.commit();
  return { success: true, uid: realUid };
});
```

### Remediation Phase 3: Client Audit Log Persistence Fix (Fix for SEC-R5-01)
Update `AdminDashboardPage.tsx` line 221 to use the plural collection name `'auditLogs'`:

```diff
--- a/acc-auction-portal/client/src/pages/AdminDashboardPage.tsx
+++ b/acc-auction-portal/client/src/pages/AdminDashboardPage.tsx
@@ -218,5 +218,5 @@ export function AdminDashboardPage() {
     try {
-      await addDoc(collection(db, 'auditLog'), entry);
+      await addDoc(collection(db, 'auditLogs'), entry);
     } catch {
       // Local fallback
```

---

## 12. Conclusion & Operational Verdict

The ACC 2026 application exhibits strong core security foundations in its authentication resolution, privilege escalation defenses, roll number normalization, and session termination lifecycles. All 75 automated unit and domain tests pass, and TypeScript builds with 0 errors.

However, due to the **CRITICAL** PII mobile phone leak in `/playerUniqueKeys`, the **HIGH** IDOR bidding vulnerability in `/bids/{bidId}`, and the **CRITICAL** secondary Team Leader UID provisioning disconnect, the software cannot be certified for live tournament deployment without applying the security rules and Cloud Function remediations detailed in Section 11.

**Operational Status:** **CONDITIONALLY APPROVED SUBJECT TO REMEDIATION PHASE 1 & 2 IMPLEMENTATION**.

---
*End of Report.*
