# Architecture & Security Investigation Report: Tenancy, IDOR Defense, Dual-Identity Provisioning & Audit Log Immutability (R3, R4, R5)

**Target Workspace:** `b:\projects\ACC`  
**Investigating Agent:** Tenancy & Architecture Explorer (`explorer_survey_tenancy_2`)  
**Parent Agent:** `7f068c7d-2f06-486e-9bdd-e40597973f6a`  
**Date:** 2026-10-02  
**Investigation Mode:** Read-Only Source Code & Rules Survey  

---

## Executive Summary

This investigation conducted a comprehensive, adversarial architectural review of the Avanthi Cricket Carnival (ACC 2026) codebase, focusing on **Requirement R3 (Franchise Tenancy & IDOR Defense)**, **Requirement R4 (Dual-Identity Provisioning & Team Lead Architecture)**, and **Requirement R5 (Audit Log Immutability)**.

### Core Discoveries:
1. **Critical IDOR & State Injection in Auction & Bidding (`firestore.rules` L158-168):**  
   - In `/bids/{bidId}`, rule `allow create: if isAdmin() || isFranchise();` does **not** validate that `request.resource.data.franchiseId` matches the caller's authorized franchise. A coordinator or team lead belonging to Franchise A can write arbitrary bids under Franchise B's ID directly to Firestore.
   - In `/acc_auctions/{auctionId}`, rule `allow write: if isAdmin() || isFranchise();` gives any franchise coordinator or team leader unrestricted write permissions over the global live auction document (`acc_main_2026`), allowing arbitrary manipulation of leading bids, paused status, and passed franchise arrays.
   - In `/franchiseUsers/{uid}`, rule `allow create: if isAuthenticated() && request.auth.uid == uid;` has **zero payload field validation**. An authenticated user can self-create `/franchiseUsers/{uid}` with `{ franchiseId: 'FRANCHISE_B' }`, which satisfies `isFranchiseOwner(franchiseId)` in `firestore.rules#L33-38`, granting unauthorized read access to Franchise B's private `/franchises` record and coordinator PII.

2. **Severe Public Spectator PII & Unapproved Player Exposure (`firestore.rules` L108-121, `projectPublicData.ts` L13-59):**  
   - `/playerUniqueKeys/{keyId}` has `allow read: if true;`. In `index.html#L6412`, documents are created with IDs formatted as `mobile_${normalizedMobile}` storing `{ playerId: normalizedRoll }`. Any unauthenticated spectator can dump this collection to harvest the private phone numbers and roll numbers of all registered players.
   - `/playersPublic/{playerId}` has `allow read: if true;`. The Firestore Cloud Function trigger `projectPublicPlayer` (`triggers/projectPublicData.ts#L13-59`) and Cloud Function `registerPlayer` (`registration/registerPlayer.ts#L79-95`) project players into `/playersPublic` immediately upon registration with `approvalStatus: 'PENDING_APPROVAL'` and `auctionEligible: false`. Unapproved, unverified player records are publicly exposed to spectators.

3. **Fatal Dual-Identity Architecture Disconnect (`AdminDashboardPage.tsx` L554-605):**  
   - Team Leader accounts are provisioned completely client-side in `AdminDashboardPage.tsx#L563` with synthetic IDs: `const leadUid = 'tl_' + Date.now();`.
   - There is **no backend Firebase Admin SDK integration** (`admin.auth().createUser()`) and **no OAuth account-linking workflow**.
   - When the actual human Team Leader authenticates via Google OAuth, Firebase Auth issues a real Google UID (`g...`). When `AuthContext.tsx#L85-115` queries `/users/{realUid}`, the document does not exist (the document was stored under `/users/tl_...`). The Team Leader is permanently classified as `UNREGISTERED_GOOGLE` with zero roles and denied all access. In `firestore.rules`, `request.auth.uid` never matches `secondaryAuthUid` (`tl_...`).

4. **Audit Log Immutability & Client-Side Persistence Defect (`firestore.rules` L183-189 vs `AdminDashboardPage.tsx` L221):**  
   - `/auditLogs/{logId}` correctly enforces immutability at the database level: `allow update, delete: if false;` and `allow create, read: if isAdmin();`.
   - However, in `AdminDashboardPage.tsx#L221`, administrative audit entries are written to `collection(db, 'auditLog')` (singular). Because `firestore.rules` only defines `/auditLogs` (plural), Firestore's default-deny drops the write with a permissions error. The frontend catch block swallows the error into local component state, meaning **admin operations performed via AdminDashboardPage are never written to the database audit trail**.

---

## Section 1: Franchise Tenancy & IDOR Defense (R3)

### 1.1 Architectural Mapping Across Collections

The ACC system stores franchise and auction data across several collections in Cloud Firestore:

| Collection Path | Firestore Security Rule (`firestore.rules`) | Stored Data & Sensitivity | Tenancy Isolation Status |
| :--- | :--- | :--- | :--- |
| `/franchises/{franchiseId}` | L124-136: Read: `isAdmin() \|\| isFranchiseOwner(franchiseId) \|\| resource.data.primaryAuthUid == request.auth.uid \|\| resource.data.secondaryAuthUid == request.auth.uid`. Write: `isSuperAdmin()`. Update: `isAdmin()`. | Initial/remaining purse, squad roster, bucket counts, coordinator private email/phone, captain/vice-captain IDs. | **PARTIALLY ISOLATED / VULNERABLE TO IDOR READ**: Direct client updates blocked; however, read gate is bypassable via `/franchiseUsers` self-assignment. |
| `/franchisesPublic/{franchiseId}` | L139-142: Read: `true`. Write: `isAdmin()`. | Public projection: team name, short code, purse remaining, public squad list, bucket counts. | **SECURE PROJECTION**: Strips coordinator/captain phone numbers and internal PINs. |
| `/bids/{bidId}` | L158-162: Read: `true`. Create: `isAdmin() \|\| isFranchise()`. Update/Delete: `false`. | Bid amount, franchiseId, lotId, timestamp, clientActionId. | **BROKEN / HIGH IDOR VULNERABILITY**: Any authenticated franchise user can inject bids for rival franchises. |
| `/acc_auctions/{auctionId}` | L165-168: Read: `true`. Write: `isAdmin() \|\| isFranchise()`. | Realtime auction state: current bid, leading bidder ID, passed franchise IDs, lot index, paused state. | **BROKEN / CRITICAL PRIVILEGE ESCALATION**: Any franchise coordinator or team leader can overwrite global auction state. |
| `/editions/{editionId}/auction/state` | L69-72: Read: `true`. Write: `isAdmin()`. | Authoritative backend auction state. | **SECURE**: Admin write only. |
| `/lots/{lotId}` | L152-155: Read: `true`. Write: `isAdmin()`. | Current price, highest bidder ID, timer deadline, lot status. | **SECURE**: Admin write only. |
| `/acquisitions/{acqId}` | L171-174: Read: `true`. Write: `isSuperAdmin()`. | Official player acquisition record linking player to franchise and price. | **SECURE**: Super Admin write only. |
| `/sales/{saleId}` | L176-181: Read: `true`. Create: `isAdmin()`. Update: `isSuperAdmin()`. Delete: `false`. | Final sale log. | **SECURE**: Admin create only. |
| `/franchiseUsers/{uid}` | L145-149: Read: `request.auth.uid == uid \|\| isAdmin()`. Create: `request.auth.uid == uid`. Write: `isSuperAdmin()`. | User UID to `franchiseId` and `identityType` mapping. | **VULNERABLE**: Client can self-assign any `franchiseId` on create. |

---

### 1.2 Identity Verification: Database UIDs vs Request Payload Fields

A secure multi-tenant architecture must **never** trust user-supplied tenant IDs (`franchiseId`) in request payloads; tenant identity must be resolved authoritatively from server-verified authentication tokens (`request.auth.uid`) linked to immutable database records.

#### Firestore Rules Analysis (`firestore.rules` L25-38):
```javascript
function isFranchise() {
  return isAuthenticated() && (
    getUserRole() == 'FRANCHISE_COORDINATOR' ||
    getUserRole() == 'FRANCHISE_TEAM_LEADER' ||
    getUserRole() == 'FRANCHISE'
  );
}

function isFranchiseOwner(franchiseId) {
  return isAuthenticated() && (
    getUserDoc().franchiseId == franchiseId ||
    get(/databases/$(database)/documents/franchiseUsers/$(request.auth.uid)).data.franchiseId == franchiseId
  );
}
```

1. **Defect in `/bids/{bidId}` (L158-162):**
   ```javascript
   match /bids/{bidId} {
     allow read: if true;
     allow create: if isAdmin() || isFranchise();
     allow update, delete: if false;
   }
   ```
   - Notice that `allow create` only tests `isFranchise()`.
   - It **fails** to verify that `request.resource.data.franchiseId` matches `getUserDoc().franchiseId` or satisfies `isFranchiseOwner(request.resource.data.franchiseId)`.
   - **Result:** An authenticated coordinator of Franchise A can create a document in `/bids` where `franchiseId` is set to `FRANCHISE_B`.

2. **Defect in `/franchiseUsers/{uid}` (L145-149):**
   ```javascript
   match /franchiseUsers/{uid} {
     allow read: if isAuthenticated() && (request.auth.uid == uid || isAdmin());
     allow create: if isAuthenticated() && request.auth.uid == uid;
     allow write: if isSuperAdmin();
   }
   ```
   - On document creation, any authenticated user (`request.auth.uid == uid`) can write an arbitrary document payload:
     ```json
     {
       "uid": "attacker_uid",
       "franchiseId": "FRANCHISE_B",
       "identityType": "COORDINATOR",
       "status": "ACTIVE"
     }
     ```
   - Once this document is created, the rule function `isFranchiseOwner('FRANCHISE_B')` evaluates:
     `get(/databases/$(database)/documents/franchiseUsers/$(request.auth.uid)).data.franchiseId == 'FRANCHISE_B'` -> **TRUE**!
   - Consequently, the attacker passes `isFranchiseOwner(franchiseId)` in `/franchises/{franchiseId}` (L127) and gains unauthorized read access to Franchise B's private coordinator mobile number, email, and internal roster notes!

#### Cloud Functions Verification (`functions/src/utils/auth.ts` L19-50):
```typescript
export async function verifyCaller(uid: string | undefined, allowedRoles: UserRole[]): Promise<CallerInfo> {
  if (!uid) throw new HttpsError('unauthenticated', 'Authentication required.');
  const userDoc = await db.collection('users').doc(uid).get();
  if (!userDoc.exists) throw new HttpsError('not-found', 'User account not found.');
  const data = userDoc.data()!;
  const role = data.role as UserRole;
  if (!allowedRoles.includes(role)) {
    throw new HttpsError('permission-denied', `Role ${role} is not authorized for this operation.`);
  }
  return { uid, role, franchiseId: data.franchiseId || null };
}

export async function resolveFranchiseId(caller: CallerInfo): Promise<string> {
  if (caller.role === 'FRANCHISE_COORDINATOR' || caller.role === 'FRANCHISE_TEAM_LEADER') {
    if (!caller.franchiseId) {
      const fuDoc = await db.collection('franchiseUsers').doc(caller.uid).get();
      if (!fuDoc.exists) throw new HttpsError('not-found', 'Franchise user mapping not found.');
      return fuDoc.data()!.franchiseId;
    }
    return caller.franchiseId;
  }
  throw new HttpsError('permission-denied', 'Caller is not a franchise user.');
}
```
- In Cloud Function `placeBid` (`functions/src/auction/placeBid.ts#L19-27`), non-admin requests resolve `franchiseId` via `resolveFranchiseId(caller)`. The payload parameter `request.data.franchiseId` is ignored for non-admins.
- **However, `verifyCaller` has a critical vulnerability:** It never verifies `accountStatus === 'ACTIVE'` or `approvalStatus === 'APPROVED'`. An unapproved user who registers via self-service `/users/{uid}` with `role: 'FRANCHISE_COORDINATOR'` and `franchiseId: 'FRANCHISE_B'` will pass `verifyCaller` and can invoke `placeBid` and `passFranchise` for Franchise B!

---

### 1.3 Cross-Franchise Mutation & Bidding Attack Vectors

Can a coordinator or captain of Franchise A read, bid, or modify purse/squad data of Franchise B?

1. **Can Coordinator A modify Franchise B's purse or squad directly in Firestore?**  
   - **Direct `/franchises` update:** **BLOCKED**. `firestore.rules#L134` states `allow update: if isAdmin();`. Non-admins cannot update documents in `/franchises` via direct Firestore SDK.
   - **Direct `/lots` update:** **BLOCKED**. `firestore.rules#L154` states `allow write: if isAdmin();`.
   - **Purse deduction logic:** Authoritative purse deduction happens only inside `hammerLot` (`functions/src/auction/hammerLot.ts#L55-60`), which requires `SUPER_ADMIN` or `ADMIN`.

2. **Can Coordinator A bid on behalf of Franchise B?**  
   - **Via Cloud Function `placeBid`:** If Coordinator A has an approved user doc with `franchiseId: 'FRANCHISE_A'`, `placeBid` overrides the payload with `FRANCHISE_A`.
   - **Via Direct Firestore Write to `/bids`:** **ALLOWED (VULNERABILITY)**. Because `useBidSubmission.ts#L67-94` contains a fallback direct-write path and `firestore.rules#L160` allows `create: if isAdmin() || isFranchise();`, Coordinator A can forge a bid document with `franchiseId: 'FRANCHISE_B'`.
   - **Via Direct Firestore Write to `/acc_auctions/acc_main_2026`:** **ALLOWED (VULNERABILITY)**. Under `firestore.rules#L167` (`allow write: if isAdmin() || isFranchise();`), Coordinator A can directly overwrite `leadingBidderId: 'FRANCHISE_B'` and `currentBid: 500`.

3. **Can Coordinator A pass or unpass Franchise B?**  
   - **Via Direct Firestore Write to `/acc_auctions`:** **ALLOWED (VULNERABILITY)**. Coordinator A can mutate `passedFranchiseIds` directly in `/acc_auctions/acc_main_2026`.

---

### 1.4 Public Spectator Data Access & PII Leakage

The problem statement requires verifying that public spectators cannot query unapproved players or private PII (player phone numbers, private emails, auth UIDs, or internal account metadata) through direct Firestore/public API queries.

#### Finding 1: Direct Player Phone Number Leak via `/playerUniqueKeys` (CRITICAL)
- **Location:** `firestore.rules` L108-113 & `index.html` L6411-6412
- **Rule:**
  ```javascript
  match /playerUniqueKeys/{keyId} {
    allow read: if true;
    allow create: if isAuthenticated();
    allow update, delete: if isSuperAdmin();
  }
  ```
- **Code implementation in `index.html`:**
  ```javascript
  fbDb.collection("playerUniqueKeys").doc("roll_" + normalizedRoll).set({ playerId: normalizedRoll, createdAt: new Date().toISOString() });
  fbDb.collection("playerUniqueKeys").doc("mobile_" + normalizedMobile).set({ playerId: normalizedRoll, createdAt: new Date().toISOString() });
  ```
- **Vulnerability:** Because `allow read: if true;` is open to unauthenticated clients, any public spectator can issue `getDocs(collection(db, 'playerUniqueKeys'))`. Every document whose ID begins with `mobile_` exposes the private mobile number of a student player directly to the public web!

#### Finding 2: Unapproved Player Directory Exposed to Spectators (HIGH)
- **Location:** `firestore.rules` L118-121, `triggers/projectPublicData.ts` L13-59, `registration/registerPlayer.ts` L79-95
- **Rule:**
  ```javascript
  match /playersPublic/{playerId} {
    allow read: if true;
    allow write: if isAdmin();
  }
  ```
- **Trigger Code (`projectPublicPlayer`):**
  ```typescript
  export const projectPublicPlayer = onDocumentWritten('players/{playerId}', async (event) => {
    ...
    const publicData: Record<string, any> = {
      id: playerId,
      name: raw.name || 'Player',
      ...
      approvalStatus: raw.approvalStatus || 'PENDING_APPROVAL',
      auctionEligible: Boolean(raw.auctionEligible),
    };
    await db.collection('playersPublic').doc(playerId).set(publicData, { merge: true });
  });
  ```
- **Vulnerability:** Neither the Cloud Function projection trigger nor the security rule restricts public visibility to approved/verified players. As soon as a student registers, their record is written to `/playersPublic` with `approvalStatus: 'PENDING_APPROVAL'`. Unauthenticated spectators can list all unapproved and rejected applicants.

#### Finding 3: Private Player Directory (`/players/{playerId}`) Boundary Holds
- **Location:** `firestore.rules` L84-91
- **Rule:**
  ```javascript
  match /players/{playerId} {
    allow read: if isAuthenticated() && (
      isAdmin() ||
      resource.data.uid == request.auth.uid ||
      resource.data.authUid == request.auth.uid ||
      resource.data.rollNumber == request.auth.uid ||
      resource.data.rollNumberNormalized == request.auth.uid
    );
  ```
- **Evaluation:** Direct reads of `/players/{playerId}` by spectators or unauthorized users are **correctly denied**. Only the authenticated player themselves or an administrator can read the authoritative record containing `emailPrivate`, `mobilePrivate`, and `cricheroes.registeredMobilePrivate`.
- **Note on Client Query Failure:** In `PlayerRegistrationPage.tsx#L182-183` and `FranchiseRegistrationPage.tsx#L132`, client components attempt to run `query(collection(db, 'players'), ...)` before user login. These queries are rejected by Firestore security rules, triggering client-side `catch` fallbacks.

---

## Section 2: Dual-Identity Provisioning & Team Lead Architecture (R4)

### 2.1 Dual-Identity Concept vs Implementation

The tournament rules establish that each of the 11 franchises operates under a dual-identity command structure:
1. **Franchise Faculty Coordinator (`FRANCHISE_COORDINATOR`):** Manages franchise administration, registrations, and official approvals.
2. **Franchise Team Leader / Captain (`FRANCHISE_TEAM_LEADER`):** Operates the live bidding terminal, executing real-time bids during the auction.

Both identities must share access to the same franchise purse, squad roster, and bidding state.

---

### 2.2 Trace of Team Lead Account Provisioning (`AdminDashboardPage.tsx`)

In the current codebase, the Team Leader assignment workflow is executed on the frontend inside `acc-auction-portal/client/src/pages/AdminDashboardPage.tsx` at lines 554-605:

```typescript
// acc-auction-portal/client/src/pages/AdminDashboardPage.tsx#L554-605
const handleAddTeamLead = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!teamLeadFormData.franchiseId || !teamLeadFormData.name || !teamLeadFormData.email) {
    showToast("Franchise, name, and email are required.", "warning");
    return;
  }
  const fId = teamLeadFormData.franchiseId;
  const targetFranchise = franchises.find(f => f.franchiseId === fId || f.id === fId);
  const cleanEmail = teamLeadFormData.email.trim().toLowerCase();
  
  // SYNTHETIC CLIENT-SIDE UID GENERATION
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
    
    // 3. Update /franchises/{franchiseId}.secondaryAuthUid
    if (targetFranchise) {
      await updateDoc(doc(db, 'franchises', targetFranchise.id || fId), {
        secondaryAuthUid: leadUid,
        updatedAt: new Date().toISOString(),
      });
    }
    await logAudit('TEAM_LEAD_ASSIGNED', fId, `Team Lead ${teamLeadFormData.name} (${cleanEmail}) assigned to ${targetFranchise?.name || fId}`);
    showToast(`Team Leader authorized for ${targetFranchise?.name || fId}.`);
    setTeamLeadModal(false);
  } catch (err: any) {
    showToast(`Failed to assign team lead: ${err.message}`, "error");
  }
};
```

---

### 2.3 Evaluation of Backend Authority & Architecture

#### Absence of Authoritative Backend Provisioning
- **No Cloud Function:** There is no Cloud Function endpoint (e.g. `addTeamLead.ts` or `assignFranchiseLead.ts`) in `functions/src/`.
- **No Firebase Admin Auth SDK:** Neither `admin.auth().createUser()` nor `admin.auth().getUserByEmail()` is ever called to create or resolve a real Firebase Authentication user record for the Team Leader.
- **No OAuth Email-Linking / Invitation Flow:** There is no email verification link, magic link, or pre-registration mapping table that binds incoming Google OAuth logins with pre-authorized franchise leadership roles.

---

### 2.4 Authentication Breakdown on Google Login

When the assigned student Team Leader attempts to log in to the ACC portal:

```
[Student Team Leader]
        │
        ▼ (Google OAuth Sign-In)
Firebase Authentication generates real cryptographic UID: e.g. "q8k1Nm9LPxZ3..."
        │
        ▼
AuthContext.tsx#L85: getDoc(doc(db, 'users', 'q8k1Nm9LPxZ3...'))
        │
        ├──> Document /users/q8k1Nm9LPxZ3... DOES NOT EXIST!
        │    (AdminDashboardPage wrote the record to /users/tl_1727845600000)
        │
        ▼
AuthContext.tsx#L106-114:
userDoc = null
authState = 'UNREGISTERED_GOOGLE'
        │
        ▼
Result: Team Leader is permanently locked out!
```

#### Firestore Security Rules Failure:
1. `getUserDoc()`: Evaluates `get(/databases/$(database)/documents/users/$(request.auth.uid)).data`. Returns `null` because `request.auth.uid` is `q8k1...`, not `tl_...`.
2. `isFranchise()`: Evaluates `getUserRole() == 'FRANCHISE_TEAM_LEADER'`. Returns `false`.
3. `isFranchiseOwner(franchiseId)`: Checks `/franchiseUsers/$(request.auth.uid)`. Document does not exist (it was written to `/franchiseUsers/tl_...`). Returns `false`.
4. `/franchises/{franchiseId}`: Checks `resource.data.secondaryAuthUid == request.auth.uid`. Fails because `secondaryAuthUid` is `tl_...` while `request.auth.uid` is `q8k1...`. Returns `false`.
5. Cloud Functions (`placeBid`, `passFranchise`): `verifyCaller` looks up `/users/q8k1...`, throws `HttpsError('not-found', 'User account not found.')`.

#### Admin Rule Failure for Non-Super-Admins:
In `AdminDashboardPage.tsx#L583`, `setDoc(doc(db, 'users', leadUid), teamLeadDoc)` is called by the currently logged-in admin.  
Under `firestore.rules#L44-62`:
- `allow write: if isSuperAdmin();`
- `allow create: if isAuthenticated() && request.auth.uid == uid && ...`
If a standard `ADMIN` (not `SUPER_ADMIN`) attempts to add a Team Leader, `leadUid` does not match `request.auth.uid`. The write is **denied by Firestore rules**.

---

### 2.5 Security Implications & Client Credential Handling

1. **Denial of Service (DoS) of Team Leader Role:** Because the synthetic UID is permanently detached from the OAuth UID, no real Team Leader can ever log in or place bids.
2. **Ghost Records in Database:** Every team lead creation leaves orphaned documents in `/users` and `/franchiseUsers` that correspond to no authenticated principal.
3. **Insecure Identity Assumption:** If an attacker discovers or guesses the synthetic UID scheme, or if an insecure endpoint were exposed that accepted arbitrary UIDs, there would be no cryptographic token validation backing the user document.

---

## Section 3: Audit Log Immutability & Persistence (R5 Part)

### 3.1 Verification of `/auditLogs` Security Rules

In `firestore.rules` at lines 183-189:
```javascript
// ── Audit Logs (admin read, admin create, NO update/delete) ───────
// Immutable audit trail.
match /auditLogs/{logId} {
  allow read: if isAdmin();
  allow create: if isAdmin();
  allow update, delete: if false;
}
```

#### Rule Analysis & Verification:
- **Immutability Against Updates:** `allow update: if false;` strictly prevents any client-side update operation. Even a logged-in `SUPER_ADMIN` or `ADMIN` client cannot modify an existing audit log entry via Firestore SDK.
- **Immutability Against Deletions:** `allow delete: if false;` strictly blocks any client-side document deletion. Even a logged-in `SUPER_ADMIN` or `ADMIN` cannot purge audit logs.
- **Creation Control:** `allow create: if isAdmin();` restricts audit log injection to verified administrators. Spectators, players, and franchise coordinators cannot inject fake audit log entries.
- **Read Privacy:** `allow read: if isAdmin();` prevents non-administrators from inspecting sensitive administrative actions, timestamps, and target IDs.

---

### 3.2 Frontend Persistence Defect in `AdminDashboardPage.tsx`

Despite the robust security rules in `firestore.rules`, an architectural and spelling bug exists in the frontend:

```typescript
// acc-auction-portal/client/src/pages/AdminDashboardPage.tsx#L211-226
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
    // BUG: Writes to 'auditLog' (singular) instead of 'auditLogs' (plural)
    await addDoc(collection(db, 'auditLog'), entry);
  } catch {
    // Silently catches permissions failure and stores in local React state only
    setAuditLogs(prev => [entry, ...prev]);
  }
};
```

1. **Root Cause:** The function calls `collection(db, 'auditLog')` (singular).
2. **Firestore Rule Mismatch:** `firestore.rules` defines `match /auditLogs/{logId}` (plural). There is **no match rule for `/auditLog`**.
3. **Behavior:** Firestore applies default-deny to `/auditLog`. The `addDoc` promise is rejected with `FirebaseError: Missing or insufficient permissions`.
4. **Impact:** The `catch` block catches the error and silently sets `setAuditLogs(prev => [entry, ...prev])`. The audit log appears in the administrator's UI during the current session, but is **never saved to the database**. When the browser refreshes, the audit record is lost.
5. **Contrast:** In `AdminLiveDashboard.tsx#L351` and in backend Cloud Functions (`hammerLot.ts#L73`, `approvePlayer.ts#L23`, `approveFranchise.ts#L30`), the code correctly writes to `collection('auditLogs')` (plural).

---

## Section 4: Comprehensive Vulnerability Matrix

| Finding ID | Classification | Severity | Affected Component & Line | Impact Description | Remediation Architecture |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **SEC-R3-01** | Bidding IDOR Injection | **HIGH** | `firestore.rules` L158-162 | Franchise A can create bids under Franchise B's `franchiseId` directly in `/bids`. | Add payload check in rules: `request.resource.data.franchiseId == getUserDoc().franchiseId`. |
| **SEC-R3-02** | Auction State Hijacking | **CRITICAL** | `firestore.rules` L164-168 | Any franchise user can overwrite global live auction state (`/acc_auctions/acc_main_2026`). | Restrict `/acc_auctions/{auctionId}` write to `isAdmin()`. Franchise actions must use Cloud Functions. |
| **SEC-R3-03** | Franchise Tenancy Bypass | **HIGH** | `firestore.rules` L33-38, L145-149 | Users can self-create `/franchiseUsers/{uid}` with arbitrary `franchiseId`, gaining read access to rival franchise private data. | Remove client create on `/franchiseUsers/{uid}`; restrict creation to Admin/Cloud Functions. |
| **SEC-R3-04** | Direct PII Leakage | **CRITICAL** | `firestore.rules` L108-113, `index.html` L6411-6412 | Unauthenticated spectators can list `/playerUniqueKeys` and harvest player mobile numbers (`mobile_...`). | Set `allow read: if isAdmin();` on `/playerUniqueKeys`. |
| **SEC-R3-05** | Unapproved Player Exposure | **MEDIUM** | `firestore.rules` L118-121, `triggers/projectPublicData.ts` L13-59 | Spectators can query unapproved/pending players via `/playersPublic`. | Restrict `/playersPublic` read rule to `resource.data.approvalStatus == 'APPROVED'` or filter in trigger. |
| **SEC-R4-01** | Team Lead Provisioning Break | **CRITICAL** | `AdminDashboardPage.tsx` L554-605 | Client generates synthetic UID `tl_${Date.now()}`. Real Google Auth UID never matches; Team Leader locked out in `UNREGISTERED_GOOGLE`. | Create authoritative Cloud Function `assignTeamLeader` using Firebase Admin SDK or an email-binding table. |
| **SEC-R5-01** | Audit Log Dropped on Admin Actions | **MEDIUM** | `AdminDashboardPage.tsx` L221 | Typo writes to `'auditLog'` (singular), blocked by Firestore default-deny, preventing audit persistence. | Change `collection(db, 'auditLog')` to `collection(db, 'auditLogs')`. |

---

## Section 5: Architectural Recommendations & Remediation Blueprint

### 1. Fix Franchise Tenancy in `firestore.rules`
```javascript
// Remediated /bids rule
match /bids/{bidId} {
  allow read: if true;
  allow create: if isAdmin() || (
    isFranchise() &&
    request.resource.data.franchiseId == getUserDoc().franchiseId &&
    getUserDoc().accountStatus == 'ACTIVE' &&
    getUserDoc().approvalStatus == 'APPROVED'
  );
  allow update, delete: if false;
}

// Remediated /acc_auctions rule
match /acc_auctions/{auctionId} {
  allow read: if true;
  allow write: if isAdmin(); // Strictly disallow direct franchise client writes
}

// Remediated /franchiseUsers rule
match /franchiseUsers/{uid} {
  allow read: if isAuthenticated() && (request.auth.uid == uid || isAdmin());
  allow create, write: if isSuperAdmin(); // Prevent client self-assignment
}

// Remediated /playerUniqueKeys rule
match /playerUniqueKeys/{keyId} {
  allow read: if isAdmin(); // Never allow public spectator reads of phone numbers
  allow create: if isAuthenticated();
  allow update, delete: if isSuperAdmin();
}

// Remediated /playersPublic rule
match /playersPublic/{playerId} {
  allow read: if resource.data.approvalStatus == 'APPROVED' || isAdmin();
  allow write: if isAdmin();
}
```

### 2. Remediate Team Lead Provisioning Architecture (R4)
Implement a Cloud Function `assignTeamLeader` backed by Firebase Admin SDK:
```typescript
export const assignTeamLeader = onCall(async (request) => {
  const caller = await verifyCaller(request.auth?.uid, ['SUPER_ADMIN', 'ADMIN']);
  const { franchiseId, email, name, rollNumber, mobile } = request.data;
  const cleanEmail = email.trim().toLowerCase();

  // 1. Check if user already exists in Firebase Auth
  let authUser;
  try {
    authUser = await admin.auth().getUserByEmail(cleanEmail);
  } catch (err: any) {
    if (err.code === 'auth/user-not-found') {
      authUser = await admin.auth().createUser({
        email: cleanEmail,
        displayName: name,
      });
    } else {
      throw err;
    }
  }

  const realUid = authUser.uid;

  // 2. Authoritative database record keyed by realUid
  await db.collection('users').doc(realUid).set({
    uid: realUid,
    role: 'FRANCHISE_TEAM_LEADER',
    franchiseId,
    identityType: 'TEAM_LEADER',
    name,
    email: cleanEmail,
    mobile,
    playerId: rollNumber || null,
    accountStatus: 'ACTIVE',
    approvalStatus: 'APPROVED',
    authProvider: 'google.com',
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  }, { merge: true });

  await db.collection('franchiseUsers').doc(realUid).set({
    uid: realUid,
    franchiseId,
    identityType: 'TEAM_LEADER',
    email: cleanEmail,
    mobile,
    status: 'ACTIVE',
  });

  await db.collection('franchises').doc(franchiseId).update({
    secondaryAuthUid: realUid,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  await db.collection('auditLogs').add({
    action: 'TEAM_LEAD_ASSIGNED',
    actorUid: caller.uid,
    actorRole: caller.role,
    entityId: franchiseId,
    details: `Team Lead ${name} (${cleanEmail}) bound to UID ${realUid}`,
    timestamp: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true, uid: realUid };
});
```

---
*End of Report.*
